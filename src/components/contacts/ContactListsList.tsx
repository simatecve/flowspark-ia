
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, Eye } from 'lucide-react';
import { useContactLists } from '@/hooks/useContactLists';
import type { ContactList } from '@/types/contacts';

interface ContactListsListProps {
  onSelectList: (list: ContactList) => void;
}

export const ContactListsList = ({ onSelectList }: ContactListsListProps) => {
  const { contactLists, isLoadingContactLists, deleteContactList, isDeletingContactList } = useContactLists();

  const handleDelete = (listId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta lista? Se eliminarán todas las relaciones con contactos.')) {
      deleteContactList(listId);
    }
  };

  if (isLoadingContactLists) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground">Cargando listas...</div>
      </div>
    );
  }

  if (!contactLists || contactLists.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay listas de contactos</h3>
          <p className="text-muted-foreground text-center">
            Crea tu primera lista para organizar tus contactos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {contactLists.map((list) => (
        <Card key={list.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {list.name}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {list.description && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Descripción:</div>
                  <div className="text-sm">{list.description}</div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                Creada: {new Date(list.created_at).toLocaleDateString()}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onSelectList(list)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver y gestionar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(list.id)}
                  disabled={isDeletingContactList}
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
