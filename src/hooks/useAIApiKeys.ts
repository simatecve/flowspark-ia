
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AIApiKey {
  id: string;
  user_id: string;
  provider: 'openai' | 'gemini' | 'groq' | 'anthropic';
  api_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAIApiKeyData {
  provider: 'openai' | 'gemini' | 'groq' | 'anthropic';
  api_key: string;
  is_active: boolean;
}

export interface UpdateAIApiKeyData extends Partial<CreateAIApiKeyData> {}

export const useAIApiKeys = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener API keys
  const { data: apiKeys, isLoading: isLoadingKeys } = useQuery({
    queryKey: ['ai-api-keys'],
    queryFn: async () => {
      console.log('Fetching AI API keys for user:', user?.id);
      const { data, error } = await supabase
        .from('ai_api_keys')
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

  // Crear API key
  const createKeyMutation = useMutation({
    mutationFn: async (keyData: CreateAIApiKeyData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating AI API key:', keyData);

      const { data, error } = await supabase
        .from('ai_api_keys')
        .insert({
          provider: keyData.provider,
          api_key: keyData.api_key,
          is_active: keyData.is_active,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating AI API key:', error);
        throw new Error('Error al crear la API key: ' + error.message);
      }
      
      return data as AIApiKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-api-keys'] });
      toast({
        title: "¡API Key creada!",
        description: "La API key se ha creado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating AI API key:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la API key",
        variant: "destructive",
      });
    },
  });

  // Actualizar API key
  const updateKeyMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateAIApiKeyData & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Updating AI API key:', id, updateData);

      const { data, error } = await supabase
        .from('ai_api_keys')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating AI API key:', error);
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
  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting AI API key:', id);

      const { error } = await supabase
        .from('ai_api_keys')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting AI API key:', error);
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
      console.error('Error deleting AI API key:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la API key",
        variant: "destructive",
      });
    },
  });

  return {
    apiKeys,
    isLoadingKeys,
    createKey: createKeyMutation.mutate,
    isCreatingKey: createKeyMutation.isPending,
    updateKey: updateKeyMutation.mutate,
    isUpdatingKey: updateKeyMutation.isPending,
    deleteKey: deleteKeyMutation.mutate,
    isDeletingKey: deleteKeyMutation.isPending,
  };
};
