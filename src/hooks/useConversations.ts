
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
    queryKey: ['conversations', instanceName, user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('No user authenticated, returning empty conversations');
        return [];
      }

      console.log('Fetching conversations for user:', user?.id, 'instance:', instanceName);
      
      // Obtener las instancias del usuario
      const { data: userConnections, error: connectionsError } = await supabase
        .from('whatsapp_connections')
        .select('name, color')
        .eq('user_id', user.id);

      if (connectionsError) {
        console.error('Error fetching user connections:', connectionsError);
        throw connectionsError;
      }

      const userInstanceNames = userConnections?.map(conn => conn.name) || [];
      
      if (userInstanceNames.length === 0) {
        console.log('User has no WhatsApp connections, returning empty conversations');
        return [];
      }

      console.log('User instance names:', userInstanceNames);

      // Construir query para conversaciones
      let conversationsQuery = supabase
        .from('conversations')
        .select(`
          id,
          user_id,
          instance_name,
          whatsapp_number,
          pushname,
          last_message,
          last_message_at,
          unread_count,
          created_at,
          updated_at
        `)
        .in('instance_name', userInstanceNames); // Filtrar por instancias del usuario

      // Aplicar filtro de instancia específica si se proporciona
      if (instanceName && instanceName !== 'all') {
        conversationsQuery = conversationsQuery.eq('instance_name', instanceName);
      }

      const { data: filteredConversations, error } = await conversationsQuery
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }

      if (!filteredConversations || filteredConversations.length === 0) {
        console.log('No conversations found for user instances');
        return [];
      }

      console.log('Found conversations:', filteredConversations.length);

      // Mapear conversaciones con color de instancia
      const conversationsWithColor = filteredConversations.map(conv => {
        const instanceConnection = userConnections?.find(conn => conn.name === conv.instance_name);
        
        return {
          ...conv,
          instance_color: instanceConnection?.color || '#6b7280',
        };
      });

      console.log(`Returning ${conversationsWithColor.length} conversations for user ${user.id}`);
      return conversationsWithColor as Conversation[];
    },
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Marking conversation as read:', conversationId);
      
      // Verificar que la conversación pertenece a las instancias del usuario
      const { data: userConnections, error: connectionsError } = await supabase
        .from('whatsapp_connections')
        .select('name')
        .eq('user_id', user.id);

      if (connectionsError) {
        console.error('Error fetching user connections:', connectionsError);
        throw connectionsError;
      }

      const userInstanceNames = userConnections?.map(conn => conn.name) || [];

      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('instance_name')
        .eq('id', conversationId)
        .in('instance_name', userInstanceNames)
        .single();

      if (fetchError || !conversation) {
        console.error('Conversation not found or access denied:', fetchError);
        throw new Error('Conversación no encontrada o acceso denegado');
      }

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
