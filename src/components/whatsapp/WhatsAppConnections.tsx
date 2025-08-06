
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, List } from 'lucide-react';
import { CreateConnectionForm } from './CreateConnectionForm';
import { ConnectionsList } from './ConnectionsList';

export const WhatsAppConnections = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Conexiones de WhatsApp</h2>
        <p className="text-muted-foreground">
          Gestiona tus conexiones de WhatsApp para automatizar tus comunicaciones
        </p>
      </div>
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Conexión
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Conexiones Existentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <div className="max-w-2xl">
            <CreateConnectionForm />
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="w-full">
            <ConnectionsList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
