
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
      
      // Primero obtener las instancias del usuario
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

      // Obtener conversaciones filtrando ESTRICTAMENTE por user_id
      let conversationsQuery = supabase
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
          updated_at
        `)
        .eq('user_id', user.id); // FILTRO CRÍTICO: Solo conversaciones del usuario

      const { data: userConversations, error } = await conversationsQuery
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }

      if (!userConversations || userConversations.length === 0) {
        console.log('No conversations found for user');
        return [];
      }

      console.log('Found user conversations:', userConversations.length);

      // Filtrar conversaciones que tienen mensajes de las instancias del usuario
      const validConversations = [];
      
      for (const conv of userConversations) {
        // Verificar que esta conversación tiene mensajes de instancias del usuario
        const { data: conversationMessages, error: messagesError } = await supabase
          .from('messages')
          .select('instance_name, direction, message, created_at, pushname')
          .eq('conversation_id', conv.id)
          .eq('user_id', user.id) // FILTRO CRÍTICO: Solo mensajes del usuario
          .in('instance_name', userInstanceNames) // FILTRO CRÍTICO: Solo instancias del usuario
          .order('created_at', { ascending: false });

        if (messagesError) {
          console.error('Error fetching messages for conversation:', messagesError);
          continue;
        }

        if (!conversationMessages || conversationMessages.length === 0) {
          console.log('Conversation has no valid messages, skipping:', conv.id);
          continue;
        }

        // Si se especifica una instancia específica, filtrar por ella
        const filteredMessages = instanceName && instanceName !== 'all'
          ? conversationMessages.filter(msg => msg.instance_name === instanceName)
          : conversationMessages;

        if (filteredMessages.length === 0) {
          console.log('No messages after instance filter, skipping conversation:', conv.id);
          continue;
        }

        const firstMessage = filteredMessages[0];
        const conversationInstanceName = firstMessage.instance_name;

        // Verificar una vez más que la instancia pertenece al usuario
        if (!userInstanceNames.includes(conversationInstanceName)) {
          console.log('Instance does not belong to user, skipping:', conversationInstanceName);
          continue;
        }

        // Buscar el último mensaje incoming para mostrar
        const incomingMessages = filteredMessages.filter(msg => msg.direction === 'incoming');
        const lastIncomingMessage = incomingMessages[0];

        // Obtener color de la instancia
        const instanceConnection = userConnections?.find(conn => conn.name === conversationInstanceName);
        
        validConversations.push({
          id: conv.id,
          user_id: conv.user_id,
          instance_name: conversationInstanceName,
          instance_color: instanceConnection?.color || '#6b7280',
          whatsapp_number: conv.whatsapp_number,
          pushname: conv.pushname || lastIncomingMessage?.pushname || '',
          last_message: lastIncomingMessage?.message || '',
          last_message_at: lastIncomingMessage?.created_at || conv.last_message_at,
          unread_count: conv.unread_count,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
        });
      }

      console.log(`Returning ${validConversations.length} valid conversations for user ${user.id}`);
      return validConversations as Conversation[];
    },
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Marking conversation as read:', conversationId);
      
      // Verificar que la conversación pertenece al usuario
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('user_id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !conversation) {
        console.error('Conversation not found or access denied:', fetchError);
        throw new Error('Conversación no encontrada o acceso denegado');
      }

      const { error } = await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId)
        .eq('user_id', user.id);

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
