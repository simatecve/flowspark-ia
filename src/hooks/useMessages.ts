
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWebhookSender } from '@/hooks/useWebhookSender';
import type { Message, CreateMessageData, SendMessageToConversationData } from '@/types/messages';

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sendWebhook } = useWebhookSender();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId, user?.id],
    queryFn: async () => {
      if (!conversationId || !user) return [];
      
      console.log('Fetching messages for conversation:', conversationId, 'user:', user?.id);
      
      // Verificar que la conversación pertenece al usuario antes de obtener mensajes
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('user_id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (convError || !conversation) {
        console.error('Error verifying conversation ownership:', convError);
        throw new Error('Access denied to this conversation');
      }

      // Obtener las instancias del usuario para verificar que los mensajes son válidos
      const { data: userConnections, error: connectionsError } = await supabase
        .from('whatsapp_connections')
        .select('name')
        .eq('user_id', user.id);

      if (connectionsError) {
        console.error('Error fetching user connections:', connectionsError);
        throw connectionsError;
      }

      const userInstanceNames = userConnections?.map(conn => conn.name) || [];
      
      // Fetch messages - solo los de las instancias del usuario
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .in('instance_name', userInstanceNames)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log('Fetched messages for user instances:', data);
      return data as Message[];
    },
    enabled: !!conversationId && !!user,
  });

  // Mutación para enviar mensaje a una conversación específica (solo webhook, no guardar en BD)
  const sendMessageToConversationMutation = useMutation({
    mutationFn: async (messageData: SendMessageToConversationData) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Sending message to conversation:', messageData);

      // Verificar que la conversación pertenece al usuario
      const { data: conversationInfo, error: convError } = await supabase
        .from('conversations')
        .select(`
          whatsapp_number, 
          pushname, 
          user_id
        `)
        .eq('id', messageData.conversation_id)
        .eq('user_id', user.id)
        .single();

      if (convError || !conversationInfo) {
        throw new Error('Error obteniendo información de la conversación o acceso denegado');
      }

      // Obtener el primer mensaje de la conversación para verificar la instancia
      const { data: firstMessage, error: msgError } = await supabase
        .from('messages')
        .select('instance_name')
        .eq('conversation_id', messageData.conversation_id)
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (msgError || !firstMessage) {
        throw new Error('Error obteniendo el nombre de instancia');
      }

      // Verificar que la instancia pertenece al usuario
      const { data: userConnection, error: connectionError } = await supabase
        .from('whatsapp_connections')
        .select('name')
        .eq('name', firstMessage.instance_name)
        .eq('user_id', user.id)
        .single();

      if (connectionError || !userConnection) {
        throw new Error('Instancia no válida o no pertenece al usuario');
      }

      const instanceName = firstMessage.instance_name;

      const webhookSuccess = await sendWebhook({
        instance_name: instanceName,
        whatsapp_number: conversationInfo.whatsapp_number,
        message: messageData.message,
        attachment_url: messageData.attachment_url,
      });

      if (!webhookSuccess) {
        throw new Error('Error al ejecutar el webhook');
      }

      return {
        id: 'temp-' + Date.now(),
        conversation_id: messageData.conversation_id,
        instance_name: instanceName,
        whatsapp_number: conversationInfo.whatsapp_number,
        pushname: conversationInfo.pushname,
        message: messageData.message,
        direction: 'outgoing',
        is_bot: false,
        attachment_url: messageData.attachment_url,
        message_type: messageData.message_type || (messageData.attachment_url ? 'image' : 'text'),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Message;
    },
    onSuccess: () => {
      toast({
        title: "Mensaje enviado",
        description: "El mensaje se ha enviado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Error al enviar el mensaje",
        variant: "destructive",
      });
    },
  });

  // Mutación para crear mensaje (automáticamente crea o determina la conversación)
  const createMessageMutation = useMutation({
    mutationFn: async (messageData: CreateMessageData) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Creating message:', messageData);

      // Verificar que la instancia pertenece al usuario
      const { data: userConnection, error: connectionError } = await supabase
        .from('whatsapp_connections')
        .select('name')
        .eq('name', messageData.instance_name)
        .eq('user_id', user.id)
        .single();

      if (connectionError || !userConnection) {
        throw new Error('Instancia no válida o no pertenece al usuario');
      }

      const webhookSuccess = await sendWebhook({
        instance_name: messageData.instance_name,
        whatsapp_number: messageData.whatsapp_number,
        message: messageData.message,
        attachment_url: messageData.attachment_url,
      });

      if (!webhookSuccess) {
        throw new Error('Error al ejecutar el webhook');
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...messageData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating message:', error);
        throw error;
      }
      
      return data as Message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Mensaje enviado",
        description: "El mensaje se ha enviado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating message:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear el mensaje",
        variant: "destructive",
      });
    },
  });

  return {
    messages,
    isLoading,
    sendMessageToConversation: sendMessageToConversationMutation.mutate,
    createMessage: createMessageMutation.mutate,
    isSending: sendMessageToConversationMutation.isPending || createMessageMutation.isPending,
  };
};
