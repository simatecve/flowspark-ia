
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useConnectionStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateConnectionStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'conectado' | 'desconectado' }) => {
      console.log('Updating connection status:', id, status);
      
      const { error } = await supabase
        .from('whatsapp_connections')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating connection status:', error);
        throw error;
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: status === 'conectado' ? "Conectado" : "Desconectado",
        description: `La conexión se ha ${status === 'conectado' ? 'conectado' : 'desconectado'} correctamente.`,
      });
    },
    onError: (error: any) => {
      console.error('Error updating connection status:', error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el estado de la conexión",
        variant: "destructive",
      });
    },
  });

  return {
    updateConnectionStatus: updateConnectionStatusMutation.mutate,
    isUpdatingStatus: updateConnectionStatusMutation.isPending,
  };
};
