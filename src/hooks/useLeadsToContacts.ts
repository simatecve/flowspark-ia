
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/types/leads';

export const useLeadsToContacts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const convertLeadsToContactsMutation = useMutation({
    mutationFn: async ({ leads, columnName }: { leads: Lead[]; columnName: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Converting leads to contacts:', { leads, columnName });

      // Primero crear la lista de contactos
      const { data: contactList, error: listError } = await supabase
        .from('contact_lists')
        .insert({
          name: `Leads - ${columnName}`,
          description: `Lista creada automáticamente desde la columna "${columnName}" de leads`,
          user_id: user.id,
        })
        .select()
        .single();

      if (listError) {
        console.error('Error creating contact list:', listError);
        throw new Error('Error al crear la lista de contactos: ' + listError.message);
      }

      // Luego crear los contactos válidos
      const validLeads = leads.filter(lead => lead.phone && lead.phone.trim());
      
      if (validLeads.length === 0) {
        throw new Error('No se encontraron leads con números de teléfono válidos');
      }

      const contactsToInsert = validLeads.map(lead => ({
        name: lead.name,
        phone_number: lead.phone!,
        email: lead.email || undefined,
        user_id: user.id,
      }));

      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .insert(contactsToInsert)
        .select();

      if (contactsError) {
        console.error('Error creating contacts:', contactsError);
        throw new Error('Error al crear los contactos: ' + contactsError.message);
      }

      // Finalmente agregar los contactos a la lista
      const membershipData = contacts.map(contact => ({
        contact_list_id: contactList.id,
        contact_id: contact.id,
      }));

      const { error: membershipError } = await supabase
        .from('contact_list_members')
        .insert(membershipData);

      if (membershipError) {
        console.error('Error adding contacts to list:', membershipError);
        throw new Error('Error al agregar contactos a la lista: ' + membershipError.message);
      }

      return {
        contactList,
        contacts,
        totalConverted: contacts.length,
        totalSkipped: leads.length - validLeads.length,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      queryClient.invalidateQueries({ queryKey: ['contacts-in-list'] });
      
      toast({
        title: "¡Conversión exitosa!",
        description: `Se crearon ${result.totalConverted} contactos en la lista "${result.contactList.name}"${result.totalSkipped > 0 ? ` (se omitieron ${result.totalSkipped} leads sin teléfono)` : ''}`,
      });
    },
    onError: (error: any) => {
      console.error('Error converting leads to contacts:', error);
      toast({
        title: "Error",
        description: error.message || "Error al convertir leads a contactos",
        variant: "destructive",
      });
    },
  });

  return {
    convertLeadsToContacts: convertLeadsToContactsMutation.mutate,
    isConverting: convertLeadsToContactsMutation.isPending,
  };
};
