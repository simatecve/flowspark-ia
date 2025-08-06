
import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ConversationList } from './ConversationList';
import { ChatArea } from './ChatArea';
import { useConversations } from '@/hooks/useConversations';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import type { Conversation } from '@/types/messages';

export const MessagesPage = () => {
  const { conversations, isLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const queryClient = useQueryClient();

  // Realtime subscription para conversaciones
  useEffect(() => {
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          console.log('Conversation updated, refetching...');
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Realtime subscription para mensajes
  useEffect(() => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          console.log('New message received, refetching...');
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mensajería</h2>
        <p className="text-muted-foreground">
          Gestiona tus conversaciones de WhatsApp
        </p>
      </div>
      
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de conversaciones */}
        <div className="col-span-4">
          <Card className="h-full">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-whatsapp-500" />
                <h3 className="font-semibold">Conversaciones</h3>
              </div>
            </div>
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversation?.id || null}
              onSelectConversation={handleSelectConversation}
              isLoading={isLoading}
            />
          </Card>
        </div>

        {/* Área de chat */}
        <div className="col-span-8">
          <Card className="h-full flex flex-col">
            <ChatArea conversation={selectedConversation} />
          </Card>
        </div>
      </div>
    </div>
  );
};
