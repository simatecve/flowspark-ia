
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, Plus } from 'lucide-react';
import { CreateApiKeyForm } from './CreateApiKeyForm';
import { ApiKeysList } from './ApiKeysList';

export const IntegrationsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Integraciones</h2>
        <p className="text-muted-foreground">
          Gestiona las API keys de los servicios de inteligencia artificial
        </p>
      </div>
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva API Key
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys Guardadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <div className="max-w-2xl">
            <CreateApiKeyForm />
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="w-full">
            <ApiKeysList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
