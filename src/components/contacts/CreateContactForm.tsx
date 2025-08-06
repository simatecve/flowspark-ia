
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useContacts } from '@/hooks/useContacts';

interface CreateContactFormProps {
  onContactCreated?: () => void;
}

export const CreateContactForm = ({ onContactCreated }: CreateContactFormProps) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const { createContact, isCreatingContact } = useContacts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phoneNumber.trim()) {
      return;
    }

    createContact({
      name: name.trim(),
      phone_number: phoneNumber.trim(),
      email: email.trim() || undefined,
    });

    // Limpiar formulario
    setName('');
    setPhoneNumber('');
    setEmail('');
    
    // Notify parent component
    onContactCreated?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Contacto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="contact-name">Nombre</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del contacto"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone-number">Número de teléfono</Label>
            <Input
              id="phone-number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@ejemplo.com"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isCreatingContact || !name.trim() || !phoneNumber.trim()}
            className="w-full"
          >
            {isCreatingContact ? 'Creando...' : 'Crear Contacto'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
