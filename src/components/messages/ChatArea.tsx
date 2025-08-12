
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageInput } from './MessageInput';
import { MessageBubble } from './MessageBubble';
import { LeadColumnSelector } from './LeadColumnSelector';
import { useMessages } from '@/hooks/useMessages';
import { useConversations } from '@/hooks/useConversations';
import type { Conversation } from '@/types/messages';

interface ChatAreaProps {
  conversation: Conversation | null;
}

export const ChatArea = ({ conversation }: ChatAreaProps) => {
  const { messages, isLoading, sendMessageToConversation, isSending } = useMessages(conversation?.id || null);
  const { markAsRead } = useConversations();

  // Marcar conversación como leída cuando se selecciona
  React.useEffect(() => {
    if (conversation && conversation.unread_count > 0) {
      markAsRead(conversation.id);
    }
  }, [conversation, markAsRead]);

  const handleSendMessage = (message: string, attachment?: string) => {
    if (!conversation) return;

    sendMessageToConversation({
      conversation_id: conversation.id,
      message,
      attachment_url: attachment,
      message_type: attachment ? 'image' : 'text',
    });
  };

  const handleFileUploaded = (url: string) => {
    handleSendMessage('', url);
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-whatsapp-500 text-white text-2xl">
                W
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
          <p className="text-muted-foreground">
            Elige una conversación de la lista para comenzar a chatear
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header de la conversación - fijo en la parte superior */}
      <div className="flex-shrink-0 border-b p-4 bg-background sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-whatsapp-500 text-white">
                {conversation.pushname?.charAt(0).toUpperCase() || 
                 conversation.whatsapp_number.slice(-2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {conversation.pushname || conversation.whatsapp_number}
              </h3>
              <p className="text-sm text-muted-foreground">
                {conversation.whatsapp_number}
                {!conversation.user_id && (
                  <span className="ml-2 text-xs bg-accent px-2 py-1 rounded">
                    Público
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Selector de columna de leads */}
          <LeadColumnSelector 
            phoneNumber={conversation.whatsapp_number}
            pushname={conversation.pushname}
          />
        </div>
      </div>

      {/* Área de mensajes - con scroll independiente, considerando espacio para input fijo */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pb-32">
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full min-h-[200px] text-center">
                <div>
                  <p className="text-muted-foreground">No hay mensajes</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Inicia una conversación enviando un mensaje
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input para escribir mensajes - posición fija en la parte inferior */}
      <div className="flex-shrink-0 sticky bottom-0 z-10">
        <MessageInput 
          value=""
          onChange={() => {}}
          onSend={() => handleSendMessage('')}
          onFileUploaded={handleFileUploaded}
          instanceName={conversation.instance_name}
          whatsappNumber={conversation.whatsapp_number}
          pushname={conversation.pushname}
          disabled={isSending}
        />
      </div>
    </div>
  );
};
