
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, List } from 'lucide-react';
import { CreateCampaignForm } from './CreateCampaignForm';
import { CampaignsList } from './CampaignsList';

export const MassCampaignsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Campañas Masivas</h2>
        <p className="text-muted-foreground">
          Crea y gestiona campañas de mensajes masivos para tus contactos de WhatsApp
        </p>
      </div>
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Campaña
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Campañas Existentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <div className="max-w-2xl">
            <CreateCampaignForm />
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="w-full">
            <CampaignsList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
