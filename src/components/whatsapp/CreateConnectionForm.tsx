
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';

const colors = [
  { name: 'Azul', value: '#3B82F6', class: 'bg-blue-500' },
  { name: 'Verde', value: '#10B981', class: 'bg-emerald-500' },
  { name: 'Rojo', value: '#EF4444', class: 'bg-red-500' },
  { name: 'Púrpura', value: '#8B5CF6', class: 'bg-violet-500' },
  { name: 'Naranja', value: '#F59E0B', class: 'bg-amber-500' },
  { name: 'Rosa', value: '#EC4899', class: 'bg-pink-500' },
];

export const CreateConnectionForm = () => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0].value);
  const [phoneNumber, setPhoneNumber] = useState('');

  const { createConnection, isCreatingConnection } = useWhatsAppConnections();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phoneNumber.trim()) {
      return;
    }

    createConnection({
      name: name.trim(),
      color: selectedColor,
      phone_number: phoneNumber.trim(),
    });

    // Limpiar formulario
    setName('');
    setPhoneNumber('');
    setSelectedColor(colors[0].value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Conexión de WhatsApp</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la conexión</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: WhatsApp Principal"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Número de WhatsApp</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ej: +5491123456789"
              required
            />
          </div>

          <div>
            <Label>Color de identificación</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`flex items-center gap-2 p-2 rounded-md border-2 transition-colors ${
                    selectedColor === color.value
                      ? 'border-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${color.class}`} />
                  <span className="text-sm">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isCreatingConnection || !name.trim() || !phoneNumber.trim()}
            className="w-full"
          >
            {isCreatingConnection ? 'Creando...' : 'Crear Conexión'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
