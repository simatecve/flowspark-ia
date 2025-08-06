
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Conversation } from '@/types/messages';

export const useConversations = (instanceName?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', instanceName],
    queryFn: async () => {
      console.log('Fetching conversations for user:', user?.id, 'instance:', instanceName);
      
      // Obtener conversaciones únicas basadas en instance_name y whatsapp_number
      let query = supabase
        .from('conversations')
        .select(`
          id,
          user_id,
          whatsapp_number,
          pushname,
          last_message,
          last_message_at,
          unread_count,
          created_at,
          updated_at,
          messages!inner(instance_name)
        `)
        .or(user ? `user_id.eq.${user.id},user_id.is.null` : 'user_id.is.null')
        .order('last_message_at', { ascending: false });

      // Filtrar por instance_name si se proporciona
      if (instanceName) {
        query = query.eq('messages.instance_name', instanceName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }

      // Transformar los datos para incluir instance_name
      const transformedData = data?.map((conv: any) => ({
        id: conv.id,
        user_id: conv.user_id,
        instance_name: conv.messages?.[0]?.instance_name || '',
        whatsapp_number: conv.whatsapp_number,
        pushname: conv.pushname,
        last_message: conv.last_message,
        last_message_at: conv.last_message_at,
        unread_count: conv.unread_count,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      })) || [];

      console.log('Fetched conversations:', transformedData);
      return transformedData as Conversation[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      console.log('Marking conversation as read:', conversationId);
      const { error } = await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);

      if (error) {
        console.error('Error marking conversation as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      console.error('Error marking conversation as read:', error);
      toast({
        title: "Error",
        description: "Error al marcar la conversación como leída",
        variant: "destructive",
      });
    },
  });

  return {
    conversations,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
};
