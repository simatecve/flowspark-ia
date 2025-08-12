
import React from 'react';
import { Mail, Phone, User, Smartphone, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContacts } from '@/hooks/useContacts';
import type { ContactWithInstance } from '@/hooks/useContactsWithInstance';

interface ContactCardProps {
  contact: ContactWithInstance;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  const { deleteContact, isDeletingContact } = useContacts();

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el contacto "${contact.name}"?`)) {
      deleteContact(contact.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <h4 className="font-semibold text-sm truncate">{contact.name}</h4>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
            onClick={handleDelete}
            disabled={isDeletingContact}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          {contact.whatsapp_instance && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                {contact.whatsapp_instance}
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{contact.phone_number}</span>
          </div>
          
          {contact.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
