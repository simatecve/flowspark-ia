
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ContactList, CreateContactListData, ContactWithMembership } from '@/types/contacts';

export const useContactLists = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener listas de contactos
  const { data: contactLists, isLoading: isLoadingContactLists } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: async () => {
      console.log('Fetching contact lists for user:', user?.id);
      const { data, error } = await supabase
        .from('contact_lists')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching contact lists:', error);
        throw error;
      }
      console.log('Fetched contact lists:', data);
      return data as ContactList[];
    },
    enabled: !!user,
  });

  // Obtener contactos de una lista específica con información de membresía
  const useContactsInList = (listId: string, refreshKey: number = 0) => {
    return useQuery({
      queryKey: ['contacts-in-list', listId, refreshKey],
      queryFn: async () => {
        console.log('Fetching contacts in list:', listId);
        
        // Obtener todos los contactos del usuario
        const { data: allContacts, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .order('name', { ascending: true });

        if (contactsError) {
          console.error('Error fetching contacts:', contactsError);
          throw contactsError;
        }

        // Obtener los miembros de esta lista
        const { data: members, error: membersError } = await supabase
          .from('contact_list_members')
          .select('contact_id')
          .eq('contact_list_id', listId);

        if (membersError) {
          console.error('Error fetching list members:', membersError);
          throw membersError;
        }

        const memberIds = new Set(members.map(m => m.contact_id));
        
        // Marcar qué contactos están en la lista
        const contactsWithMembership: ContactWithMembership[] = allContacts.map(contact => ({
          ...contact,
          is_member: memberIds.has(contact.id)
        }));

        return contactsWithMembership;
      },
      enabled: !!user && !!listId,
    });
  };

  // Crear lista de contactos
  const createContactListMutation = useMutation({
    mutationFn: async (listData: CreateContactListData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating contact list:', listData);

      const { data, error } = await supabase
        .from('contact_lists')
        .insert({
          name: listData.name,
          description: listData.description,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating contact list:', error);
        throw new Error('Error al crear la lista: ' + error.message);
      }
      
      return data as ContactList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast({
        title: "¡Lista creada!",
        description: "La lista de contactos se ha creado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating contact list:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la lista",
        variant: "destructive",
      });
    },
  });

  // Agregar contacto a lista
  const addContactToListMutation = useMutation({
    mutationFn: async ({ listId, contactId }: { listId: string; contactId: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Adding contact to list:', { listId, contactId });

      const { data, error } = await supabase
        .from('contact_list_members')
        .insert({
          contact_list_id: listId,
          contact_id: contactId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding contact to list:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts-in-list', variables.listId] });
      toast({
        title: "Contacto agregado",
        description: "El contacto se ha agregado a la lista correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error adding contact to list:', error);
      toast({
        title: "Error",
        description: error.message || "Error al agregar el contacto a la lista",
        variant: "destructive",
      });
    },
  });

  // Remover contacto de lista
  const removeContactFromListMutation = useMutation({
    mutationFn: async ({ listId, contactId }: { listId: string; contactId: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Removing contact from list:', { listId, contactId });

      const { error } = await supabase
        .from('contact_list_members')
        .delete()
        .eq('contact_list_id', listId)
        .eq('contact_id', contactId);

      if (error) {
        console.error('Error removing contact from list:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts-in-list', variables.listId] });
      toast({
        title: "Contacto removido",
        description: "El contacto se ha removido de la lista correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error removing contact from list:', error);
      toast({
        title: "Error",
        description: error.message || "Error al remover el contacto de la lista",
        variant: "destructive",
      });
    },
  });

  // Eliminar lista
  const deleteContactListMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting contact list:', id);

      const { error } = await supabase
        .from('contact_lists')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact list:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast({
        title: "Lista eliminada",
        description: "La lista de contactos se ha eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting contact list:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la lista",
        variant: "destructive",
      });
    },
  });

  return {
    contactLists,
    isLoadingContactLists,
    useContactsInList,
    createContactList: createContactListMutation.mutate,
    isCreatingContactList: createContactListMutation.isPending,
    addContactToList: addContactToListMutation.mutate,
    isAddingContactToList: addContactToListMutation.isPending,
    removeContactFromList: removeContactFromListMutation.mutate,
    isRemovingContactFromList: removeContactFromListMutation.isPending,
    deleteContactList: deleteContactListMutation.mutate,
    isDeletingContactList: deleteContactListMutation.isPending,
  };
};
