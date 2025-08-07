
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  MessageSquare, 
  Users, 
  Megaphone,
  Bot,
  HardDrive,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useUserUsage, useUserPlan } from '@/hooks/useUserUsage';

export const AnalyticsOverview = () => {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();
  const { data: userUsage, isLoading: usageLoading } = useUserUsage();
  const { data: userPlan, isLoading: planLoading } = useUserPlan();

  if (dashboardLoading || usageLoading || planLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const plan = userPlan || {
    name: 'Plan Básico',
    max_whatsapp_connections: 2,
    max_contacts: 500,
    max_monthly_campaigns: 3,
    max_bot_responses: 1000,
    max_storage_mb: 500,
    max_conversations: 50
  };

  const usage = userUsage || {
    whatsapp_connections_used: 0,
    contacts_used: 0,
    campaigns_this_month: 0,
    bot_responses_this_month: 0,
    storage_used_mb: 0,
    conversations_used: 0
  };

  const calculatePercentage = (used: number, limit: number) => {
    if (!limit || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return 'destructive' as const;
    if (percentage >= 70) return 'outline' as const;
    return 'secondary' as const;
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Simulamos datos de crecimiento
  const generateGrowth = () => Math.random() * 20 - 5; // Entre -5% y 15%

  const metrics = [
    {
      title: 'Conexiones WhatsApp',
      value: dashboardData?.activeConnections || 0,
      limit: plan.max_whatsapp_connections,
      icon: Phone,
      color: 'text-emerald-600',
      growth: 5.2
    },
    {
      title: 'Conversaciones Activas',
      value: dashboardData?.conversationsCount || 0,
      limit: plan.max_conversations,
      icon: MessageSquare,
      color: 'text-blue-600',
      growth: 12.3
    },
    {
      title: 'Total Contactos',
      value: dashboardData?.contactsCount || 0,
      limit: plan.max_contacts,
      icon: Users,
      color: 'text-purple-600',
      growth: 8.7
    },
    {
      title: 'Campañas Este Mes',
      value: dashboardData?.totalCampaigns || 0,
      limit: plan.max_monthly_campaigns,
      icon: Megaphone,
      color: 'text-orange-600',
      growth: -2.1
    },
    {
      title: 'Respuestas Bot',
      value: usage.bot_responses_this_month || 0,
      limit: plan.max_bot_responses,
      icon: Bot,
      color: 'text-green-600',
      growth: 15.8
    },
    {
      title: 'Almacenamiento',
      value: usage.storage_used_mb || 0,
      limit: plan.max_storage_mb,
      icon: HardDrive,
      color: 'text-indigo-600',
      growth: 3.4,
      unit: 'MB'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const percentage = calculatePercentage(metric.value || 0, metric.limit || 1);
        const badgeVariant = getBadgeVariant(percentage);
        
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {(metric.value || 0).toLocaleString()}{metric.unit || ''}
                  </div>
                  <Badge variant={badgeVariant} className="text-xs">
                    {percentage.toFixed(0)}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    de {(metric.limit || 0).toLocaleString()}{metric.unit || ''}
                  </span>
                  <div className={`flex items-center gap-1 ${getGrowthColor(metric.growth)}`}>
                    {getGrowthIcon(metric.growth)}
                    <span>{Math.abs(metric.growth).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
