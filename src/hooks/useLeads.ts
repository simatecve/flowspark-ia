import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Lead, CreateLeadData, UpdateLeadData, MoveLeadData } from '@/types/leads';

export const useLeads = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: leads = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['leads'],
    queryFn: async (): Promise<Lead[]> => {
      console.log('Fetching leads...');
      
      if (!user) {
        console.log('No user found, returning empty leads array');
        return [];
      }

      // Primero obtener las instancias del usuario
      const { data: userInstances, error: instancesError } = await supabase
        .from('whatsapp_connections')
        .select('name')
        .eq('user_id', user.id);

      if (instancesError) {
        console.error('Error fetching user instances:', instancesError);
        throw instancesError;
      }

      const instanceNames = userInstances?.map(instance => instance.name) || [];
      console.log('User instances:', instanceNames);

      // Obtener leads del usuario:
      // 1. Leads que pertenecen a sus instancias
      // 2. Leads que el usuario creó directamente (tienen su user_id pero pueden no tener instancia)
      let query = supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      // Si hay instancias específicas, incluir leads de esas instancias O leads sin instancia
      // Si no hay instancias, solo mostrar leads creados directamente por el usuario
      if (instanceNames.length > 0) {
        query = query.or(`instancia.in.(${instanceNames.join(',')}),instancia.is.null`);
      } else {
        // Si el usuario no tiene instancias, solo mostrar leads sin instancia asignada
        query = query.is('instancia', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      console.log('Leads fetched:', data);

      // If there are leads without column_id, assign them to the default column
      const leadsWithoutColumn = data?.filter(lead => !lead.column_id) || [];
      
      if (leadsWithoutColumn.length > 0 && user) {
        console.log('Found leads without column_id, assigning to default column...');
        
        // Get the default column for this user
        const { data: defaultColumn, error: columnError } = await supabase
          .from('lead_columns')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        if (!columnError && defaultColumn) {
          // Update leads without column_id to use the default column
          const leadIdsToUpdate = leadsWithoutColumn.map(lead => lead.id);
          
          const { error: updateError } = await supabase
            .from('leads')
            .update({ column_id: defaultColumn.id })
            .in('id', leadIdsToUpdate);

          if (updateError) {
            console.error('Error updating leads with default column:', updateError);
          } else {
            console.log('Successfully assigned leads to default column');
            // Update the data with the new column_id
            data?.forEach(lead => {
              if (!lead.column_id) {
                lead.column_id = defaultColumn.id;
              }
            });
          }
        }
      }

      return data || [];
    },
    enabled: !!user
  });

  const createLeadMutation = useMutation({
    mutationFn: async (leadData: CreateLeadData) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating lead:', leadData);
      
      // Get leads in the target column to calculate position
      const columnLeads = leads.filter(l => l.column_id === leadData.column_id);
      const maxPosition = columnLeads.length > 0 ? Math.max(...columnLeads.map(l => l.position)) + 1 : 0;
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          column_id: leadData.column_id,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company,
          value: leadData.value,
          notes: leadData.notes,
          position: leadData.position ?? maxPosition,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating lead:', error);
        throw error;
      }

      console.log('Lead created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead creado",
        description: "El lead ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Create lead mutation error:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el lead. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateLeadData) => {
      console.log('Updating lead:', id, updateData);
      
      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lead:', error);
        throw error;
      }

      console.log('Lead updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead actualizado",
        description: "El lead ha sido actualizado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Update lead mutation error:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el lead. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const moveLeadMutation = useMutation({
    mutationFn: async ({ id, column_id, position }: MoveLeadData) => {
      console.log('Moving lead:', id, 'to column:', column_id, 'position:', position);
      
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          column_id, 
          position,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error moving lead:', error);
        throw error;
      }

      console.log('Lead moved:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      console.error('Move lead mutation error:', error);
      toast({
        title: "Error",
        description: "No se pudo mover el lead. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      console.log('Deleting lead:', leadId);
      
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        console.error('Error deleting lead:', error);
        throw error;
      }

      console.log('Lead deleted:', leadId);
      return leadId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead eliminado",
        description: "El lead ha sido eliminado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Delete lead mutation error:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el lead. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  return {
    leads,
    isLoading,
    error,
    createLead: createLeadMutation.mutate,
    updateLead: updateLeadMutation.mutate,
    moveLead: moveLeadMutation.mutate,
    deleteLead: deleteLeadMutation.mutate,
    isCreating: createLeadMutation.isPending,
    isUpdating: updateLeadMutation.isPending,
    isMoving: moveLeadMutation.isPending,
    isDeleting: deleteLeadMutation.isPending
  };
};
