
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DashboardStats {
  activeConnections: number;
  sentMessages: number;
  generatedLeads: number;
  responseRate: number;
  campaignsActive: number;
  contactsCount: number;
}

export const useDashboardData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      console.log('Fetching dashboard data for user:', user?.id);
      
      if (!user) throw new Error('User not authenticated');

      // Obtener conexiones activas
      const { data: connections, error: connectionsError } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'connected');

      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
      }

      // Obtener mensajes enviados
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('direction', 'outgoing');

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      }

      // Obtener leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id);

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
      }

      // Obtener campañas activas
      const { data: campaigns, error: campaignsError } = await supabase
        .from('mass_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
      }

      // Obtener contactos
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
      }

      // Calcular tasa de respuesta (simplificado)
      const incomingMessages = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('direction', 'incoming');

      const responseRate = messages?.length && incomingMessages.data?.length 
        ? Math.round((incomingMessages.data.length / messages.length) * 100)
        : 0;

      return {
        activeConnections: connections?.length || 0,
        sentMessages: messages?.length || 0,
        generatedLeads: leads?.length || 0,
        responseRate,
        campaignsActive: campaigns?.length || 0,
        contactsCount: contacts?.length || 0
      };
    },
    enabled: !!user,
    refetchInterval: 30000 // Actualizar cada 30 segundos
  });
};
