
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAIBots, AIBot } from '@/hooks/useAIBots';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';

interface EditBotModalProps {
  bot: AIBot;
  isOpen: boolean;
  onClose: () => void;
}

export const EditBotModal: React.FC<EditBotModalProps> = ({ bot, isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [whatsappConnectionName, setWhatsappConnectionName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [messageDelay, setMessageDelay] = useState(1000);
  const [isActive, setIsActive] = useState(false);

  const { connections, isLoadingConnections } = useWhatsAppConnections();
  const { updateBot, isUpdatingBot } = useAIBots();

  useEffect(() => {
    if (bot && isOpen) {
      setName(bot.name);
      setWhatsappConnectionName(bot.whatsapp_connection_name);
      setInstructions(bot.instructions);
      setMessageDelay(bot.message_delay);
      setIsActive(bot.is_active);
    }
  }, [bot, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !whatsappConnectionName || !instructions.trim()) {
      return;
    }

    updateBot({
      id: bot.id,
      name: name.trim(),
      whatsapp_connection_name: whatsappConnectionName,
      instructions: instructions.trim(),
      message_delay: messageDelay,
      is_active: isActive,
    });

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Bot de IA</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nombre del bot</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Asistente de Ventas"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-connection">Instancia de WhatsApp</Label>
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
            <Label htmlFor="edit-instructions">Instrucciones del bot</Label>
            <Textarea
              id="edit-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe cómo debe comportarse tu bot de IA..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-delay">Delay de mensaje (ms)</Label>
            <Input
              id="edit-delay"
              type="number"
              value={messageDelay}
              onChange={(e) => setMessageDelay(Number(e.target.value))}
              min="100"
              max="10000"
              step="100"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-active">Bot activo</Label>
            <Switch
              id="edit-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdatingBot || !name.trim() || !whatsappConnectionName || !instructions.trim()}
            >
              {isUpdatingBot ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
