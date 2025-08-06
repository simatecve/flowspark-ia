
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AIBot {
  id: string;
  user_id: string;
  name: string;
  whatsapp_connection_name: string;
  instructions: string;
  message_delay: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAIBotData {
  name: string;
  whatsapp_connection_name: string;
  instructions: string;
  message_delay: number;
  is_active: boolean;
}

export interface UpdateAIBotData extends Partial<CreateAIBotData> {}

export const useAIBots = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener bots de IA
  const { data: bots, isLoading: isLoadingBots } = useQuery({
    queryKey: ['ai-bots'],
    queryFn: async () => {
      console.log('Fetching AI bots for user:', user?.id);
      const { data, error } = await supabase
        .from('ai_bots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching AI bots:', error);
        throw error;
      }
      console.log('Fetched AI bots:', data);
      return data as unknown as AIBot[];
    },
    enabled: !!user,
  });

  // Crear bot de IA
  const createBotMutation = useMutation({
    mutationFn: async (botData: CreateAIBotData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating AI bot:', botData);

      const { data, error } = await supabase
        .from('ai_bots')
        .insert({
          name: botData.name,
          whatsapp_connection_name: botData.whatsapp_connection_name,
          instructions: botData.instructions,
          message_delay: botData.message_delay,
          is_active: botData.is_active,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating AI bot:', error);
        throw new Error('Error al crear el bot de IA: ' + error.message);
      }
      
      return data as unknown as AIBot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
      toast({
        title: "¡Bot creado!",
        description: "El bot de IA se ha creado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating AI bot:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear el bot de IA",
        variant: "destructive",
      });
    },
  });

  // Actualizar bot de IA
  const updateBotMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateAIBotData & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Updating AI bot:', id, updateData);

      const { data, error } = await supabase
        .from('ai_bots')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating AI bot:', error);
        throw new Error('Error al actualizar el bot de IA: ' + error.message);
      }
      
      return data as unknown as AIBot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
      toast({
        title: "Bot actualizado",
        description: "El bot de IA se ha actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating AI bot:', error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el bot de IA",
        variant: "destructive",
      });
    },
  });

  // Eliminar bot de IA
  const deleteBotMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting AI bot:', id);

      const { error } = await supabase
        .from('ai_bots')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting AI bot:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
      toast({
        title: "Bot eliminado",
        description: "El bot de IA se ha eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting AI bot:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el bot de IA",
        variant: "destructive",
      });
    },
  });

  return {
    bots,
    isLoadingBots,
    createBot: createBotMutation.mutate,
    isCreatingBot: createBotMutation.isPending,
    updateBot: updateBotMutation.mutate,
    isUpdatingBot: updateBotMutation.isPending,
    deleteBot: deleteBotMutation.mutate,
    isDeletingBot: deleteBotMutation.isPending,
  };
};
