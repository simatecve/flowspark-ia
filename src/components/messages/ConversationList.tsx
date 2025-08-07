
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation } from '@/types/messages';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  isLoading: boolean;
}

export const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Cargando conversaciones...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No hay conversaciones disponibles
      </div>
    );
  }

  const formatTime = (date?: string) => {
    if (!date) return '';
    return format(new Date(date), 'dd/MM HH:mm', { locale: es });
  };

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`
              p-3 rounded-lg cursor-pointer border transition-colors
              ${selectedConversationId === conversation.id 
                ? 'bg-accent border-accent' 
                : 'hover:bg-muted/50 border-transparent'
              }
            `}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarFallback 
                    className="text-white font-semibold"
                    style={{ 
                      backgroundColor: conversation.instance_color || '#6b7280'
                    }}
                  >
                    {conversation.pushname?.charAt(0).toUpperCase() || 
                     conversation.whatsapp_number.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                {conversation.unread_count > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center p-0 text-xs"
                  >
                    {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                  </Badge>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {conversation.pushname || conversation.whatsapp_number}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(conversation.last_message_at)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">
                    {conversation.whatsapp_number}
                  </span>
                  {conversation.instance_name && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-1 py-0 h-4"
                      style={{ 
                        borderColor: conversation.instance_color || '#6b7280',
                        color: conversation.instance_color || '#6b7280'
                      }}
                    >
                      {conversation.instance_name}
                    </Badge>
                  )}
                </div>
                
                {conversation.last_message && (
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.last_message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
