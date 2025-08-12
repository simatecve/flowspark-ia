
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useScheduledMessages } from '@/hooks/useScheduledMessages';
import { cn } from '@/lib/utils';

export const ScheduledMessagesList = () => {
  const { scheduledMessages, cancelScheduledMessage, isLoading } = useScheduledMessages();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (scheduledMessages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay mensajes programados</h3>
          <p className="text-muted-foreground text-center">
            Los mensajes que programes aparecerán aquí
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-blue-600">Pendiente</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-green-600">Enviado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falló</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Mensajes Programados</h2>
      </div>

      {scheduledMessages.map((message) => (
        <Card key={message.id} className={cn(
          "transition-colors",
          message.status === 'failed' && "border-destructive/50"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {message.pushname || message.whatsapp_number}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(message.scheduled_for), "PPP 'a las' p", { locale: es })}
                </div>
                <p className="text-sm text-muted-foreground">
                  Instancia: {message.instance_name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(message.status)}
                {message.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelScheduledMessage(message.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Mensaje:</p>
                <p className="text-sm bg-muted p-3 rounded-md">{message.message}</p>
              </div>
              
              {message.error_message && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error:</p>
                    <p className="text-sm text-destructive">{message.error_message}</p>
                  </div>
                </div>
              )}
              
              {message.sent_at && (
                <div className="text-xs text-muted-foreground">
                  Enviado: {format(new Date(message.sent_at), "PPP 'a las' p", { locale: es })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
