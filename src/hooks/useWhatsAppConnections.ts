
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { WhatsAppConnection, CreateWhatsAppConnectionData, Webhook } from '@/types/whatsapp';

export const useWhatsAppConnections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener conexiones de WhatsApp
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['whatsapp-connections'],
    queryFn: async () => {
      console.log('Fetching WhatsApp connections for user:', user?.id);
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching connections:', error);
        throw error;
      }
      console.log('Fetched connections:', data);
      return data as WhatsAppConnection[];
    },
    enabled: !!user,
  });

  // Obtener webhooks (disponibles para todos los usuarios autenticados)
  const { data: webhooks, isLoading: isLoadingWebhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      console.log('Fetching webhooks');
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching webhooks:', error);
        throw error;
      }
      console.log('Fetched webhooks:', data);
      return data as Webhook[];
    },
    enabled: !!user,
  });

  // Función para obtener el webhook de crear instancia desde la BD
  const getCreateInstanceWebhook = async (): Promise<string> => {
    const { data, error } = await supabase
      .from('webhooks')
      .select('url')
      .eq('name', 'Crear Instancia WhatsApp')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Error fetching webhook:', error);
      throw new Error('No se pudo obtener el webhook para crear instancias');
    }

    return data.url;
  };

  // Función para obtener el webhook de eliminar instancia desde la BD
  const getDeleteInstanceWebhook = async (): Promise<string> => {
    const { data, error } = await supabase
      .from('webhooks')
      .select('url')
      .eq('name', 'Eliminar Instancia WhatsApp')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Error fetching delete webhook:', error);
      throw new Error('No se pudo obtener el webhook para eliminar instancias');
    }

    return data.url;
  };

  // Crear conexión de WhatsApp
  const createConnectionMutation = useMutation({
    mutationFn: async (connectionData: CreateWhatsAppConnectionData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating WhatsApp connection:', connectionData);

      // Obtener la URL del webhook CREAR desde la base de datos
      const webhookUrl = await getCreateInstanceWebhook();
      console.log('Using create webhook URL:', webhookUrl);

      // Ejecutar el webhook
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: connectionData.name,
          color: connectionData.color,
          phone_number: connectionData.phone_number,
          user_id: user.id,
        }),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('Webhook error response:', errorText);
        throw new Error(`Error al ejecutar el webhook: ${webhookResponse.status} - ${errorText}`);
      }

      console.log('Webhook executed successfully, saving to database');

      // Si el webhook fue exitoso, guardar en la base de datos
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .insert({
          name: connectionData.name,
          color: connectionData.color,
          phone_number: connectionData.phone_number,
          user_id: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Error al guardar en la base de datos: ' + error.message);
      }
      
      return data as WhatsAppConnection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: "¡Conexión creada!",
        description: "La conexión de WhatsApp se ha creado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating WhatsApp connection:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la conexión de WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Eliminar conexión
  const deleteConnectionMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting WhatsApp connection:', id);

      // Primero obtener los datos de la conexión que se va a eliminar
      const { data: connectionData, error: fetchError } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !connectionData) {
        console.error('Error fetching connection data:', fetchError);
        throw new Error('No se pudo obtener la información de la conexión');
      }

      // Obtener la URL del webhook ELIMINAR desde la base de datos
      const webhookUrl = await getDeleteInstanceWebhook();
      console.log('Using delete webhook URL:', webhookUrl);

      // Ejecutar el webhook con los datos de la conexión a eliminar
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: connectionData.name,
          color: connectionData.color,
          phone_number: connectionData.phone_number,
          user_id: user.id,
        }),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('Webhook error response:', errorText);
        throw new Error(`Error al ejecutar el webhook: ${webhookResponse.status} - ${errorText}`);
      }

      console.log('Delete webhook executed successfully, proceeding with database deletion');

      // Si el webhook fue exitoso, eliminar de la base de datos
      const { error } = await supabase
        .from('whatsapp_connections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting connection:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: "Conexión eliminada",
        description: "La conexión de WhatsApp se ha eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting connection:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la conexión",
        variant: "destructive",
      });
    },
  });

  return {
    connections,
    webhooks,
    isLoadingConnections,
    isLoadingWebhooks,
    createConnection: createConnectionMutation.mutate,
    isCreatingConnection: createConnectionMutation.isPending,
    deleteConnection: deleteConnectionMutation.mutate,
    isDeletingConnection: deleteConnectionMutation.isPending,
  };
};
