
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

  const renderAttachment = () => {
    if (!message.attachment_url) return null;

    switch (message.message_type) {
      case 'image':
      case 'imageMessage':
        return (
          <div className="mb-2">
            <img 
              src={message.attachment_url} 
              alt="Imagen adjunta"
              className="max-w-xs rounded-lg cursor-pointer"
              onClick={() => window.open(message.attachment_url, '_blank')}
            />
          </div>
        );
      case 'video':
        return (
          <div className="mb-2">
            <video 
              src={message.attachment_url}
              controls
              className="max-w-xs rounded-lg"
            />
          </div>
        );
      case 'audio':
      case 'audioMessage':
        return (
          <div className="mb-2">
            <audio 
              src={message.attachment_url}
              controls
              className="w-full max-w-xs"
            />
          </div>
        );
      case 'document':
        return (
          <div className="mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(message.attachment_url, '_blank')}
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
