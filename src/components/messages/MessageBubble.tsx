
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bot, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Message } from '@/types/messages';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isOutgoing = message.direction === 'outgoing';
  
  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: es });
  };

  const isBase64Data = (url: string) => {
    return url.startsWith('data:') || !url.startsWith('http');
  };

  const getDataUrl = (attachmentUrl: string, messageType: string) => {
    if (attachmentUrl.startsWith('data:')) {
      return attachmentUrl;
    }
    
    // Si no tiene el prefijo data:, asumimos que es base64 puro
    switch (messageType) {
      case 'image':
      case 'imageMessage':
        return `data:image/jpeg;base64,${attachmentUrl}`;
      case 'audio':
      case 'audioMessage':
        return `data:audio/mpeg;base64,${attachmentUrl}`;
      case 'video':
        return `data:video/mp4;base64,${attachmentUrl}`;
      default:
        return attachmentUrl;
    }
  };

  const renderAttachment = () => {
    if (!message.attachment_url) return null;

    const isBase64 = isBase64Data(message.attachment_url);
    const mediaUrl = isBase64 
      ? getDataUrl(message.attachment_url, message.message_type || 'text')
      : message.attachment_url;

    switch (message.message_type) {
      case 'image':
      case 'imageMessage':
        return (
          <div className="mb-2">
            <img 
              src={mediaUrl}
              alt="Imagen adjunta"
              className="max-w-xs rounded-lg cursor-pointer"
              onClick={() => {
                if (isBase64) {
                  // Para base64, abrir en nueva pestaña
                  const newWindow = window.open();
                  if (newWindow) {
                    newWindow.document.write(`
                      <html>
                        <head><title>Imagen</title></head>
                        <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
                          <img src="${mediaUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" />
                        </body>
                      </html>
                    `);
                  }
                } else {
                  window.open(mediaUrl, '_blank');
                }
              }}
              onError={(e) => {
                console.error('Error loading image:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        );
      case 'video':
        return (
          <div className="mb-2">
            <video 
              src={mediaUrl}
              controls
              className="max-w-xs rounded-lg"
              onError={(e) => {
                console.error('Error loading video:', e);
              }}
            />
          </div>
        );
      case 'audio':
      case 'audioMessage':
        return (
          <div className="mb-2">
            <audio 
              src={mediaUrl}
              controls
              className="w-full max-w-xs"
              onError={(e) => {
                console.error('Error loading audio:', e);
              }}
            />
          </div>
        );
      case 'document':
        return (
          <div className="mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isBase64) {
                  // Para documentos base64, crear un blob y descargarlo
                  try {
                    const base64Data = message.attachment_url.includes(',') 
                      ? message.attachment_url.split(',')[1] 
                      : message.attachment_url;
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray]);
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'documento';
                    link.click();
                    URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error('Error downloading file:', error);
                  }
                } else {
                  window.open(message.attachment_url, '_blank');
                }
              }}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar archivo
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative
          ${isOutgoing 
            ? 'bg-whatsapp-500 text-white' 
            : 'bg-muted'
          }
        `}
      >
        {!isOutgoing && message.pushname && (
          <p className="text-xs font-medium mb-1 text-whatsapp-600">
            {message.pushname}
          </p>
        )}
        
        {message.is_bot && (
          <div className="flex items-center gap-1 mb-2">
            <Bot className="h-3 w-3" />
            <Badge variant="secondary" className="text-xs">
              Bot
            </Badge>
          </div>
        )}

        {renderAttachment()}
        
        {message.message && (
          <p className="break-words whitespace-pre-wrap">
            {message.message}
          </p>
        )}
        
        <div className={`
          flex items-center justify-end gap-1 mt-1
          ${isOutgoing ? 'text-white/70' : 'text-muted-foreground'}
        `}>
          <span className="text-xs">
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};
