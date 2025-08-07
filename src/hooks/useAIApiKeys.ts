
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface AIApiKey {
  id: string;
  user_id: string;
  provider: 'openai' | 'gemini' | 'groq';
  api_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateApiKeyData {
  provider: 'openai' | 'gemini' | 'groq';
  api_key: string;
}

export const useAIApiKeys = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obtener todas las API keys del usuario
  const { data: apiKeys, isLoading, error } = useQuery({
    queryKey: ['ai-api-keys', user?.id],
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

      console.log('AI API keys fetched:', data?.length || 0);
      return (data || []) as AIApiKey[];
    },
    enabled: !!user,
  });

  // Crear una nueva API key
  const createApiKey = useMutation({
    mutationFn: async (apiKeyData: CreateApiKeyData) => {
      if (!user) throw new Error('Usuario no autenticado');

      console.log('Creating AI API key for provider:', apiKeyData.provider);

      const { data, error } = await supabase
        .from('ai_api_keys' as any)
        .insert({
          provider: apiKeyData.provider,
          api_key: apiKeyData.api_key,
          user_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating AI API key:', error);
        throw error;
      }

      console.log('AI API key created successfully:', data?.id);
      return data as AIApiKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-api-keys'] });
      toast.success('API Key guardada correctamente');
    },
    onError: (error) => {
      console.error('Error creating AI API key:', error);
      toast.error('Error al guardar la API Key');
    },
  });

  // Actualizar una API key existente
  const updateApiKey = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AIApiKey> }) => {
      console.log('Updating AI API key:', id);

      const { data, error } = await supabase
        .from('ai_api_keys' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating AI API key:', error);
        throw error;
      }

      console.log('AI API key updated successfully:', data?.id);
      return data as AIApiKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-api-keys'] });
      toast.success('API Key actualizada correctamente');
    },
    onError: (error) => {
      console.error('Error updating AI API key:', error);
      toast.error('Error al actualizar la API Key');
    },
  });

  // Alternar el estado activo/inactivo de una API key
  const toggleApiKey = useMutation({
    mutationFn: async (id: string) => {
      const currentApiKey = apiKeys?.find(key => key.id === id);
      if (!currentApiKey) throw new Error('API Key no encontrada');

      return updateApiKey.mutateAsync({
        id,
        updates: { is_active: !currentApiKey.is_active }
      });
    },
  });

  // Eliminar una API key
  const deleteApiKey = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting AI API key:', id);

      const { error } = await supabase
        .from('ai_api_keys' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting AI API key:', error);
        throw error;
      }

      console.log('AI API key deleted successfully:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-api-keys'] });
      toast.success('API Key eliminada correctamente');
    },
    onError: (error) => {
      console.error('Error deleting AI API key:', error);
      toast.error('Error al eliminar la API Key');
    },
  });

  return {
    apiKeys: apiKeys || [],
    isLoading,
    error,
    createApiKey,
    updateApiKey,
    toggleApiKey,
    deleteApiKey,
  };
};
