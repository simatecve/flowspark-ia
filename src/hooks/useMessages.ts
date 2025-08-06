
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Message, CreateMessageData, SendMessageData } from '@/types/messages';

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      console.log('Fetching messages for conversation:', conversationId);
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
    enabled: !!user && !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: SendMessageData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Sending message:', messageData);

      // Obtener información de la conversación
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('whatsapp_number, pushname')
        .eq('id', messageData.conversation_id)
        .single();

      if (convError || !conversation) {
        throw new Error('Error obteniendo información de la conversación');
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: messageData.conversation_id,
          instance_name: 'web_client', // Default para mensajes enviados desde la web
          whatsapp_number: conversation.whatsapp_number,
          pushname: conversation.pushname,
          message: messageData.message,
          direction: 'outgoing',
          is_bot: false,
          attachment_url: messageData.attachment_url,
          message_type: messageData.message_type || 'text',
          user_id: user.id,
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

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
};
