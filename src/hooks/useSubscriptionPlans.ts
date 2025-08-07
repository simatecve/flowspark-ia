
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionPlan, CreatePlanData, UpdatePlanData } from '@/types/plans';
import { toast } from 'sonner';

export const useSubscriptionPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      console.log('Fetching subscription plans');
      
      const { data, error } = await supabase.rpc('get_subscription_plans');

      if (error) {
        console.error('Error fetching subscription plans:', error);
        // Fallback to direct query if RPC doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('subscription_plans' as any)
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });
        
        if (fallbackError) {
          throw fallbackError;
        }
        
        return (fallbackData || []) as SubscriptionPlan[];
      }

      return (data || []) as SubscriptionPlan[];
    }
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planData: CreatePlanData): Promise<SubscriptionPlan> => {
      console.log('Creating subscription plan:', planData);
      
      const { data, error } = await supabase.rpc('create_subscription_plan', {
        plan_data: planData
      });

      if (error) {
        console.error('Error creating subscription plan:', error);
        throw error;
      }

      return data as SubscriptionPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating plan:', error);
      toast.error('Error al crear el plan');
    }
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planData: UpdatePlanData): Promise<SubscriptionPlan> => {
      console.log('Updating subscription plan:', planData);
      
      const { data, error } = await supabase.rpc('update_subscription_plan', {
        plan_id: planData.id,
        plan_data: planData
      });

      if (error) {
        console.error('Error updating subscription plan:', error);
        throw error;
      }

      return data as SubscriptionPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating plan:', error);
      toast.error('Error al actualizar el plan');
    }
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string): Promise<void> => {
      console.log('Deactivating subscription plan:', planId);
      
      const { error } = await supabase.rpc('deactivate_subscription_plan', {
        plan_id: planId
      });

      if (error) {
        console.error('Error deactivating subscription plan:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan desactivado exitosamente');
    },
    onError: (error) => {
      console.error('Error deactivating plan:', error);
      toast.error('Error al desactivar el plan');
    }
  });
};
