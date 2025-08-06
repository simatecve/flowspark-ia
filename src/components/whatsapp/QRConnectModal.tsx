
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';
import { Loader2 } from 'lucide-react';

interface QRConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionName: string;
  phoneNumber: string;
  connectionId: string;
  onConnectionSuccess: () => void;
}

export const QRConnectModal = ({
  isOpen,
  onClose,
  connectionName,
  phoneNumber,
  connectionId,
  onConnectionSuccess,
}: QRConnectModalProps) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { getStoredQRCode } = useWhatsAppConnections();

  const loadQRCode = async () => {
    setIsLoading(true);
    try {
      console.log('Executing QR webhook for connection:', connectionName);
      
      // Ejecutar el webhook
      const webhookUrl = 'https://n8nargentina.nocodeveloper.com/webhook/qr_instancia';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: connectionName,
          phone_number: phoneNumber,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('QR webhook error:', errorText);
        throw new Error(`Error al ejecutar el webhook: ${response.status}`);
      }

      console.log('QR webhook executed successfully');

      // Obtener el código QR desde la base de datos
      const storedQR = await getStoredQRCode(connectionId);
      
      if (storedQR) {
        console.log('QR code found in database');
        // Si el base64 no tiene el prefijo, agregarlo
        const qrImageData = storedQR.startsWith('data:image/') 
          ? storedQR 
          : `data:image/png;base64,${storedQR}`;
        setQrCode(qrImageData);
      } else {
        throw new Error('No se encontró el código QR en la base de datos');
      }
    } catch (error: any) {
      console.error('Error loading QR:', error);
      toast({
        title: "Error",
        description: error.message || "Error al cargar el código QR",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnected = async () => {
    setIsConnecting(true);
    try {
      // Marcar la conexión como conectada
      onConnectionSuccess();
      toast({
        title: "¡Conectado!",
        description: "WhatsApp se ha conectado correctamente.",
      });
      onClose();
    } catch (error: any) {
      console.error('Error updating connection:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el estado de la conexión",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !qrCode) {
      loadQRCode();
    }
  }, [isOpen]);

  const handleClose = () => {
    setQrCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp - {connectionName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Generando código QR...</p>
            </div>
          ) : qrCode ? (
            <>
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <img 
                  src={qrCode} 
                  alt="Código QR de WhatsApp" 
                  className="w-64 h-64 object-contain"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  1. Abre WhatsApp en tu teléfono
                </p>
                <p className="text-sm text-muted-foreground">
                  2. Escanea este código QR
                </p>
                <p className="text-sm text-muted-foreground">
                  3. Presiona "Ya he conectado mi WhatsApp"
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Error al cargar el código QR
              </p>
              <Button 
                variant="outline" 
                onClick={loadQRCode}
                className="mt-2"
              >
                Reintentar
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConnected}
            disabled={!qrCode || isLoading || isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              'Ya he conectado mi WhatsApp'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
