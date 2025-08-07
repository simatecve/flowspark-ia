
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserUsage } from '@/types/plans';

export const useUserUsage = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-usage', user?.id],
    queryFn: async (): Promise<UserUsage | null> => {
      console.log('Fetching user usage for user:', user?.id);
      
      if (!user) throw new Error('User not authenticated');

      const currentMonth = new Date();
      currentMonth.setDate(1);
      
      const { data, error } = await supabase.rpc('get_user_usage', {
        p_user_id: user.id,
        p_usage_month: currentMonth.toISOString().split('T')[0]
      });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user usage:', error);
        throw error;
      }

      return data as UserUsage || null;
    },
    enabled: !!user,
    refetchInterval: 30000
  });
};

export const useUserPlan = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-plan', user?.id],
    queryFn: async () => {
      console.log('Fetching user plan for user:', user?.id);
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('get_user_plan', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching user plan:', error);
        throw error;
      }

      return data || null;
    },
    enabled: !!user
  });
};
