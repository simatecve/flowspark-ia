
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { CreateContactData, Contact } from '@/types/contacts';

export const useBulkContacts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkCreateContactsMutation = useMutation({
    mutationFn: async (contacts: CreateContactData[]) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Bulk creating contacts:', contacts);

      const contactsWithUserId = contacts.map(contact => ({
        ...contact,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('contacts')
        .insert(contactsWithUserId)
        .select();

      if (error) {
        console.error('Error bulk creating contacts:', error);
        throw new Error('Error al crear los contactos: ' + error.message);
      }
      
      return data as Contact[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "¡Contactos importados!",
        description: `Se han creado ${data.length} contactos correctamente.`,
      });
    },
    onError: (error: any) => {
      console.error('Error bulk creating contacts:', error);
      toast({
        title: "Error",
        description: error.message || "Error al importar los contactos",
        variant: "destructive",
      });
    },
  });

  return {
    bulkCreateContacts: bulkCreateContactsMutation.mutate,
    isBulkCreating: bulkCreateContactsMutation.isPending,
  };
};
