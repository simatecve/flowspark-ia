
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, Users, MessageSquare, Bot, Zap, MessageCircle } from 'lucide-react';
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
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { color: 'text-red-600', status: 'Crítico', variant: 'destructive' as const };
    if (percentage >= 70) return { color: 'text-orange-600', status: 'Alto', variant: 'outline' as const };
    return { color: 'text-green-600', status: 'Normal', variant: 'secondary' as const };
  };

  // Cálculos de estadísticas con datos reales
  const connectionsPercentage = calculatePercentage(dashboardData?.activeConnections || 0, plan.max_whatsapp_connections);
  const contactsPercentage = calculatePercentage(dashboardData?.contactsCount || 0, plan.max_contacts);
  const conversationsPercentage = calculatePercentage(dashboardData?.conversationsCount || 0, plan.max_conversations);
  const campaignsPercentage = calculatePercentage(dashboardData?.totalCampaigns || 0, plan.max_monthly_campaigns);
  const botPercentage = calculatePercentage(usage.bot_responses_this_month, plan.max_bot_responses);

  const connectionsStatus = getUsageStatus(connectionsPercentage);
  const contactsStatus = getUsageStatus(contactsPercentage);
  const conversationsStatus = getUsageStatus(conversationsPercentage);
  const campaignsStatus = getUsageStatus(campaignsPercentage);
  const botStatus = getUsageStatus(botPercentage);

  const totalMessages = dashboardData?.totalMessages || 0;
  const averageResponseRate = dashboardData?.responseRate || 0;
  const totalCampaignsSent = dashboardData?.totalCampaigns || 0;

  // Comparación con período anterior (simulado - en producción vendría de la DB)
  const previousMessages = Math.floor(totalMessages * 0.8);
  const messagesGrowth = previousMessages > 0 ? ((totalMessages - previousMessages) / previousMessages) * 100 : 0;
  
  const previousResponseRate = Math.max(0, averageResponseRate - 5);
  const responseRateGrowth = averageResponseRate - previousResponseRate;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics y Estadísticas</h2>
          <p className="text-muted-foreground">
            Análisis detallado de tu plan {plan.name} y rendimiento de tus actividades
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

      {/* Resumen de estadísticas clave con datos reales */}
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
              ) : messagesGrowth < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-4 w-4 text-red-600" />
                  <span className="text-red-600">{messagesGrowth.toFixed(1)}%</span>
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
            <CardTitle className="text-sm font-medium">Campañas Creadas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalCampaigns || 0}</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {dashboardData?.campaignsActive || 0} activas
              </div>
              <Badge variant={campaignsStatus.variant} className="text-xs">
                {campaignsStatus.status}
              </Badge>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      <span className="text-sm font-medium">Conversaciones</span>
                      <Badge variant={conversationsStatus.variant} className="text-xs">
                        {conversationsStatus.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {dashboardData?.conversationsCount || 0} / {plan.max_conversations}
                    </span>
                  </div>
                  <Progress value={conversationsPercentage} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium">Campañas totales</span>
                      <Badge variant={campaignsStatus.variant} className="text-xs">
                        {campaignsStatus.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {dashboardData?.totalCampaigns || 0} / {plan.max_monthly_campaigns}
                    </span>
                  </div>
                  <Progress value={campaignsPercentage} className="h-2" />
                </div>

                <div className="space-y-4">
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-medium">Leads Generados</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {dashboardData?.generatedLeads || 0}
                    </span>
                  </div>
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
