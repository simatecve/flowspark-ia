
import React from 'react';
import { Users } from 'lucide-react';
import { ContactCard } from './ContactCard';
import { useContactsWithInstance } from '@/hooks/useContactsWithInstance';

export const ContactsList = () => {
  const { contacts, isLoadingContacts } = useContactsWithInstance();

  if (isLoadingContacts) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
          No hay contactos
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea tu primer contacto para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
};
