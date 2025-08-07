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
          messages!inner(instance_name, direction, message, created_at, pushname)
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

      // Transformar los datos para incluir instance_name y filtrar último mensaje
      const transformedData = data?.map((conv: any) => {
        // Buscar el último mensaje incoming (no outgoing) para mostrar en la lista
        const incomingMessages = conv.messages?.filter((msg: any) => msg.direction === 'incoming') || [];
        const lastIncomingMessage = incomingMessages.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        // Obtener el pushname del primer mensaje incoming (contacto que inició la conversación)
        const firstIncomingMessage = incomingMessages.sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];

        // El pushname debe ser siempre del contacto (incoming), no del usuario que envía (outgoing)
        const contactPushname = firstIncomingMessage?.pushname || conv.pushname;

        return {
          id: conv.id,
          user_id: conv.user_id,
          instance_name: conv.messages?.[0]?.instance_name || '',
          whatsapp_number: conv.whatsapp_number,
          pushname: contactPushname, // Siempre el pushname del contacto (incoming)
          last_message: lastIncomingMessage?.message || '', // Solo mostrar mensajes incoming
          last_message_at: lastIncomingMessage?.created_at || conv.last_message_at,
          unread_count: conv.unread_count,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
        };
      }) || [];

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
