
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Phone,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { UsageChart } from './UsageChart';
import { MessagesChart } from './MessagesChart';
import { ResponseRateChart } from './ResponseRateChart';
import { CampaignStatsChart } from './CampaignStatsChart';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useUserUsage, useUserPlan } from '@/hooks/useUserUsage';

export const AnalyticsPage = () => {
  const [timeFilter, setTimeFilter] = useState('30d');
  const [chartType, setChartType] = useState('bar');
  
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();
  const { data: userUsage, isLoading: usageLoading } = useUserUsage();
  const { data: userPlan, isLoading: planLoading } = useUserPlan();

  const isLoading = dashboardLoading || usageLoading || planLoading;

  const stats = [
    {
      title: 'Mensajes Enviados',
      value: dashboardData?.sentMessages || 0,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      title: 'Tasa de Respuesta',
      value: `${dashboardData?.responseRate || 0}%`,
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Contactos Activos',
      value: dashboardData?.contactsCount || 0,
      change: '+8.1%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Conexiones Activas',
      value: dashboardData?.activeConnections || 0,
      change: 'Sin cambios',
      changeType: 'neutral' as const,
      icon: Phone,
      color: 'text-emerald-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estadísticas y Análisis</h1>
          <p className="text-muted-foreground">
            Análisis detallado de tu actividad y uso de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-32">
              <BarChart3 className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Barras</SelectItem>
              <SelectItem value="line">Líneas</SelectItem>
              <SelectItem value="area">Área</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estado del Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{userPlan?.name || 'Plan Básico'}</h3>
              <p className="text-muted-foreground">
                ${userPlan?.price || 29.99}/mes • Renovación automática
              </p>
            </div>
            <Badge variant="secondary">Activo</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 
                'text-muted-foreground'
              }`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Uso del Plan</CardTitle>
            <CardDescription>
              Consumo vs límites de tu plan actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsageChart 
              userUsage={userUsage} 
              userPlan={userPlan} 
              dashboardData={dashboardData}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mensajes por Día</CardTitle>
            <CardDescription>
              Evolución de mensajes enviados en los últimos {timeFilter === '7d' ? '7 días' : timeFilter === '30d' ? '30 días' : '90 días'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MessagesChart timeFilter={timeFilter} chartType={chartType} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasa de Respuesta</CardTitle>
            <CardDescription>
              Porcentaje de mensajes respondidos vs enviados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponseRateChart timeFilter={timeFilter} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Campañas</CardTitle>
            <CardDescription>
              Estadísticas de tus campañas masivas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignStatsChart timeFilter={timeFilter} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de Consumo</CardTitle>
          <CardDescription>
            Desglose detallado del uso de recursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Conexiones WhatsApp</span>
                  <span>{dashboardData?.activeConnections || 0} / {userPlan?.max_whatsapp_connections || 2}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Contactos</span>
                  <span>{dashboardData?.contactsCount || 0} / {userPlan?.max_contacts?.toLocaleString() || '500'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Campañas este mes</span>
                  <span>{userUsage?.campaigns_this_month || 0} / {userPlan?.max_monthly_campaigns || 3}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Respuestas Bot</span>
                  <span>{userUsage?.bot_responses_this_month || 0} / {userPlan?.max_bot_responses?.toLocaleString() || '1,000'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Almacenamiento</span>
                  <span>{userUsage?.storage_used_mb || 0} MB / {userPlan?.max_storage_mb || 500} MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Sesiones de dispositivo</span>
                  <span>{userUsage?.device_sessions_used || 0} / {userPlan?.max_device_sessions || 1}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Período actual:</span>
                  <div className="text-muted-foreground">
                    {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Próxima renovación:</span>
                  <div className="text-muted-foreground">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
