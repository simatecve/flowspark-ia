
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ScheduledMessage, CreateScheduledMessageData, UpdateScheduledMessageData } from '@/types/scheduledMessages';

export const useScheduledMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scheduledMessages = [], isLoading } = useQuery({
    queryKey: ['scheduledMessages', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('scheduled_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled messages:', error);
        throw error;
      }

      return data as ScheduledMessage[];
    },
    enabled: !!user,
  });

  const createScheduledMessageMutation = useMutation({
    mutationFn: async (data: CreateScheduledMessageData) => {
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('scheduled_messages')
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] });
      toast({
        title: "Mensaje programado",
        description: "El mensaje ha sido programado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo programar el mensaje.",
        variant: "destructive",
      });
    },
  });

  const updateScheduledMessageMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateScheduledMessageData) => {
      const { data: result, error } = await supabase
        .from('scheduled_messages')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el mensaje programado.",
        variant: "destructive",
      });
    },
  });

  const deleteScheduledMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] });
      toast({
        title: "Mensaje cancelado",
        description: "El mensaje programado ha sido cancelado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo cancelar el mensaje programado.",
        variant: "destructive",
      });
    },
  });

  return {
    scheduledMessages,
    isLoading,
    createScheduledMessage: createScheduledMessageMutation.mutate,
    updateScheduledMessage: updateScheduledMessageMutation.mutate,
    deleteScheduledMessage: deleteScheduledMessageMutation.mutate,
    isCreating: createScheduledMessageMutation.isPending,
    isUpdating: updateScheduledMessageMutation.isPending,
    isDeleting: deleteScheduledMessageMutation.isPending,
  };
};
