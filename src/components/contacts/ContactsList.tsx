
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, User, Phone, Mail } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

export const ContactsList = () => {
  const { contacts, isLoadingContacts, deleteContact, isDeletingContact } = useContacts();

  const handleDelete = (contactId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      deleteContact(contactId);
    }
  };

  if (isLoadingContacts) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground">Cargando contactos...</div>
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay contactos</h3>
          <p className="text-muted-foreground text-center">
            Crea tu primer contacto para comenzar a organizar tu lista
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <Card key={contact.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {contact.name}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{contact.phone_number}</span>
              </div>
              
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contact.email}</span>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                Creado: {new Date(contact.created_at).toLocaleDateString()}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(contact.id)}
                  disabled={isDeletingContact}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
