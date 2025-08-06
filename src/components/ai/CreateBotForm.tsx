
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAIBots } from '@/hooks/useAIBots';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';

export const CreateBotForm = () => {
  const [name, setName] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [messageDelay, setMessageDelay] = useState(1000);
  const [isActive, setIsActive] = useState(false);

  const { createBot, isCreatingBot } = useAIBots();
  const { connections, isLoadingConnections } = useWhatsAppConnections();

  // Filtrar solo las conexiones conectadas
  const activeConnections = connections?.filter(conn => conn.status === 'conectado') || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !selectedConnectionId || !instructions.trim()) {
      return;
    }

    createBot({
      name: name.trim(),
      whatsapp_connection_id: selectedConnectionId,
      instructions: instructions.trim(),
      message_delay: messageDelay,
      is_active: isActive,
    });

    // Limpiar formulario
    setName('');
    setSelectedConnectionId('');
    setInstructions('');
    setMessageDelay(1000);
    setIsActive(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Bot de IA</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Nombre del Bot</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Asistente de Ventas"
              required
            />
          </div>

          <div>
            <Label htmlFor="connection">Instancia de WhatsApp</Label>
            {isLoadingConnections ? (
              <div className="text-sm text-muted-foreground">Cargando conexiones...</div>
            ) : activeConnections.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No hay conexiones de WhatsApp activas. Primero debes crear y conectar una instancia de WhatsApp.
              </div>
            ) : (
              <Select value={selectedConnectionId} onValueChange={setSelectedConnectionId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una instancia" />
                </SelectTrigger>
                <SelectContent>
                  {activeConnections.map((connection) => (
                    <SelectItem key={connection.id} value={connection.id}>
                      {connection.name} ({connection.phone_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="instructions">Instrucciones para el Bot</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Escribe las instrucciones detalladas para el comportamiento del bot..."
              className="min-h-[120px] resize-y"
              required
            />
          </div>

          <div>
            <Label htmlFor="delay">Delay entre mensajes (ms)</Label>
            <Input
              id="delay"
              type="number"
              value={messageDelay}
              onChange={(e) => setMessageDelay(parseInt(e.target.value) || 1000)}
              min="100"
              max="10000"
              step="100"
            />
            <div className="text-sm text-muted-foreground mt-1">
              Tiempo de espera entre mensajes en milisegundos (100-10000)
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="active">Bot activo</Label>
          </div>

          <Button 
            type="submit" 
            disabled={isCreatingBot || !name.trim() || !selectedConnectionId || !instructions.trim() || activeConnections.length === 0}
            className="w-full"
          >
            {isCreatingBot ? 'Creando...' : 'Crear Bot'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
