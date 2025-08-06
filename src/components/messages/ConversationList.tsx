
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
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
  isLoading
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div>
          <p className="text-muted-foreground">No hay conversaciones</p>
          <p className="text-sm text-muted-foreground mt-1">
            Las conversaciones aparecerán aquí cuando recibas mensajes
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`
              flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors
              ${selectedConversationId === conversation.id 
                ? 'bg-accent' 
                : 'hover:bg-accent/50'
              }
            `}
            onClick={() => onSelectConversation(conversation)}
          >
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-whatsapp-500 text-white">
                {conversation.pushname?.charAt(0).toUpperCase() || 
                 conversation.whatsapp_number.slice(-2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">
                  {conversation.pushname || conversation.whatsapp_number}
                </p>
                {conversation.last_message_at && (
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.last_message_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.last_message}
                </p>
                {conversation.unread_count > 0 && (
                  <Badge variant="default" className="bg-whatsapp-500 text-white text-xs">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {conversation.whatsapp_number}
                </p>
                <p className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded">
                  {conversation.instance_name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
