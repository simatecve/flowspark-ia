
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
  const { getQRWebhook } = useWhatsAppConnections();

  const generateQR = async () => {
    setIsLoading(true);
    try {
      console.log('Generating QR code for connection:', connectionName);
      
      // Obtener la URL del webhook desde la base de datos
      const webhookUrl = await getQRWebhook();
      console.log('Using QR webhook URL from database:', webhookUrl);
      
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
        console.error('QR generation error:', errorText);
        throw new Error(`Error al generar el código QR: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('QR response:', responseData);

      // La respuesta es un array, tomamos el primer elemento
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].success) {
        const data = responseData[0].data;
        if (data && data.base64) {
          // El base64 ya viene con el prefijo data:image/png;base64,
          setQrCode(data.base64);
        } else {
          throw new Error('No se recibió el código QR en el formato esperado');
        }
      } else {
        throw new Error('Respuesta del webhook no válida');
      }
    } catch (error: any) {
      console.error('Error generating QR:', error);
      toast({
        title: "Error",
        description: error.message || "Error al generar el código QR",
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
      generateQR();
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
                onClick={generateQR}
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
