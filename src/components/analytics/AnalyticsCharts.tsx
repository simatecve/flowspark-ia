
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { MessageSquare, BarChart3, Megaphone } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';

interface AnalyticsChartsProps {
  timeFilter: string;
}

export const AnalyticsCharts = ({ timeFilter }: AnalyticsChartsProps) => {
  const { data: dashboardData } = useDashboardData();

  // Generar datos simulados basados en el filtro de tiempo
  const generateTimeSeriesData = () => {
    const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : timeFilter === '90d' ? 90 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simular datos más realistas
      const baseMessages = Math.floor(Math.random() * 50) + 10;
      const responseRate = Math.random() * 0.4 + 0.5; // Entre 50% y 90%
      
      data.push({
        fecha: date.toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        }),
        enviados: baseMessages,
        recibidos: Math.floor(baseMessages * responseRate),
        tasaRespuesta: Math.round(responseRate * 100),
        conversacionesActivas: Math.floor(Math.random() * 20) + 5,
        nuevosContactos: Math.floor(Math.random() * 10) + 1
      });
    }
    
    return data;
  };

  const generateCampaignData = () => {
    const campaigns = [
      {
        nombre: 'Promoción Black Friday',
        enviados: 1250,
        entregados: 1200,
        leidos: 980,
        respondidos: 156,
        tasaApertura: 78,
        tasaRespuesta: 12.5
      },
      {
        nombre: 'Newsletter Enero',
        enviados: 850,
        entregados: 820,
        leidos: 620,
        respondidos: 89,
        tasaApertura: 73,
        tasaRespuesta: 10.5
      },
      {
        nombre: 'Ofertas Especiales',
        enviados: 600,
        entregados: 590,
        leidos: 410,
        respondidos: 67,
        tasaApertura: 69,
        tasaRespuesta: 11.2
      },
      {
        nombre: 'Seguimiento Clientes',
        enviados: 320,
        entregados: 315,
        leidos: 280,
        respondidos: 45,
        tasaApertura: 88,
        tasaRespuesta: 14.1
      }
    ];
    
    return campaigns;
  };

  const generateUsageData = () => {
    return [
      {
        recurso: 'Conexiones',
        usado: dashboardData?.activeConnections || 2,
        limite: 5,
        porcentaje: ((dashboardData?.activeConnections || 2) / 5) * 100
      },
      {
        recurso: 'Conversaciones',
        usado: dashboardData?.conversationsCount || 25,
        limite: 100,
        porcentaje: ((dashboardData?.conversationsCount || 25) / 100) * 100
      },
      {
        recurso: 'Contactos',
        usado: dashboardData?.contactsCount || 150,
        limite: 1000,
        porcentaje: ((dashboardData?.contactsCount || 150) / 1000) * 100
      },
      {
        recurso: 'Campañas',
        usado: dashboardData?.totalCampaigns || 2,
        limite: 10,
        porcentaje: ((dashboardData?.totalCampaigns || 2) / 10) * 100
      }
    ];
  };

  const timeSeriesData = generateTimeSeriesData();
  const campaignData = generateCampaignData();
  const usageData = generateUsageData();

  const responseRateData = [
    { name: 'Respondidos', value: 65, color: '#10b981' },
    { name: 'Sin respuesta', value: 35, color: '#ef4444' }
  ];

  return (
    <Tabs defaultValue="messages" className="w-full">
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

      <TabsContent value="messages" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad de Mensajes</CardTitle>
              <CardDescription>
                Mensajes enviados y recibidos en los últimos {timeFilter}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="enviados" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      name="Enviados"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="recibidos" 
                      stackId="1" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="Recibidos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tasa de Respuesta</CardTitle>
              <CardDescription>
                Distribución de respuestas obtenidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={responseRateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {responseRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {responseRateData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tendencias de Conversaciones</CardTitle>
              <CardDescription>
                Evolución de conversaciones activas y nuevos contactos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="conversacionesActivas" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Conversaciones Activas"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="nuevosContactos" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Nuevos Contactos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="usage" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Uso de Recursos del Plan</CardTitle>
            <CardDescription>
              Consumo actual vs límites disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="recurso" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="porcentaje" fill="#3b82f6" radius={4} name="Porcentaje de Uso" />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nombre" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="enviados" fill="#3b82f6" name="Enviados" />
                  <Bar dataKey="entregados" fill="#10b981" name="Entregados" />
                  <Bar dataKey="leidos" fill="#f59e0b" name="Leídos" />
                  <Bar dataKey="respondidos" fill="#ef4444" name="Respondidos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaignData.map((campaign, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{campaign.nombre}</CardTitle>
                <CardDescription>
                  {campaign.enviados.toLocaleString()} mensajes enviados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Tasa de Apertura</div>
                    <div className="text-2xl font-bold text-green-600">
                      {campaign.tasaApertura}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tasa de Respuesta</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {campaign.tasaRespuesta}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Entregados</div>
                    <div className="font-semibold">
                      {campaign.entregados.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Respondidos</div>
                    <div className="font-semibold">
                      {campaign.respondidos.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
