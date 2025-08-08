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
      if (!conversationId) return [];
      
      console.log('Fetching messages for conversation:', conversationId, 'user:', user?.id);
      
      // Verificar que la conversación pertenece al usuario antes de obtener mensajes
      if (user) {
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('user_id')
          .eq('id', conversationId)
          .single();

        if (convError) {
          console.error('Error verifying conversation ownership:', convError);
          throw convError;
        }

        // Si la conversación tiene user_id y no coincide con el usuario actual, denegar acceso
        if (conversation.user_id && conversation.user_id !== user.id) {
          console.error('User does not own this conversation');
          throw new Error('Access denied to this conversation');
        }
      }
      
      // Fetch messages - las políticas RLS manejarán el control de acceso
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      console.log('Fetched messages:', data);
      return data as Message[];
    },
    enabled: !!conversationId && !!user,
  });

  // Mutación para enviar mensaje a una conversación específica (solo webhook, no guardar en BD)
  const sendMessageToConversationMutation = useMutation({
    mutationFn: async (messageData: SendMessageToConversationData) => {
      console.log('Sending message to conversation:', messageData);

      const { data: conversationInfo, error: convError } = await supabase
        .from('conversations')
        .select(`
          whatsapp_number, 
          pushname, 
          user_id
        `)
        .eq('id', messageData.conversation_id)
        .single();

      if (convError || !conversationInfo) {
        throw new Error('Error obteniendo información de la conversación');
      }

      const { data: firstMessage, error: msgError } = await supabase
        .from('messages')
        .select('instance_name')
        .eq('conversation_id', messageData.conversation_id)
        .limit(1)
        .single();

      if (msgError || !firstMessage) {
        throw new Error('Error obteniendo el nombre de instancia');
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
        user_id: conversationInfo.user_id || (user ? user.id : null),
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
  // Esta se usa para crear conversaciones desde otros lugares, no desde el chat
  const createMessageMutation = useMutation({
    mutationFn: async (messageData: CreateMessageData) => {
      console.log('Creating message:', messageData);

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
          user_id: user ? user.id : null,
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
