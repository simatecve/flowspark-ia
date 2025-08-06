
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MassCampaign {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  whatsapp_connection_name: string;
  campaign_message: string;
  edit_with_ai: boolean;
  min_delay: number;
  max_delay: number;
  status: string;
  attachment_urls: string[];
  attachment_names: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  whatsapp_connection_name: string;
  campaign_message: string;
  edit_with_ai: boolean;
  min_delay: number;
  max_delay: number;
  attachment_urls?: string[];
  attachment_names?: string[];
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {}

export const useMassCampaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener campañas
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['mass-campaigns'],
    queryFn: async () => {
      console.log('Fetching mass campaigns for user:', user?.id);
      const { data, error } = await supabase
        .from('mass_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }
      console.log('Fetched campaigns:', data);
      return data as unknown as MassCampaign[];
    },
    enabled: !!user,
  });

  // Crear campaña
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: CreateCampaignData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating mass campaign:', campaignData);

      const { data, error } = await supabase
        .from('mass_campaigns')
        .insert({
          name: campaignData.name,
          description: campaignData.description,
          whatsapp_connection_name: campaignData.whatsapp_connection_name,
          campaign_message: campaignData.campaign_message,
          edit_with_ai: campaignData.edit_with_ai,
          min_delay: campaignData.min_delay,
          max_delay: campaignData.max_delay,
          attachment_urls: campaignData.attachment_urls || [],
          attachment_names: campaignData.attachment_names || [],
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        throw new Error('Error al crear la campaña: ' + error.message);
      }
      
      return data as unknown as MassCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mass-campaigns'] });
      toast({
        title: "¡Campaña creada!",
        description: "La campaña masiva se ha creado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la campaña",
        variant: "destructive",
      });
    },
  });

  // Actualizar campaña
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCampaignData & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Updating campaign:', id, updateData);

      const { data, error } = await supabase
        .from('mass_campaigns')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating campaign:', error);
        throw new Error('Error al actualizar la campaña: ' + error.message);
      }
      
      return data as unknown as MassCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mass-campaigns'] });
      toast({
        title: "Campaña actualizada",
        description: "La campaña se ha actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating campaign:', error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la campaña",
        variant: "destructive",
      });
    },
  });

  // Eliminar campaña
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting campaign:', id);

      const { error } = await supabase
        .from('mass_campaigns')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting campaign:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mass-campaigns'] });
      toast({
        title: "Campaña eliminada",
        description: "La campaña se ha eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la campaña",
        variant: "destructive",
      });
    },
  });

  return {
    campaigns,
    isLoadingCampaigns,
    createCampaign: createCampaignMutation.mutate,
    isCreatingCampaign: createCampaignMutation.isPending,
    updateCampaign: updateCampaignMutation.mutate,
    isUpdatingCampaign: updateCampaignMutation.isPending,
    deleteCampaign: deleteCampaignMutation.mutate,
    isDeletingCampaign: deleteCampaignMutation.isPending,
  };
};
