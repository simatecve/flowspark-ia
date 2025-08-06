
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Bot } from 'lucide-react';
import { useAIBots } from '@/hooks/useAIBots';
import { EditBotModal } from './EditBotModal';
import type { AIBot } from '@/hooks/useAIBots';

export const BotsList = () => {
  const { bots, isLoadingBots, updateBot, deleteBot, isDeletingBot } = useAIBots();
  const [editingBot, setEditingBot] = useState<AIBot | null>(null);

  const handleToggleActive = (botId: string, currentState: boolean) => {
    updateBot({ id: botId, is_active: !currentState });
  };

  const handleDelete = (botId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este bot?')) {
      deleteBot(botId);
    }
  };

  const handleEdit = (bot: AIBot) => {
    setEditingBot(bot);
  };

  const handleCloseEdit = () => {
    setEditingBot(null);
  };

  if (isLoadingBots) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground">Cargando bots...</div>
      </div>
    );
  }

  if (!bots || bots.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Bot className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay bots creados</h3>
          <p className="text-muted-foreground text-center">
            Crea tu primer bot de IA para automatizar las conversaciones de WhatsApp
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {bots.map((bot) => (
          <Card key={bot.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {bot.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={bot.is_active ? "default" : "secondary"}>
                    {bot.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Switch
                    checked={bot.is_active}
                    onCheckedChange={() => handleToggleActive(bot.id, bot.is_active)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Instancia WhatsApp:</div>
                  <div className="text-sm">
                    {bot.whatsapp_connection_name}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Instrucciones:</div>
                  <div className="text-sm bg-muted p-2 rounded-md mt-1 max-h-20 overflow-y-auto">
                    {bot.instructions}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Delay: {bot.message_delay}ms</span>
                  <span>Creado: {new Date(bot.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(bot)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(bot.id)}
                    disabled={isDeletingBot}
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

      {editingBot && (
        <EditBotModal
          bot={editingBot}
          isOpen={!!editingBot}
          onClose={handleCloseEdit}
        />
      )}
    </>
  );
};
