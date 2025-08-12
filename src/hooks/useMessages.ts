
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWebhookSender } from '@/hooks/useWebhookSender';
import type { Message, CreateMessageData, SendMessageToConversationData } from '@/types/messages';

// Función para determinar el tipo de mensaje basado en la URL del attachment
const getMessageTypeFromUrl = (attachmentUrl?: string, providedType?: string): string => {
  if (providedType) return providedType;
  if (!attachmentUrl) return 'text';
  
  const url = attachmentUrl.toLowerCase();
  
  if (url.includes('image') || url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return 'imageMessage';
  }
  
  if (url.includes('audio') || url.match(/\.(mp3|wav|ogg|m4a|aac)$/)) {
    return 'audioMessage';
  }
  
  if (url.match(/\.(mp4|avi|mov|wmv|flv)$/)) {
    return 'video';
  }
  
  if (url.match(/\.(pdf|doc|docx|txt|rtf)$/)) {
    return 'document';
  }
  
  return 'text';
};

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
      
      // Obtener las instancias del usuario
      const { data: userConnections, error: connectionsError } = await supabase
        .from('whatsapp_connections')
        .select('name')
        .eq('user_id', user.id);

      if (connectionsError) {
        console.error('Error fetching user connections:', connectionsError);
        throw connectionsError;
      }

      const userInstanceNames = userConnections?.map(conn => conn.name) || [];

      // Verificar que la conversación pertenece a las instancias del usuario
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('instance_name')
        .eq('id', conversationId)
        .in('instance_name', userInstanceNames)
        .single();

      if (convError || !conversation) {
        console.error('Error verifying conversation ownership:', convError);
        throw new Error('Access denied to this conversation');
      }
      
      // Fetch messages - filtrar por conversación y instancia del usuario
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('instance_name', conversation.instance_name)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log('Fetched messages for conversation:', data);
      return data as Message[];
    },
    enabled: !!conversationId && !!user,
  });

  // Mutación para enviar mensaje a una conversación específica (solo webhook, no guardar en BD)
  const sendMessageToConversationMutation = useMutation({
    mutationFn: async (messageData: SendMessageToConversationData) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Sending message to conversation:', messageData);

      // Obtener las instancias del usuario
      const { data: userConnections, error: connectionsError } = await supabase
        .from('whatsapp_connections')
        .select('name')
        .eq('user_id', user.id);

      if (connectionsError) {
        console.error('Error fetching user connections:', connectionsError);
        throw connectionsError;
      }

      const userInstanceNames = userConnections?.map(conn => conn.name) || [];

      // Verificar que la conversación pertenece a las instancias del usuario
      const { data: conversationInfo, error: convError } = await supabase
        .from('conversations')
        .select(`
          whatsapp_number, 
          pushname, 
          instance_name
        `)
        .eq('id', messageData.conversation_id)
        .in('instance_name', userInstanceNames)
        .single();

      if (convError || !conversationInfo) {
        throw new Error('Error obteniendo información de la conversación o acceso denegado');
      }

      // Verificar que la instancia pertenece al usuario
      if (!userInstanceNames.includes(conversationInfo.instance_name)) {
        throw new Error('Instancia no válida o no pertenece al usuario');
      }

      const webhookSuccess = await sendWebhook({
        instance_name: conversationInfo.instance_name,
        whatsapp_number: conversationInfo.whatsapp_number,
        message: messageData.message,
        attachment_url: messageData.attachment_url,
      });

      if (!webhookSuccess) {
        throw new Error('Error al ejecutar el webhook');
      }

      // Determinar el tipo de mensaje
      const messageType = getMessageTypeFromUrl(messageData.attachment_url, messageData.message_type);

      return {
        id: 'temp-' + Date.now(),
        conversation_id: messageData.conversation_id,
        instance_name: conversationInfo.instance_name,
        whatsapp_number: conversationInfo.whatsapp_number,
        pushname: conversationInfo.pushname,
        message: messageData.message,
        direction: 'outgoing',
        is_bot: false,
        attachment_url: messageData.attachment_url,
        message_type: messageType,
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

      // Determinar el tipo de mensaje
      const messageType = getMessageTypeFromUrl(messageData.attachment_url, messageData.message_type);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...messageData,
          message_type: messageType,
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
