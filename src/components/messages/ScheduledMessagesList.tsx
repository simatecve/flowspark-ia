
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trash2, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useScheduledMessages } from '@/hooks/useScheduledMessages';

export const ScheduledMessagesList = () => {
  const { scheduledMessages, deleteScheduledMessage, isLoading } = useScheduledMessages();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'sent':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'sent':
        return 'Enviado';
      case 'failed':
        return 'Fallido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando mensajes programados...</p>
        </div>
      </div>
    );
  }

  if (scheduledMessages.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No tienes mensajes programados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Mensajes programados</h3>
      
      <div className="grid gap-4">
        {scheduledMessages.map((scheduledMessage) => (
          <Card key={scheduledMessage.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{scheduledMessage.pushname || scheduledMessage.whatsapp_number}</span>
                  <Badge 
                    variant="secondary" 
                    className={cn("text-white", getStatusColor(scheduledMessage.status))}
                  >
                    {getStatusText(scheduledMessage.status)}
                  </Badge>
                </div>
                {scheduledMessage.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteScheduledMessage(scheduledMessage.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Programado para: {format(new Date(scheduledMessage.scheduled_for), "PPP 'a las' p", { locale: es })}
                </span>
              </div>
              
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4 mt-0.5" />
                <span>Instancia: {scheduledMessage.instance_name}</span>
              </div>
              
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="text-sm">{scheduledMessage.message}</p>
              </div>
              
              {scheduledMessage.error_message && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">Error: {scheduledMessage.error_message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
