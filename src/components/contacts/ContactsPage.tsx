
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, List, User, Users } from 'lucide-react';
import { CreateContactForm } from './CreateContactForm';
import { ContactsList } from './ContactsList';
import { CreateContactListForm } from './CreateContactListForm';
import { ContactListsList } from './ContactListsList';
import { ContactListManagement } from './ContactListManagement';
import type { ContactList } from '@/types/contacts';

export const ContactsPage = () => {
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);

  if (selectedList) {
    return (
      <ContactListManagement 
        contactList={selectedList} 
        onBack={() => setSelectedList(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Listas de Contactos</h2>
        <p className="text-muted-foreground">
          Organiza tus contactos en listas para facilitar el envío de campañas masivas
        </p>
      </div>
      
      <Tabs defaultValue="lists" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lists" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Listas
          </TabsTrigger>
          <TabsTrigger value="create-list" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Lista
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Contactos
          </TabsTrigger>
          <TabsTrigger value="create-contact" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Contacto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lists" className="mt-6">
          <div className="w-full">
            <ContactListsList onSelectList={setSelectedList} />
          </div>
        </TabsContent>

        <TabsContent value="create-list" className="mt-6">
          <div className="max-w-2xl">
            <CreateContactListForm />
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <div className="w-full">
            <ContactsList />
          </div>
        </TabsContent>

        <TabsContent value="create-contact" className="mt-6">
          <div className="max-w-2xl">
            <CreateContactForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
