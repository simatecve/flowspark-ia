
import React from 'react';
import { 
  MessageSquare, 
  Users, 
  Megaphone, 
  Smartphone,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import StatsCard from './StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const stats = [
    {
      title: 'Mensajes Enviados',
      value: '12,847',
      change: '+20.1% desde el mes pasado',
      changeType: 'positive' as const,
      icon: MessageSquare,
      iconColor: 'text-whatsapp-600 bg-whatsapp-100',
      description: 'Total mensajes enviados este mes'
    },
    {
      title: 'Leads Activos',
      value: '2,394',
      change: '+12.5% nuevos esta semana',
      changeType: 'positive' as const,
      icon: Users,
      iconColor: 'text-purple-600 bg-purple-100',
      description: 'Leads en gestión'
    },
    {
      title: 'Campañas Activas',
      value: '8',
      change: '3 programadas para mañana',
      changeType: 'neutral' as const,
      icon: Megaphone,
      iconColor: 'text-orange-600 bg-orange-100',
      description: 'Campañas en ejecución'
    },
    {
      title: 'Líneas Conectadas',
      value: '4',
      change: 'Todas funcionando correctamente',
      changeType: 'positive' as const,
      icon: Smartphone,
      iconColor: 'text-emerald-600 bg-emerald-100',
      description: 'WhatsApp Business conectados'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
          <p className="text-muted-foreground">
            Bienvenida de vuelta, María. Aquí tienes un resumen de tu actividad.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Plan Pro Activo
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-saas-600" />
              <span>Uso del Plan</span>
            </CardTitle>
            <CardDescription>
              Límites de tu plan Pro actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Mensajes enviados</span>
                <span>12,847 / 15,000</span>
              </div>
              <Progress value={85.6} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Contactos almacenados</span>
                <span>2,394 / 5,000</span>
              </div>
              <Progress value={47.9} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Líneas WhatsApp</span>
                <span>4 / 5</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <Button className="w-full" variant="outline">
              Ver Detalles del Plan
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Actividad Reciente</span>
            </CardTitle>
            <CardDescription>
              Últimas acciones en tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">Campaña "Ofertas de Verano" enviada</p>
                  <p className="text-muted-foreground">Hace 2 horas - 1,234 mensajes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-1" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">Bot transferió 3 conversaciones</p>
                  <p className="text-muted-foreground">Hace 4 horas - Requieren atención manual</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">Nuevo lead agregado al Kanban</p>
                  <p className="text-muted-foreground">Hace 6 horas - Juan Pérez, etapa "Prospecto"</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">WhatsApp Business conectado</p>
                  <p className="text-muted-foreground">Ayer - Línea +52 123 456 7890</p>
                </div>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Ver Historial Completo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Tareas comunes para acelerar tu trabajo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button className="justify-start h-auto p-4" variant="outline">
              <MessageSquare className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Nueva Campaña</div>
                <div className="text-xs text-muted-foreground">Crear campaña masiva</div>
              </div>
            </Button>
            <Button className="justify-start h-auto p-4" variant="outline">
              <Users className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Importar Contactos</div>
                <div className="text-xs text-muted-foreground">Subir archivo CSV</div>
              </div>
            </Button>
            <Button className="justify-start h-auto p-4" variant="outline">
              <Smartphone className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Conectar WhatsApp</div>
                <div className="text-xs text-muted-foreground">Nueva línea de negocio</div>
              </div>
            </Button>
            <Button className="justify-start h-auto p-4" variant="outline">
              <TrendingUp className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Ver Reportes</div>
                <div className="text-xs text-muted-foreground">Análisis detallado</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
