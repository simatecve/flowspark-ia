
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
  conversationsCount: number;
  totalMessages: number;
  totalCampaigns: number;
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
        .eq('user_id', user.id);

      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
      }

      const activeConnections = connections?.filter(conn => conn.status === 'connected' || conn.status === 'conectado').length || 0;

      // Obtener todos los mensajes del usuario
      const { data: allMessages, error: allMessagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id);

      if (allMessagesError) {
        console.error('Error fetching all messages:', allMessagesError);
      }

      // Mensajes enviados (outgoing)
      const sentMessages = allMessages?.filter(msg => msg.direction === 'outgoing').length || 0;
      
      // Mensajes recibidos (incoming) para calcular tasa de respuesta
      const receivedMessages = allMessages?.filter(msg => msg.direction === 'incoming').length || 0;
      const totalMessages = allMessages?.length || 0;

      // Calcular tasa de respuesta
      const responseRate = sentMessages > 0 ? Math.round((receivedMessages / sentMessages) * 100) : 0;

      // Obtener leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id);

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
      }

      // Obtener todas las campañas
      const { data: allCampaigns, error: allCampaignsError } = await supabase
        .from('mass_campaigns')
        .select('*')
        .eq('user_id', user.id);

      if (allCampaignsError) {
        console.error('Error fetching all campaigns:', allCampaignsError);
      }

      // Campañas activas
      const campaignsActive = allCampaigns?.filter(campaign => campaign.status === 'active').length || 0;
      const totalCampaigns = allCampaigns?.length || 0;

      // Obtener contactos
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
      }

      // Obtener conversaciones
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id);

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
      }

      return {
        activeConnections,
        sentMessages,
        generatedLeads: leads?.length || 0,
        responseRate,
        campaignsActive,
        contactsCount: contacts?.length || 0,
        conversationsCount: conversations?.length || 0,
        totalMessages,
        totalCampaigns
      };
    },
    enabled: !!user,
    refetchInterval: 30000 // Actualizar cada 30 segundos
  });
};
