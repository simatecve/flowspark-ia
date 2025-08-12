
import React, { useState, useEffect } from 'react';
import { MessageCircle, Filter, Search, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversationList } from './ConversationList';
import { ChatArea } from './ChatArea';
import { InstanceSelector } from './InstanceSelector';
import { ScheduledMessagesTab } from './ScheduledMessagesTab';
import { useConversations } from '@/hooks/useConversations';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import type { Conversation } from '@/types/messages';

export const MessagesPage = () => {
  const [selectedInstance, setSelectedInstance] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const instanceName = selectedInstance === 'all' ? undefined : selectedInstance;
  
  const { conversations, isLoading } = useConversations(instanceName);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const queryClient = useQueryClient();

  // Reset selected conversation when instance changes
  useEffect(() => {
    setSelectedConversation(null);
  }, [selectedInstance]);

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

  // Filtrar conversaciones por término de búsqueda
  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    const nameMatch = conversation.pushname?.toLowerCase().includes(term) || false;
    const numberMatch = conversation.whatsapp_number.toLowerCase().includes(term);
    
    return nameMatch || numberMatch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mensajería</h2>
        <p className="text-muted-foreground">
          Gestiona tus conversaciones de WhatsApp y mensajes programados
        </p>
      </div>
      
      <Tabs defaultValue="conversations" className="h-[calc(100vh-200px)]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversaciones
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Mensajes Programados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversations" className="h-full mt-6">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Lista de conversaciones */}
            <div className="col-span-4">
              <Card className="h-full">
                <div className="p-4 border-b space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-whatsapp-500" />
                    <h3 className="font-semibold">Conversaciones</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <InstanceSelector 
                        value={selectedInstance} 
                        onValueChange={setSelectedInstance} 
                      />
                    </div>
                  </div>

                  {/* Filtro de búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
                    <Input
                      placeholder="🔍 Buscar por nombre o número..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <ConversationList
                  conversations={filteredConversations}
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
        </TabsContent>
        
        <TabsContent value="scheduled" className="h-full mt-6">
          <ScheduledMessagesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
