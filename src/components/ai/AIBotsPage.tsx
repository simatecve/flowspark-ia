
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Plus, List } from 'lucide-react';
import { CreateBotForm } from './CreateBotForm';
import { BotsList } from './BotsList';

export const AIBotsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-6 w-6" />
          Bots de IA
        </h2>
        <p className="text-muted-foreground">
          Crea y gestiona bots de inteligencia artificial para automatizar las conversaciones de WhatsApp
        </p>
      </div>
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Bot
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Mis Bots
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <div className="max-w-2xl">
            <CreateBotForm />
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="w-full">
            <BotsList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
