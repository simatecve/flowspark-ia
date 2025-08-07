
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ActivityItem {
  id: string;
  type: 'connection' | 'campaign' | 'lead' | 'message';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export const useRecentActivity = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async (): Promise<ActivityItem[]> => {
      console.log('Fetching recent activity for user:', user?.id);
      
      if (!user) throw new Error('User not authenticated');

      const activities: ActivityItem[] = [];

      // Obtener conexiones recientes
      const { data: connections } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      connections?.forEach(conn => {
        activities.push({
          id: `conn-${conn.id}`,
          type: 'connection',
          title: `Conexión ${conn.name} ${conn.status === 'connected' ? 'establecida' : 'actualizada'}`,
          description: `WhatsApp ${conn.phone_number}`,
          timestamp: conn.created_at,
          status: conn.status === 'connected' ? 'success' : 'warning'
        });
      });

      // Obtener campañas recientes
      const { data: campaigns } = await supabase
        .from('mass_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      campaigns?.forEach(campaign => {
        activities.push({
          id: `campaign-${campaign.id}`,
          type: 'campaign',
          title: `Campaña "${campaign.name}" ${campaign.status === 'sent' ? 'enviada' : 'programada'}`,
          description: `Estado: ${campaign.status}`,
          timestamp: campaign.created_at,
          status: campaign.status === 'sent' ? 'success' : 'info'
        });
      });

      // Obtener leads recientes
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      leads?.forEach(lead => {
        activities.push({
          id: `lead-${lead.id}`,
          type: 'lead',
          title: `Nuevo lead: ${lead.name}`,
          description: `Teléfono: ${lead.phone}`,
          timestamp: lead.created_at,
          status: 'info'
        });
      });

      // Ordenar por timestamp
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
    },
    enabled: !!user,
    refetchInterval: 60000 // Actualizar cada minuto
  });
};
