
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailMessages: true,
    emailCampaigns: true,
    emailReports: false,
    pushMessages: true,
    pushCampaigns: false,
    pushReports: true,
    smsMessages: false,
    smsCampaigns: false,
    whatsappNotifications: true,
    weeklyReports: true,
    monthlyReports: false,
    systemAlerts: true
  });

  const handleSwitchChange = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSettings = () => {
    // Aquí guardarías las configuraciones en la base de datos
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias de notificación han sido actualizadas.",
    });
  };

  const NotificationGroup = ({ 
    title, 
    description, 
    children 
  }: { 
    title: string; 
    description: string; 
    children: React.ReactNode;
  }) => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const NotificationSwitch = ({ 
    id, 
    label, 
    description, 
    checked, 
    onCheckedChange 
  }: {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: () => void;
  }) => (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex-1">
        <Label htmlFor={id} className="text-sm font-normal">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Notificaciones</CardTitle>
        <CardDescription>
          Personaliza cómo y cuándo quieres recibir notificaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NotificationGroup
          title="Notificaciones por Email"
          description="Recibe notificaciones en tu correo electrónico"
        >
          <NotificationSwitch
            id="emailMessages"
            label="Mensajes nuevos"
            description="Notificaciones cuando recibas nuevos mensajes"
            checked={settings.emailMessages}
            onCheckedChange={() => handleSwitchChange('emailMessages')}
          />
          <NotificationSwitch
            id="emailCampaigns"
            label="Estado de campañas"
            description="Actualizaciones sobre el estado de tus campañas"
            checked={settings.emailCampaigns}
            onCheckedChange={() => handleSwitchChange('emailCampaigns')}
          />
          <NotificationSwitch
            id="emailReports"
            label="Reportes automáticos"
            description="Recibe reportes de rendimiento por email"
            checked={settings.emailReports}
            onCheckedChange={() => handleSwitchChange('emailReports')}
          />
        </NotificationGroup>

        <NotificationGroup
          title="Notificaciones Push"
          description="Notificaciones en tiempo real en tu navegador"
        >
          <NotificationSwitch
            id="pushMessages"
            label="Mensajes en tiempo real"
            description="Notificaciones push para mensajes urgentes"
            checked={settings.pushMessages}
            onCheckedChange={() => handleSwitchChange('pushMessages')}
          />
          <NotificationSwitch
            id="pushCampaigns"
            label="Campañas completadas"
            description="Notificación cuando una campaña termine"
            checked={settings.pushCampaigns}
            onCheckedChange={() => handleSwitchChange('pushCampaigns')}
          />
          <NotificationSwitch
            id="pushReports"
            label="Alertas de sistema"
            description="Notificaciones sobre el estado del sistema"
            checked={settings.pushReports}
            onCheckedChange={() => handleSwitchChange('pushReports')}
          />
        </NotificationGroup>

        <NotificationGroup
          title="WhatsApp Business"
          description="Configuraciones específicas para WhatsApp"
        >
          <NotificationSwitch
            id="whatsappNotifications"
            label="Notificaciones WhatsApp"
            description="Recibe notificaciones sobre tu cuenta de WhatsApp Business"
            checked={settings.whatsappNotifications}
            onCheckedChange={() => handleSwitchChange('whatsappNotifications')}
          />
        </NotificationGroup>

        <NotificationGroup
          title="Reportes Periódicos"
          description="Configuración de reportes automáticos"
        >
          <NotificationSwitch
            id="weeklyReports"
            label="Reporte semanal"
            description="Resumen semanal de actividad y métricas"
            checked={settings.weeklyReports}
            onCheckedChange={() => handleSwitchChange('weeklyReports')}
          />
          <NotificationSwitch
            id="monthlyReports"
            label="Reporte mensual"
            description="Análisis detallado mensual de rendimiento"
            checked={settings.monthlyReports}
            onCheckedChange={() => handleSwitchChange('monthlyReports')}
          />
        </NotificationGroup>

        <div className="pt-4 border-t">
          <Button onClick={saveSettings} className="w-full">
            Guardar Configuración
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
