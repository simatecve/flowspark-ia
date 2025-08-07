
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Users, 
  TrendingUp,
  MessageSquare,
  Megaphone,
  Phone,
  Bot,
  Plus,
  Filter,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useUserUsage, useUserPlan } from '@/hooks/useUserUsage';
import { useAuth } from '@/hooks/useAuth';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardData();
  const { data: recentActivity, isLoading: isActivityLoading } = useRecentActivity();
  const { data: userUsage } = useUserUsage();
  const { data: userPlan } = useUserPlan();
  const [timeFilter, setTimeFilter] = useState('7d');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'info':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hace unos minutos';
  };

  const calculatePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'destructive';
    if (percentage >= 70) return 'secondary';
    return 'default';
  };

  if (isDashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Panel Principal</h2>
          <p className="text-muted-foreground">
            Bienvenido, {user?.email}. Resumen general de tu plataforma ChatFlow Pro
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Hoy</SelectItem>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate('/analytics')} variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Análisis Completo
          </Button>
        </div>
      </div>
      
      {/* Plan Status */}
      {userPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Estado del Plan: {userPlan.name}</span>
              <Badge variant="secondary">${userPlan.price}/mes</Badge>
            </CardTitle>
            <CardDescription>
              {userPlan.description || 'Tu plan de suscripción actual'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Conexiones WhatsApp</span>
                  <span>{dashboardData?.activeConnections || 0}/{userPlan.max_whatsapp_connections}</span>
                </div>
                <Progress 
                  value={calculatePercentage(dashboardData?.activeConnections || 0, userPlan.max_whatsapp_connections)} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Contactos</span>
                  <span>{dashboardData?.contactsCount || 0}/{userPlan.max_contacts.toLocaleString()}</span>
                </div>
                <Progress 
                  value={calculatePercentage(dashboardData?.contactsCount || 0, userPlan.max_contacts)} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Campañas mensuales</span>
                  <span>{userUsage?.campaigns_this_month || 0}/{userPlan.max_monthly_campaigns}</span>
                </div>
                <Progress 
                  value={calculatePercentage(userUsage?.campaigns_this_month || 0, userPlan.max_monthly_campaigns)} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Respuestas Bot</span>
                  <span>{userUsage?.bot_responses_this_month || 0}/{userPlan.max_bot_responses.toLocaleString()}</span>
                </div>
                <Progress 
                  value={calculatePercentage(userUsage?.bot_responses_this_month || 0, userPlan.max_bot_responses)} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conexiones Activas
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.activeConnections || 0}</div>
            <p className="text-xs text-muted-foreground">
              WhatsApp Business conectados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mensajes Enviados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.sentMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total de mensajes enviados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leads Generados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.generatedLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              Contactos en gestión
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Respuesta
            </CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.responseRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Respuestas recibidas
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Botones de Acceso Rápido */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              onClick={() => navigate('/campaigns')}
              className="justify-start h-auto p-4" 
              variant="outline"
            >
              <Megaphone className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Nueva Campaña</div>
                <div className="text-xs text-muted-foreground">Crear campaña masiva</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => navigate('/contact-lists')}
              className="justify-start h-auto p-4" 
              variant="outline"
            >
              <Users className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Importar Contactos</div>
                <div className="text-xs text-muted-foreground">Gestionar listas</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => navigate('/connections')}
              className="justify-start h-auto p-4" 
              variant="outline"
            >
              <Phone className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Conectar WhatsApp</div>
                <div className="text-xs text-muted-foreground">Nueva línea de negocio</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => navigate('/bot')}
              className="justify-start h-auto p-4" 
              variant="outline"
            >
              <Bot className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Configurar Bot</div>
                <div className="text-xs text-muted-foreground">IA automatizada</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas interacciones en tu plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isActivityLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded animate-pulse mb-2" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description} • {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No hay actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>
              Resumen de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Campañas Activas</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-xs font-medium">{dashboardData?.campaignsActive || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Contactos</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium">{dashboardData?.contactsCount || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Conexiones WhatsApp</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    (dashboardData?.activeConnections || 0) > 0 ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-xs font-medium">
                    {(dashboardData?.activeConnections || 0) > 0 ? 'Activas' : 'Sin conexiones'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button 
                onClick={() => navigate('/messages')}
                className="w-full" 
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Ver Mensajes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
