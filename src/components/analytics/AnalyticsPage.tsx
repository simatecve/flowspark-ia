
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, TrendingDown, Activity, Users, MessageSquare, Bot, Zap } from 'lucide-react';
import { useUserUsage, useUserPlan } from '@/hooks/useUserUsage';
import { useDashboardData } from '@/hooks/useDashboardData';
import { UsageChart } from './UsageChart';
import { MessagesChart } from './MessagesChart';
import { ResponseRateChart } from './ResponseRateChart';
import { CampaignStatsChart } from './CampaignStatsChart';

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('bar');
  
  const { data: userUsage, isLoading: usageLoading } = useUserUsage();
  const { data: userPlan, isLoading: planLoading } = useUserPlan();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();

  if (usageLoading || planLoading || dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const plan = userPlan || {
    name: 'Plan Básico',
    price: 29.99,
    description: 'Plan básico para comenzar',
    max_whatsapp_connections: 2,
    max_contacts: 500,
    max_monthly_campaigns: 3,
    max_bot_responses: 1000,
    max_storage_mb: 500
  };

  const usage = userUsage || {
    whatsapp_connections_used: 0,
    contacts_used: 0,
    campaigns_this_month: 0,
    bot_responses_this_month: 0,
    storage_used_mb: 0
  };

  const calculatePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { color: 'text-red-600', status: 'Crítico', variant: 'destructive' as const };
    if (percentage >= 70) return { color: 'text-orange-600', status: 'Alto', variant: 'outline' as const };
    return { color: 'text-green-600', status: 'Normal', variant: 'secondary' as const };
  };

  // Datos simulados para gráficos (en un caso real vendrían de la base de datos)
  const mockMessagesData = [
    { date: '2024-01-01', enviados: 120, recibidos: 95 },
    { date: '2024-01-02', enviados: 150, recibidos: 110 },
    { date: '2024-01-03', enviados: 180, recibidos: 140 },
    { date: '2024-01-04', enviados: 200, recibidos: 165 },
    { date: '2024-01-05', enviados: 170, recibidos: 130 },
    { date: '2024-01-06', enviados: 220, recibidos: 180 },
    { date: '2024-01-07', enviados: 250, recibidos: 200 }
  ];

  const mockResponseData = [
    { date: '2024-01-01', tasa: 78 },
    { date: '2024-01-02', tasa: 82 },
    { date: '2024-01-03', tasa: 75 },
    { date: '2024-01-04', tasa: 88 },
    { date: '2024-01-05', tasa: 79 },
    { date: '2024-01-06', tasa: 85 },
    { date: '2024-01-07', tasa: 90 }
  ];

  const mockCampaignData = [
    { campaign: 'Promoción Enero', enviados: 500, entregados: 485, abiertos: 320, clicks: 145 },
    { campaign: 'Newsletter', enviados: 300, entregados: 295, abiertos: 180, clicks: 65 },
    { campaign: 'Oferta Especial', enviados: 200, entregados: 190, abiertos: 140, clicks: 80 }
  ];

  // Cálculos de estadísticas
  const connectionsPercentage = calculatePercentage(dashboardData?.activeConnections || 0, plan.max_whatsapp_connections);
  const contactsPercentage = calculatePercentage(dashboardData?.contactsCount || 0, plan.max_contacts);
  const campaignsPercentage = calculatePercentage(usage.campaigns_this_month, plan.max_monthly_campaigns);
  const botPercentage = calculatePercentage(usage.bot_responses_this_month, plan.max_bot_responses);

  const connectionsStatus = getUsageStatus(connectionsPercentage);
  const contactsStatus = getUsageStatus(contactsPercentage);
  const campaignsStatus = getUsageStatus(campaignsPercentage);
  const botStatus = getUsageStatus(botPercentage);

  const totalMessages = mockMessagesData.reduce((sum, day) => sum + day.enviados + day.recibidos, 0);
  const averageResponseRate = mockResponseData.reduce((sum, day) => sum + day.tasa, 0) / mockResponseData.length;
  const totalCampaignsSent = mockCampaignData.reduce((sum, campaign) => sum + campaign.enviados, 0);
  const totalOpened = mockCampaignData.reduce((sum, campaign) => sum + campaign.abiertos, 0);
  const overallOpenRate = totalCampaignsSent > 0 ? (totalOpened / totalCampaignsSent) * 100 : 0;

  // Comparación con período anterior (simulado)
  const previousMessages = 1200;
  const messagesGrowth = ((totalMessages - previousMessages) / previousMessages) * 100;
  
  const previousResponseRate = 78;
  const responseRateGrowth = averageResponseRate - previousResponseRate;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics y Estadísticas</h2>
          <p className="text-muted-foreground">
            Análisis detallado de tu plan {plan.name} y rendimiento de tus campañas
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Último día</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Gráfico de barras</SelectItem>
              <SelectItem value="line">Gráfico de líneas</SelectItem>
              <SelectItem value="area">Gráfico de área</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumen de estadísticas clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {messagesGrowth > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
                  <span className="text-green-600">+{messagesGrowth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-4 w-4 text-red-600" />
                  <span className="text-red-600">{messagesGrowth.toFixed(1)}%</span>
                </>
              )}
              <span className="ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageResponseRate.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {responseRateGrowth > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
                  <span className="text-green-600">+{responseRateGrowth.toFixed(1)}%</span>
                </>
              ) : responseRateGrowth < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-4 w-4 text-red-600" />
                  <span className="text-red-600">{responseRateGrowth.toFixed(1)}%</span>
                </>
              ) : (
                <span>Sin cambios</span>
              )}
              <span className="ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.contactsCount || 0}</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {plan.max_contacts.toLocaleString()} límite
              </div>
              <Badge variant={contactsStatus.variant} className="text-xs">
                {contactsStatus.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Apertura</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallOpenRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {totalCampaignsSent.toLocaleString()} mensajes enviados
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage">Uso del Plan</TabsTrigger>
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consumo de Recursos - {plan.name}</CardTitle>
              <CardDescription>
                Monitoreo en tiempo real del uso de tu plan (actualizado cada 30 segundos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">Conexiones WhatsApp</span>
                      <Badge variant={connectionsStatus.variant} className="text-xs">
                        {connectionsStatus.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {dashboardData?.activeConnections || 0} / {plan.max_whatsapp_connections}
                    </span>
                  </div>
                  <Progress value={connectionsPercentage} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Contactos</span>
                      <Badge variant={contactsStatus.variant} className="text-xs">
                        {contactsStatus.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {dashboardData?.contactsCount || 0} / {plan.max_contacts.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={contactsPercentage} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium">Campañas este mes</span>
                      <Badge variant={campaignsStatus.variant} className="text-xs">
                        {campaignsStatus.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {usage.campaigns_this_month} / {plan.max_monthly_campaigns}
                    </span>
                  </div>
                  <Progress value={campaignsPercentage} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-medium">Respuestas Bot</span>
                      <Badge variant={botStatus.variant} className="text-xs">
                        {botStatus.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {usage.bot_responses_this_month} / {plan.max_bot_responses.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={botPercentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gráfico de Uso por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageChart 
                userUsage={usage} 
                userPlan={plan} 
                dashboardData={dashboardData} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad de Mensajes</CardTitle>
              <CardDescription>
                Mensajes enviados y recibidos en los últimos {timeRange === '1d' ? '1 día' : timeRange === '7d' ? '7 días' : timeRange === '30d' ? '30 días' : '3 meses'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessagesChart timeFilter={timeRange} chartType={chartType} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tasa de Respuesta</CardTitle>
              <CardDescription>
                Porcentaje de mensajes que recibieron respuesta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponseRateChart timeFilter={timeRange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Campañas</CardTitle>
              <CardDescription>
                Estadísticas detalladas de tus campañas de marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignStatsChart timeFilter={timeRange} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
