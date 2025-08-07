
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Phone, Users, Megaphone, Bot, HardDrive } from 'lucide-react';
import { useUserUsage, useUserPlan } from '@/hooks/useUserUsage';

export const UsageOverview = () => {
  const { data: usage, isLoading: usageLoading } = useUserUsage();
  const { data: plan, isLoading: planLoading } = useUserPlan();

  if (usageLoading || planLoading) {
    return <div>Cargando información de uso...</div>;
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground">No tienes un plan asignado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usageData = [
    {
      label: 'Conexiones WhatsApp',
      icon: Phone,
      used: usage?.whatsapp_connections_used || 0,
      limit: plan.max_whatsapp_connections,
      color: 'text-emerald-600',
    },
    {
      label: 'Contactos',
      icon: Users,
      used: usage?.contacts_used || 0,
      limit: plan.max_contacts,
      color: 'text-blue-600',
    },
    {
      label: 'Campañas este mes',
      icon: Megaphone,
      used: usage?.campaigns_this_month || 0,
      limit: plan.max_monthly_campaigns,
      color: 'text-orange-600',
    },
    {
      label: 'Respuestas Bot este mes',
      icon: Bot,
      used: usage?.bot_responses_this_month || 0,
      limit: plan.max_bot_responses,
      color: 'text-green-600',
    },
    {
      label: 'Almacenamiento',
      icon: HardDrive,
      used: usage?.storage_used_mb || 0,
      limit: plan.max_storage_mb,
      color: 'text-purple-600',
      unit: 'MB',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Plan Actual: {plan.name}
            <Badge variant="secondary">${plan.price}/mes</Badge>
          </CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usageData.map((item) => {
          const Icon = item.icon;
          const percentage = (item.used / item.limit) * 100;
          const isNearLimit = percentage >= 80;

          return (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {item.used.toLocaleString()} / {item.limit.toLocaleString()} {item.unit || ''}
                    </span>
                    <span className={isNearLimit ? 'text-destructive' : 'text-muted-foreground'}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  {isNearLimit && (
                    <p className="text-xs text-destructive">
                      ⚠️ Cerca del límite
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
