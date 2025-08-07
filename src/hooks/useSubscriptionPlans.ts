
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
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching subscription plans:', error);
        throw error;
      }

      return data || [];
    }
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planData: CreatePlanData): Promise<SubscriptionPlan> => {
      console.log('Creating subscription plan:', planData);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([planData])
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription plan:', error);
        throw error;
      }

      return data;
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
      
      const { id, ...updateData } = planData;
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription plan:', error);
        throw error;
      }

      return data;
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
      
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: false })
        .eq('id', planId);

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
