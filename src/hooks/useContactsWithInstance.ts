
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ContactWithInstance {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  whatsapp_instance?: string;
}

export const useContactsWithInstance = () => {
  const { user } = useAuth();

  const { data: contacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['contacts-with-instance'],
    queryFn: async (): Promise<ContactWithInstance[]> => {
      console.log('Fetching contacts with instance info for user:', user?.id);
      
      if (!user) {
        return [];
      }

      // Obtener contactos del usuario
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        throw contactsError;
      }

      // Para cada contacto, verificar si existe como lead y obtener su instancia
      const contactsWithInstance: ContactWithInstance[] = [];

      for (const contact of contactsData || []) {
        // Buscar si este contacto existe como lead
        const { data: leadData } = await supabase
          .from('leads')
          .select('instancia')
          .eq('user_id', user.id)
          .eq('phone', contact.phone_number)
          .limit(1)
          .maybeSingle();

        contactsWithInstance.push({
          ...contact,
          whatsapp_instance: leadData?.instancia || undefined
        });
      }

      console.log('Fetched contacts with instance:', contactsWithInstance);
      return contactsWithInstance;
    },
    enabled: !!user,
  });

  return {
    contacts,
    isLoadingContacts
  };
};
