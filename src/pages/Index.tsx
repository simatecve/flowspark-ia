
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import ComingSoon from '@/components/ComingSoon';
import { cn } from '@/lib/utils';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'messages':
        return (
          <ComingSoon
            title="Panel de Mensajería"
            description="Una interfaz similar a WhatsApp para gestionar todas tus conversaciones desde un solo lugar."
            features={[
              'Vista de conversaciones estilo WhatsApp',
              'Envío de archivos e imágenes',
              'Programación de mensajes futuros',
              'Soporte para múltiples líneas'
            ]}
          />
        );
      case 'leads':
        return (
          <ComingSoon
            title="Gestión de Leads"
            description="Organiza y gestiona tus leads con un sistema Kanban intuitivo y potente."
            features={[
              'Tablero Kanban personalizable',
              'Automatización de seguimiento',
              'Etiquetas y filtros inteligentes',
              'Integración con WhatsApp'
            ]}
          />
        );
      case 'campaigns':
        return (
          <ComingSoon
            title="Campañas Masivas"
            description="Crea, programa y ejecuta campañas de marketing masivas con IA integrada."
            features={[
              'Editor de campañas avanzado',
              'Programación inteligente',
              'Variación de mensajes con IA',
              'Análisis de rendimiento'
            ]}
          />
        );
      case 'calendar':
        return (
          <ComingSoon
            title="Calendario de Citas"
            description="Sistema de citas integrado con Google Calendar para autogestión de clientes."
            features={[
              'Integración con Google Calendar',
              'Reservas automáticas',
              'Notificaciones inteligentes',
              'Configuración por tipo de profesional'
            ]}
          />
        );
      case 'bot':
        return (
          <ComingSoon
            title="Bot de IA"
            description="Automatiza conversaciones con inteligencia artificial avanzada."
            features={[
              'Control On/Off por conversación',
              'Transferencia inteligente a humanos',
              'API Keys personalizadas',
              'Notificaciones de transferencia'
            ]}
          />
        );
      case 'connections':
        return (
          <ComingSoon
            title="Conexiones WhatsApp"
            description="Conecta y gestiona múltiples líneas de WhatsApp Business."
            features={[
              'Conexión por códigos QR',
              'Múltiples líneas simultáneas',
              'Estado en tiempo real',
              'Gestión centralizada'
            ]}
          />
        );
      case 'analytics':
        return (
          <ComingSoon
            title="Estadísticas y Reportes"
            description="Análisis detallado del rendimiento de tus campañas y conversaciones."
            features={[
              'Dashboards interactivos',
              'Métricas de engagement',
              'Reportes exportables',
              'Análisis predictivo con IA'
            ]}
          />
        );
      case 'billing':
        return (
          <ComingSoon
            title="Planes y Facturación"
            description="Gestiona tu suscripción, pagos y límites de uso del sistema."
            features={[
              'Integración con MercadoPago',
              'Facturación automática',
              'Historial de pagos',
              'Gestión de límites por plan'
            ]}
          />
        );
      case 'settings':
        return (
          <ComingSoon
            title="Configuración"
            description="Personaliza tu experiencia y configura integraciones avanzadas."
            features={[
              'Configuración de perfil',
              'Integraciones con APIs',
              'Configuración de notificaciones',
              'Gestión de sesiones múltiples'
            ]}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className={cn(
          "flex-1 transition-all duration-300",
          "ml-64 lg:ml-64"
        )}>
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
