
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Message, CreateMessageData, SendMessageToConversationData } from '@/types/messages';

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      console.log('Fetching messages for conversation:', conversationId);
      
      // Fetch messages - the RLS policies will handle access control
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
    enabled: !!conversationId,
  });

  // Mutación para enviar mensaje a una conversación específica
  const sendMessageToConversationMutation = useMutation({
    mutationFn: async (messageData: SendMessageToConversationData) => {
      console.log('Sending message to conversation:', messageData);

      // Obtener información de la conversación
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('whatsapp_number, pushname, user_id')
        .eq('id', messageData.conversation_id)
        .single();

      if (convError || !conversation) {
        throw new Error('Error obteniendo información de la conversación');
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          instance_name: 'web_client',
          whatsapp_number: conversation.whatsapp_number,
          pushname: conversation.pushname,
          message: messageData.message,
          direction: 'outgoing',
          is_bot: false,
          attachment_url: messageData.attachment_url,
          message_type: messageData.message_type || 'text',
          user_id: conversation.user_id || (user ? user.id : null), // Use conversation's user_id or current user
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      return data as Message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
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
      console.log('Creating message:', messageData);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...messageData,
          user_id: user ? user.id : null, // Allow null user_id for public messages
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
