
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Bell, Key } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import PasswordSettings from './PasswordSettings';
import NotificationSettings from './NotificationSettings';
import AIApiKeysSettings from './AIApiKeysSettings';

const SettingsPage = () => {
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Administra tu cuenta y preferencias de la plataforma
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys IA
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <PasswordSettings />
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <AIApiKeysSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
