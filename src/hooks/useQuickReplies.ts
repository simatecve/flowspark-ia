
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { QuickReply, CreateQuickReplyData, UpdateQuickReplyData } from '@/types/quickReplies';

export const useQuickReplies = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quickReplies = [], isLoading } = useQuery({
    queryKey: ['quickReplies', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('quick_replies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quick replies:', error);
        throw error;
      }

      return data as QuickReply[];
    },
    enabled: !!user,
  });

  const createQuickReplyMutation = useMutation({
    mutationFn: async (data: CreateQuickReplyData) => {
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('quick_replies')
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
      queryClient.invalidateQueries({ queryKey: ['quickReplies'] });
      toast({
        title: "Respuesta rápida creada",
        description: "La respuesta rápida ha sido creada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo crear la respuesta rápida.",
        variant: "destructive",
      });
    },
  });

  const updateQuickReplyMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateQuickReplyData) => {
      const { data: result, error } = await supabase
        .from('quick_replies')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quickReplies'] });
      toast({
        title: "Respuesta rápida actualizada",
        description: "La respuesta rápida ha sido actualizada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la respuesta rápida.",
        variant: "destructive",
      });
    },
  });

  const deleteQuickReplyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quick_replies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quickReplies'] });
      toast({
        title: "Respuesta rápida eliminada",
        description: "La respuesta rápida ha sido eliminada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la respuesta rápida.",
        variant: "destructive",
      });
    },
  });

  return {
    quickReplies,
    isLoading,
    createQuickReply: createQuickReplyMutation.mutate,
    updateQuickReply: updateQuickReplyMutation.mutate,
    deleteQuickReply: deleteQuickReplyMutation.mutate,
    isCreating: createQuickReplyMutation.isPending,
    isUpdating: updateQuickReplyMutation.isPending,
    isDeleting: deleteQuickReplyMutation.isPending,
  };
};
