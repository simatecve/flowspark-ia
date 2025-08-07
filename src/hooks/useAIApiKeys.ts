
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AIApiKey {
  id: string;
  user_id: string;
  provider: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAIApiKeyData {
  provider: string;
  api_key: string;
  is_active?: boolean;
}

export const useAIApiKeys = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener API keys del usuario
  const { data: apiKeys, isLoading: isLoadingApiKeys } = useQuery({
    queryKey: ['ai-api-keys'],
    queryFn: async () => {
      console.log('Fetching AI API keys for user:', user?.id);
      const { data, error } = await supabase
        .from('ai_api_keys' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching AI API keys:', error);
        throw error;
      }
      console.log('Fetched AI API keys:', data);
      return data as AIApiKey[];
    },
    enabled: !!user,
  });

  // Crear nueva API key
  const createApiKeyMutation = useMutation({
    mutationFn: async (apiKeyData: CreateAIApiKeyData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating AI API key for provider:', apiKeyData.provider);

      const { data, error } = await supabase
        .from('ai_api_keys' as any)
        .insert({
          provider: apiKeyData.provider,
          api_key: apiKeyData.api_key,
          is_active: apiKeyData.is_active ?? true,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Error al guardar la API key: ' + error.message);
      }
      
      return data as AIApiKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-api-keys'] });
      toast({
        title: "¡API Key guardada!",
        description: "La API key se ha guardado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating AI API key:', error);
      toast({
        title: "Error",
        description: error.message || "Error al guardar la API key",
        variant: "destructive",
      });
    },
  });

  // Actualizar API key
  const updateApiKeyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateAIApiKeyData> }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Updating AI API key:', id);

      const { data, error } = await supabase
        .from('ai_api_keys' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Error al actualizar la API key: ' + error.message);
      }
      
      return data as AIApiKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-api-keys'] });
      toast({
        title: "API Key actualizada",
        description: "La API key se ha actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating AI API key:', error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la API key",
        variant: "destructive",
      });
    },
  });

  // Eliminar API key
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting AI API key:', id);

      const { error } = await supabase
        .from('ai_api_keys' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting API key:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-api-keys'] });
      toast({
        title: "API Key eliminada",
        description: "La API key se ha eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la API key",
        variant: "destructive",
      });
    },
  });

  return {
    apiKeys,
    isLoadingApiKeys,
    createApiKey: createApiKeyMutation.mutate,
    isCreatingApiKey: createApiKeyMutation.isPending,
    updateApiKey: updateApiKeyMutation.mutate,
    isUpdatingApiKey: updateApiKeyMutation.isPending,
    deleteApiKey: deleteApiKeyMutation.mutate,
    isDeletingApiKey: deleteApiKeyMutation.isPending,
  };
};
