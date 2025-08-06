
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Phone, QrCode, Unplug } from 'lucide-react';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { QRConnectModal } from './QRConnectModal';

export const ConnectionsList = () => {
  const { 
    connections, 
    isLoadingConnections, 
    deleteConnection, 
    isDeletingConnection 
  } = useWhatsAppConnections();
  
  const { updateConnectionStatus, isUpdatingStatus } = useConnectionStatus();
  
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);

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

  const handleQRConnect = (connection: any) => {
    setSelectedConnection(connection);
    setQrModalOpen(true);
  };

  const handleConnectionSuccess = () => {
    if (selectedConnection) {
      updateConnectionStatus({ 
        id: selectedConnection.id, 
        status: 'conectado' 
      });
    }
  };

  const handleDisconnect = (connection: any) => {
    updateConnectionStatus({ 
      id: connection.id, 
      status: 'desconectado' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conectado':
        return '#22c55e'; // green
      case 'desconectado':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'Conectado';
      case 'desconectado':
        return 'Desconectado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'default' as const;
      case 'desconectado':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {connections.map((connection) => (
          <Card key={connection.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getStatusColor(connection.status) }}
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
                  <Badge variant={getStatusVariant(connection.status)}>
                    {getStatusText(connection.status)}
                  </Badge>
                  
                  {connection.status === 'desconectado' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQRConnect(connection)}
                      disabled={isUpdatingStatus}
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      Conectar con QR
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(connection)}
                      disabled={isUpdatingStatus}
                    >
                      <Unplug className="w-4 h-4 mr-1" />
                      Desconectar
                    </Button>
                  )}
                  
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

      {selectedConnection && (
        <QRConnectModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          connectionName={selectedConnection.name}
          phoneNumber={selectedConnection.phone_number}
          connectionId={selectedConnection.id}
          onConnectionSuccess={handleConnectionSuccess}
        />
      )}
    </>
  );
};
