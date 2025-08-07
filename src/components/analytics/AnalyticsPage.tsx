
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Phone, 
  Megaphone,
  Bot,
  HardDrive,
  Calendar,
  Filter
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useUserUsage, useUserPlan } from '@/hooks/useUserUsage';
import { MessagesChart } from './MessagesChart';
import { ResponseRateChart } from './ResponseRateChart';
import { CampaignStatsChart } from './CampaignStatsChart';
import { UsageChart } from './UsageChart';

export const AnalyticsPage = () => {
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartType, setChartType] = useState<'messages' | 'usage' | 'campaigns'>('messages');
  
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();
  const { data: userUsage, isLoading: usageLoading } = useUserUsage();
  const { data: userPlan, isLoading: planLoading } = useUserPlan();

  if (dashboardLoading || usageLoading || planLoading) {
    return <div>Cargando analytics...</div>;
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

  // Métricas principales
  const mainMetrics = [
    {
      title: 'Conexiones WhatsApp',
      value: dashboardData?.activeConnections || 0,
      limit: plan.max_whatsapp_connections || 1,
      icon: Phone,
      color: 'text-emerald-600',
      growth: 5.2
    },
    {
      title: 'Conversaciones Activas',
      value: dashboardData?.conversationsCount || 0,
      limit: plan.max_conversations || 50,
      icon: MessageSquare,
      color: 'text-blue-600',
      growth: 12.3
    },
    {
      title: 'Total Contactos',
      value: dashboardData?.contactsCount || 0,
      limit: plan.max_contacts || 500,
      icon: Users,
      color: 'text-purple-600',
      growth: 8.7
    },
    {
      title: 'Campañas Este Mes',
      value: dashboardData?.totalCampaigns || 0,
      limit: plan.max_monthly_campaigns || 3,
      icon: Megaphone,
      color: 'text-orange-600',
      growth: -2.1
    },
    {
      title: 'Respuestas Bot',
      value: usage.bot_responses_this_month,
      limit: plan.max_bot_responses || 1000,
      icon: Bot,
      color: 'text-green-600',
      growth: 15.8
    },
    {
      title: 'Almacenamiento',
      value: usage.storage_used_mb,
      limit: plan.max_storage_mb || 500,
      icon: HardDrive,
      color: 'text-indigo-600',
      growth: 3.4,
      unit: 'MB'
    }
  ];

  // Datos simulados para gráficos (en una app real, estos vendrían de la API)
  const generateMockData = () => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return {
      messages: days.map(date => ({
        date,
        enviados: Math.floor(Math.random() * 100) + 20,
        recibidos: Math.floor(Math.random() * 80) + 15
      })),
      responseRate: days.map(date => ({
        date,
        tasa: Math.floor(Math.random() * 40) + 60
      })),
      campaigns: [
        { campaign: 'Campaña 1', enviados: 150, entregados: 145, abiertos: 98, clicks: 23 },
        { campaign: 'Campaña 2', enviados: 200, entregados: 195, abiertos: 134, clicks: 45 },
        { campaign: 'Campaña 3', enviados: 80, entregados: 78, abiertos: 52, clicks: 12 }
      ]
    };
  };

  const mockData = generateMockData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Análisis detallado de tu actividad y rendimiento
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainMetrics.map((metric) => {
          const Icon = metric.icon;
          const percentage = calculatePercentage(metric.value, metric.limit);
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
                      {metric.value.toLocaleString()}{metric.unit || ''}
                    </div>
                    <Badge variant={badgeVariant} className="text-xs">
                      {percentage.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      de {metric.limit.toLocaleString()}{metric.unit || ''}
                    </span>
                    <div className={`flex items-center gap-1 ${getGrowthColor(metric.growth)}`}>
                      {getGrowthIcon(metric.growth)}
                      <span>{Math.abs(metric.growth)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <Tabs value={chartType} onValueChange={(value: any) => setChartType(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensajes
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Uso de Recursos
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Campañas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad de Mensajes</CardTitle>
                <CardDescription>
                  Mensajes enviados y recibidos en los últimos {timeFilter}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MessagesChart timeFilter={timeFilter} chartType="messages" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tasa de Respuesta</CardTitle>
                <CardDescription>
                  Porcentaje de respuestas obtenidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponseRateChart timeFilter={timeFilter} chartType="response" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uso de Recursos del Plan</CardTitle>
              <CardDescription>
                Consumo actual vs límites del plan {plan.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsageChart timeFilter={timeFilter} chartType="usage" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Campañas</CardTitle>
              <CardDescription>
                Rendimiento de tus campañas de marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignStatsChart timeFilter={timeFilter} chartType="campaigns" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
