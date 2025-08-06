
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Conversation } from '@/types/messages';

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      console.log('Fetching conversations for user:', user?.id);
      
      // Fetch both user conversations and public conversations
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(user ? `user_id.eq.${user.id},user_id.is.null` : 'user_id.is.null')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
      console.log('Fetched conversations:', data);
      return data as Conversation[];
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
