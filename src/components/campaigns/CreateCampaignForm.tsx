
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMassCampaigns } from '@/hooks/useMassCampaigns';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';

export const CreateCampaignForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsappConnectionName, setWhatsappConnectionName] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [editWithAi, setEditWithAi] = useState(false);
  const [minDelay, setMinDelay] = useState(1000);
  const [maxDelay, setMaxDelay] = useState(5000);

  const { connections, isLoadingConnections } = useWhatsAppConnections();
  const { createCampaign, isCreatingCampaign } = useMassCampaigns();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !whatsappConnectionName || !campaignMessage.trim()) {
      return;
    }

    createCampaign({
      name: name.trim(),
      description: description.trim() || undefined,
      whatsapp_connection_name: whatsappConnectionName,
      campaign_message: campaignMessage.trim(),
      edit_with_ai: editWithAi,
      min_delay: minDelay,
      max_delay: maxDelay,
    });

    // Limpiar formulario
    setName('');
    setDescription('');
    setWhatsappConnectionName('');
    setCampaignMessage('');
    setEditWithAi(false);
    setMinDelay(1000);
    setMaxDelay(5000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Campaña Masiva</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="campaign-name">Nombre de la campaña</Label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Campaña Navideña 2024"
              required
            />
          </div>

          <div>
            <Label htmlFor="campaign-description">Descripción (opcional)</Label>
            <Textarea
              id="campaign-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el objetivo de esta campaña..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="connection">Instancia de WhatsApp</Label>
            <Select value={whatsappConnectionName} onValueChange={setWhatsappConnectionName}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una instancia" />
              </SelectTrigger>
              <SelectContent>
                {connections?.map((connection) => (
                  <SelectItem key={connection.id} value={connection.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: connection.color }}
                      />
                      {connection.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="campaign-message">Mensaje de campaña</Label>
            <Textarea
              id="campaign-message"
              value={campaignMessage}
              onChange={(e) => setCampaignMessage(e.target.value)}
              placeholder="Escribe el mensaje que se enviará a los contactos..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="edit-ai">Editar con IA</Label>
              <p className="text-sm text-muted-foreground">
                Permite que la IA personalice el mensaje para cada contacto
              </p>
            </div>
            <Switch
              id="edit-ai"
              checked={editWithAi}
              onCheckedChange={setEditWithAi}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-delay">Delay mínimo (ms)</Label>
              <Input
                id="min-delay"
                type="number"
                value={minDelay}
                onChange={(e) => setMinDelay(Number(e.target.value))}
                min="100"
                max="30000"
                step="100"
              />
            </div>
            
            <div>
              <Label htmlFor="max-delay">Delay máximo (ms)</Label>
              <Input
                id="max-delay"
                type="number"
                value={maxDelay}
                onChange={(e) => setMaxDelay(Number(e.target.value))}
                min="100"
                max="30000"
                step="100"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isCreatingCampaign || !name.trim() || !whatsappConnectionName || !campaignMessage.trim()}
            className="w-full"
          >
            {isCreatingCampaign ? 'Creando...' : 'Crear Campaña'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
