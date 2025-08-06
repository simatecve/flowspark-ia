
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Phone } from 'lucide-react';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ConnectionsList = () => {
  const { 
    connections, 
    isLoadingConnections, 
    deleteConnection, 
    isDeletingConnection 
  } = useWhatsAppConnections();

  if (isLoadingConnections) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Cargando conexiones...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No hay conexiones de WhatsApp configuradas
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => (
        <Card key={connection.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: connection.color }}
                />
                <div>
                  <h3 className="font-medium">{connection.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {connection.phone_number}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Creado el {format(new Date(connection.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={connection.status === 'active' ? 'default' : 'secondary'}
                >
                  {connection.status === 'active' ? 'Activo' : 'Pendiente'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteConnection(connection.id)}
                  disabled={isDeletingConnection}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
