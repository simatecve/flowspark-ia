
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
        .from('ai_api_keys')
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

  // Función para obtener el webhook de crear credencial desde la BD
  const getCreateCredentialWebhook = async (): Promise<string> => {
    const { data, error } = await supabase
      .from('webhooks')
      .select('url')
      .eq('name', 'Crear Credencial')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Error fetching webhook:', error);
      throw new Error('No se pudo obtener el webhook para crear credenciales');
    }

    return data.url;
  };

  // Crear una nueva API key
  const createApiKeyMutation = useMutation({
    mutationFn: async (apiKeyData: CreateApiKeyData) => {
      if (!user) throw new Error('Usuario no autenticado');

      console.log('Creating AI API key for provider:', apiKeyData.provider);

      // Obtener la URL del webhook desde la base de datos
      const webhookUrl = await getCreateCredentialWebhook();
      console.log('Using webhook URL from database:', webhookUrl);
      
      try {
        console.log('Executing webhook:', webhookUrl, 'with data:', {
          provider: apiKeyData.provider,
          api_key: apiKeyData.api_key,
          user_id: user.id
        });

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: apiKeyData.provider,
            api_key: apiKeyData.api_key,
            user_id: user.id,
          }),
        });

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text();
          console.error('Webhook error response:', webhookResponse.status, errorText);
          throw new Error(`Error al ejecutar el webhook: ${webhookResponse.status} - ${errorText}`);
        }

        console.log('Webhook executed successfully');
      } catch (webhookError) {
        console.error('Error executing webhook:', webhookError);
        toast.error('Error al ejecutar el webhook: ' + (webhookError as Error).message);
        throw webhookError;
      }

      // Si el webhook fue exitoso, guardar en la base de datos
      const { data, error } = await supabase
        .from('ai_api_keys')
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
      toast.success('API Key guardada y webhook ejecutado correctamente');
    },
    onError: (error) => {
      console.error('Error creating AI API key:', error);
      toast.error('Error al guardar la API Key');
    },
  });

  // Actualizar una API key existente
  const updateApiKeyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AIApiKey> }) => {
      console.log('Updating AI API key:', id);

      const { data, error } = await supabase
        .from('ai_api_keys')
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

  const toggleApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const currentApiKey = apiKeys?.find(key => key.id === id);
      if (!currentApiKey) throw new Error('API Key no encontrada');

      return updateApiKeyMutation.mutateAsync({
        id,
        updates: { is_active: !currentApiKey.is_active }
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting AI API key:', id);

      const { error } = await supabase
        .from('ai_api_keys')
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
    isLoadingApiKeys: isLoading,
    error,
    createApiKey: createApiKeyMutation.mutate,
    isCreatingApiKey: createApiKeyMutation.isPending,
    updateApiKey: updateApiKeyMutation.mutate,
    toggleApiKey: toggleApiKeyMutation.mutate,
    deleteApiKey: deleteApiKeyMutation.mutate,
    isDeletingApiKey: deleteApiKeyMutation.isPending,
  };
};
