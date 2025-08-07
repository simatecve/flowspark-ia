
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useUpdateUserPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planId: string) => {
      console.log('Updating user plan to:', planId);
      
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ plan_id: planId })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user plan:', error);
        throw error;
      }

      return { planId };
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user-plan'] });
      queryClient.invalidateQueries({ queryKey: ['user-usage'] });
    }
  });
};
