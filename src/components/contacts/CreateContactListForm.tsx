
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useContactLists } from '@/hooks/useContactLists';

export const CreateContactListForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { createContactList, isCreatingContactList } = useContactLists();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    createContactList({
      name: name.trim(),
      description: description.trim() || undefined,
    });

    // Limpiar formulario
    setName('');
    setDescription('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Lista de Contactos</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="list-name">Nombre de la lista</Label>
            <Input
              id="list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Clientes VIP, Equipo de trabajo..."
              required
            />
          </div>

          <div>
            <Label htmlFor="list-description">Descripción (opcional)</Label>
            <Textarea
              id="list-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe para qué utilizarás esta lista..."
              className="min-h-[80px]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isCreatingContactList || !name.trim()}
            className="w-full"
          >
            {isCreatingContactList ? 'Creando...' : 'Crear Lista'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
