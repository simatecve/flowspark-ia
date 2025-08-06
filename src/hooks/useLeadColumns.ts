
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { LeadColumn, CreateLeadColumnData } from '@/types/leads';

export const useLeadColumns = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: columns = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['lead-columns'],
    queryFn: async (): Promise<LeadColumn[]> => {
      console.log('Fetching lead columns...');
      const { data, error } = await supabase
        .from('lead_columns')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching lead columns:', error);
        throw error;
      }

      console.log('Lead columns fetched:', data);
      return data || [];
    }
  });

  const createColumnMutation = useMutation({
    mutationFn: async (columnData: CreateLeadColumnData) => {
      console.log('Creating lead column:', columnData);
      
      // Get the max position
      const maxPosition = columns.length > 0 ? Math.max(...columns.map(c => c.position)) + 1 : 0;
      
      const { data, error } = await supabase
        .from('lead_columns')
        .insert({
          ...columnData,
          position: columnData.position ?? maxPosition
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating lead column:', error);
        throw error;
      }

      console.log('Lead column created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-columns'] });
      toast({
        title: "Columna creada",
        description: "La columna ha sido creada exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Create column mutation error:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la columna. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const updateColumnMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<LeadColumn> & { id: string }) => {
      console.log('Updating lead column:', id, updateData);
      
      const { data, error } = await supabase
        .from('lead_columns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lead column:', error);
        throw error;
      }

      console.log('Lead column updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-columns'] });
      toast({
        title: "Columna actualizada",
        description: "La columna ha sido actualizada exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Update column mutation error:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la columna. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: string) => {
      console.log('Deleting lead column:', columnId);
      
      const { error } = await supabase
        .from('lead_columns')
        .delete()
        .eq('id', columnId);

      if (error) {
        console.error('Error deleting lead column:', error);
        throw error;
      }

      console.log('Lead column deleted:', columnId);
      return columnId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-columns'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Columna eliminada",
        description: "La columna ha sido eliminada exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Delete column mutation error:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la columna. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  return {
    columns,
    isLoading,
    error,
    createColumn: createColumnMutation.mutate,
    updateColumn: updateColumnMutation.mutate,
    deleteColumn: deleteColumnMutation.mutate,
    isCreating: createColumnMutation.isPending,
    isUpdating: updateColumnMutation.isPending,
    isDeleting: deleteColumnMutation.isPending
  };
};
