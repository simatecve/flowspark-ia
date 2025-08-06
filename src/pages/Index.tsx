
import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Dashboard from '../components/dashboard/Dashboard';
import ComingSoon from '../components/ComingSoon';
import AuthForm from '../components/auth/AuthForm';
import { useAuth, AuthProvider } from '../hooks/useAuth';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      default:
        return (
          <ComingSoon 
            title={getPageTitle(currentPage)} 
            description={getPageDescription(currentPage)}
            features={getPageFeatures(currentPage)}
          />
        );
    }
  };

  const getPageTitle = (page: string): string => {
    const titles: { [key: string]: string } = {
      'messages': 'Mensajería',
      'leads': 'Gestión de Leads',
      'campaigns': 'Campañas Masivas',
      'calendar': 'Calendario',
      'bot': 'Bot IA',
      'connections': 'Conexiones WhatsApp',
      'analytics': 'Estadísticas',
      'billing': 'Planes y Facturación',
      'settings': 'Configuración'
    };
    return titles[page] || 'Funcionalidad';
  };

  const getPageDescription = (page: string): string => {
    const descriptions: { [key: string]: string } = {
      'messages': 'Gestiona todas tus conversaciones de WhatsApp desde un solo lugar.',
      'leads': 'Organiza y da seguimiento a todos tus leads potenciales.',
      'campaigns': 'Crea y ejecuta campañas masivas de marketing por WhatsApp.',
      'calendar': 'Programa y organiza tus citas y recordatorios.',
      'bot': 'Configura respuestas automáticas inteligentes con IA.',
      'connections': 'Conecta y gestiona múltiples cuentas de WhatsApp.',
      'analytics': 'Analiza el rendimiento de tus campañas y conversaciones.',
      'billing': 'Gestiona tu suscripción y métodos de pago.',
      'settings': 'Configura las preferencias de tu cuenta.'
    };
    return descriptions[page] || 'Esta funcionalidad estará disponible próximamente.';
  };

  const getPageFeatures = (page: string): string[] => {
    const features: { [key: string]: string[] } = {
      'messages': ['Chat en tiempo real', 'Historial de conversaciones', 'Etiquetas y filtros'],
      'leads': ['Seguimiento de estado', 'Notas personalizadas', 'Integración con CRM'],
      'campaigns': ['Plantillas personalizadas', 'Programación automática', 'Segmentación avanzada'],
      'calendar': ['Sincronización con Google Calendar', 'Recordatorios automáticos', 'Vista mensual/semanal'],
      'bot': ['Respuestas inteligentes', 'Flujos de conversación', 'Aprendizaje automático'],
      'connections': ['Múltiples números', 'Estado de conexión', 'Configuración por cuenta'],
      'analytics': ['Métricas en tiempo real', 'Reportes personalizados', 'Exportación de datos'],
      'billing': ['Gestión de planes', 'Historial de pagos', 'Facturas descargables'],
      'settings': ['Preferencias de usuario', 'Configuración de notificaciones', 'Gestión de equipo']
    };
    return features[page] || [];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 ml-64 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
