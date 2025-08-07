
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Phone, Users, Megaphone, Bot, HardDrive, Monitor, MessageCircle } from 'lucide-react';
import { useUserUsage, useUserPlan } from '@/hooks/useUserUsage';
import { useDashboardData } from '@/hooks/useDashboardData';

export const UsageOverview = () => {
  const { data: userUsage, isLoading: usageLoading } = useUserUsage();
  const { data: userPlan, isLoading: planLoading } = useUserPlan();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();

  if (usageLoading || planLoading || dashboardLoading) {
    return <div>Cargando información de uso...</div>;
  }

  const plan = userPlan || {
    name: 'Plan Básico',
    price: 29.99,
    description: 'Plan básico para comenzar',
    max_whatsapp_connections: 2,
    max_contacts: 500,
    max_monthly_campaigns: 3,
    max_bot_responses: 1000,
    max_storage_mb: 500,
    max_device_sessions: 1,
    max_conversations: 50
  };

  const usage = userUsage || {
    whatsapp_connections_used: 0,
    contacts_used: 0,
    campaigns_this_month: 0,
    bot_responses_this_month: 0,
    storage_used_mb: 0,
    device_sessions_used: 0,
    conversations_used: 0
  };

  const calculatePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  const getBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return 'destructive' as const;
    if (percentage >= 70) return 'outline' as const;
    return 'secondary' as const;
  };

  const connectionsPercentage = calculatePercentage(dashboardData?.activeConnections || 0, plan.max_whatsapp_connections);
  const contactsPercentage = calculatePercentage(dashboardData?.contactsCount || 0, plan.max_contacts);
  const conversationsPercentage = calculatePercentage(dashboardData?.conversationsCount || 0, plan.max_conversations);
  const campaignsPercentage = calculatePercentage(dashboardData?.totalCampaigns || 0, plan.max_monthly_campaigns);
  const botPercentage = calculatePercentage(usage.bot_responses_this_month, plan.max_bot_responses);
  const storagePercentage = calculatePercentage(usage.storage_used_mb, plan.max_storage_mb);

  const usageItems = [
    {
      name: 'Conexiones WhatsApp',
      icon: Phone,
      used: dashboardData?.activeConnections || 0,
      limit: plan.max_whatsapp_connections,
      percentage: connectionsPercentage,
      color: 'text-emerald-600'
    },
    {
      name: 'Conversaciones',
      icon: MessageCircle,
      used: dashboardData?.conversationsCount || 0,
      limit: plan.max_conversations,
      percentage: conversationsPercentage,
      color: 'text-blue-600'
    },
    {
      name: 'Contactos',
      icon: Users,
      used: dashboardData?.contactsCount || 0,
      limit: plan.max_contacts,
      percentage: contactsPercentage,
      color: 'text-blue-600'
    },
    {
      name: 'Campañas este mes',
      icon: Megaphone,
      used: dashboardData?.totalCampaigns || 0,
      limit: plan.max_monthly_campaigns,
      percentage: campaignsPercentage,
      color: 'text-orange-600'
    },
    {
      name: 'Respuestas Bot',
      icon: Bot,
      used: usage.bot_responses_this_month,
      limit: plan.max_bot_responses,
      percentage: botPercentage,
      color: 'text-green-600'
    },
    {
      name: 'Almacenamiento',
      icon: HardDrive,
      used: usage.storage_used_mb,
      limit: plan.max_storage_mb,
      percentage: storagePercentage,
      color: 'text-purple-600',
      unit: 'MB'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan Actual: {plan.name}</CardTitle>
          <CardDescription>
            ${plan.price}/mes - {plan.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {usageItems.map((item) => {
              const Icon = item.icon;
              const percentage = item.percentage;
              const usageColor = getUsageColor(percentage);
              const badgeVariant = getBadgeVariant(percentage);
              
              return (
                <div key={item.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${item.color}`} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.used.toLocaleString()} / {item.limit.toLocaleString()}{item.unit || ''}
                      </span>
                      <Badge variant={badgeVariant} className="text-xs">
                        {percentage.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${percentage >= 90 ? 'bg-red-100' : percentage >= 70 ? 'bg-orange-100' : 'bg-gray-100'}`}
                  />
                  {percentage >= 90 && (
                    <p className="text-xs text-red-600">
                      ⚠️ Límite casi alcanzado. Considera actualizar tu plan.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
