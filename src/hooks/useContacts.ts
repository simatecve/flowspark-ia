
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Contact, CreateContactData } from '@/types/contacts';

export const useContacts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener contactos
  const { data: contacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      console.log('Fetching contacts for user:', user?.id);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }
      console.log('Fetched contacts:', data);
      return data as Contact[];
    },
    enabled: !!user,
  });

  // Crear contacto
  const createContactMutation = useMutation({
    mutationFn: async (contactData: CreateContactData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating contact:', contactData);

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          name: contactData.name,
          phone_number: contactData.phone_number,
          email: contactData.email,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw new Error('Error al crear el contacto: ' + error.message);
      }
      
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "¡Contacto creado!",
        description: "El contacto se ha creado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating contact:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear el contacto",
        variant: "destructive",
      });
    },
  });

  // Eliminar contacto
  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting contact:', id);

      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast({
        title: "Contacto eliminado",
        description: "El contacto se ha eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el contacto",
        variant: "destructive",
      });
    },
  });

  return {
    contacts,
    isLoadingContacts,
    createContact: createContactMutation.mutate,
    isCreatingContact: createContactMutation.isPending,
    deleteContact: deleteContactMutation.mutate,
    isDeletingContact: deleteContactMutation.isPending,
  };
};
