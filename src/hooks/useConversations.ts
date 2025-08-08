
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
      
      // Primero obtener las instancias del usuario para filtrar las conversaciones
      const { data: userConnections, error: connectionsError } = await supabase
        .from('whatsapp_connections')
        .select('name')
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

      // Construir la consulta base - SOLO para conversaciones del usuario y sus instancias
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
        .eq('user_id', user.id)
        .in('messages.instance_name', userInstanceNames)
        .order('last_message_at', { ascending: false });

      // Si se especifica una instancia, filtrar por ella (verificando que pertenece al usuario)
      if (instanceName && userInstanceNames.includes(instanceName)) {
        query = query.eq('messages.instance_name', instanceName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }

      // Obtener información de las conexiones de WhatsApp para los colores - SOLO del usuario
      const { data: connections, error: connectionsError2 } = await supabase
        .from('whatsapp_connections')
        .select('name, color')
        .eq('user_id', user.id);

      if (connectionsError2) {
        console.error('Error fetching WhatsApp connections for colors:', connectionsError2);
      }

      // Crear un mapa de nombre de instancia -> color
      const instanceColorMap = connections?.reduce((acc, conn) => {
        acc[conn.name] = conn.color;
        return acc;
      }, {} as Record<string, string>) || {};

      // Transformar los datos para incluir instance_name y filtrar último mensaje
      const transformedData = data?.map((conv: any) => {
        // Filtrar mensajes por instancia si se especifica
        let filteredMessages = conv.messages || [];
        if (instanceName) {
          filteredMessages = filteredMessages.filter((msg: any) => msg.instance_name === instanceName);
        }

        // Verificar que todos los mensajes son de instancias del usuario
        filteredMessages = filteredMessages.filter((msg: any) => 
          userInstanceNames.includes(msg.instance_name)
        );

        if (filteredMessages.length === 0) {
          return null; // Filtrar conversaciones sin mensajes válidos
        }

        // Buscar el último mensaje incoming (no outgoing) para mostrar en la lista
        const incomingMessages = filteredMessages.filter((msg: any) => msg.direction === 'incoming');
        const lastIncomingMessage = incomingMessages.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        // Obtener el pushname del primer mensaje incoming (contacto que inició la conversación)
        const firstIncomingMessage = incomingMessages.sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];

        // El pushname debe ser siempre del contacto (incoming), no del usuario que envía (outgoing)
        const contactPushname = firstIncomingMessage?.pushname || conv.pushname;
        const currentInstanceName = filteredMessages[0]?.instance_name || '';

        // Verificar que la instancia pertenece al usuario
        if (!userInstanceNames.includes(currentInstanceName)) {
          return null;
        }

        return {
          id: conv.id,
          user_id: conv.user_id,
          instance_name: currentInstanceName,
          instance_color: instanceColorMap[currentInstanceName] || '#6b7280',
          whatsapp_number: conv.whatsapp_number,
          pushname: contactPushname,
          last_message: lastIncomingMessage?.message || '',
          last_message_at: lastIncomingMessage?.created_at || conv.last_message_at,
          unread_count: conv.unread_count,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
        };
      }).filter(Boolean) || []; // Filtrar elementos null

      console.log('Fetched conversations for user instances:', transformedData);
      return transformedData as Conversation[];
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
