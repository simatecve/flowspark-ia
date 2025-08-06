
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Users, Phone, Mail, Plus, Minus, Upload, UserPlus } from 'lucide-react';
import { useContactLists } from '@/hooks/useContactLists';
import { CreateContactForm } from './CreateContactForm';
import { BulkContactImport } from './BulkContactImport';
import type { ContactList } from '@/types/contacts';

interface ContactListManagementProps {
  contactList: ContactList;
  onBack: () => void;
}

export const ContactListManagement = ({ contactList, onBack }: ContactListManagementProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { 
    useContactsInList,
    addContactToList,
    removeContactFromList,
    isAddingContactToList,
    isRemovingContactFromList
  } = useContactLists();

  const { data: contacts, isLoading } = useContactsInList(contactList.id, refreshKey);

  const handleToggleMembership = (contactId: string, isMember: boolean) => {
    if (isMember) {
      removeContactFromList({ listId: contactList.id, contactId });
    } else {
      addContactToList({ listId: contactList.id, contactId });
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const membersCount = contacts?.filter(c => c.is_member).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{contactList.name}</h2>
          {contactList.description && (
            <p className="text-muted-foreground">{contactList.description}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gestionar ({membersCount})
          </TabsTrigger>
          <TabsTrigger value="add-individual" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Crear Individual
          </TabsTrigger>
          <TabsTrigger value="bulk-import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar en Lote
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestionar Contactos
                <Badge variant="secondary">{membersCount} miembros</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-muted-foreground">Cargando contactos...</div>
              ) : !contacts || contacts.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay contactos disponibles. Crea algunos contactos primero.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{contact.name}</span>
                          {contact.is_member && (
                            <Badge variant="default" className="text-xs">
                              En la lista
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone_number}
                          </div>
                          {contact.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={contact.is_member || false}
                          onCheckedChange={() => handleToggleMembership(contact.id, contact.is_member || false)}
                          disabled={isAddingContactToList || isRemovingContactFromList}
                        />
                        {contact.is_member ? (
                          <Minus className="h-4 w-4 text-red-500" />
                        ) : (
                          <Plus className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-individual" className="mt-6">
          <div className="max-w-2xl">
            <CreateContactForm onContactCreated={handleRefresh} />
          </div>
        </TabsContent>

        <TabsContent value="bulk-import" className="mt-6">
          <div className="max-w-2xl">
            <BulkContactImport onContactsImported={handleRefresh} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
