
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ComingSoon from '@/components/ComingSoon';
import Dashboard from '@/components/dashboard/Dashboard';
import SettingsPage from '@/components/settings/SettingsPage';

const Index = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

const MainApp = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'settings':
        return <SettingsPage />;
      case 'messages':
        return <ComingSoon title="Mensajería WhatsApp" description="Sistema avanzado de mensajería para comunicación directa con tus clientes" />;
      case 'campaigns':
        return <ComingSoon title="Campañas Masivas" description="Herramientas para crear y gestionar campañas de marketing masivas" />;
      case 'connections':
        return <ComingSoon title="Conexiones WhatsApp" description="Gestión de múltiples cuentas y conexiones de WhatsApp Business" />;
      case 'leads':
        return <ComingSoon title="Gestión de Leads" description="CRM integrado para el seguimiento y conversión de leads" />;
      case 'calendar':
        return <ComingSoon title="Calendario" description="Sistema de programación y gestión de citas y eventos" />;
      case 'bot':
        return <ComingSoon title="Bot IA" description="Chatbot inteligente con IA para automatizar conversaciones" />;
      case 'analytics':
        return <ComingSoon title="Estadísticas" description="Análisis detallado de rendimiento y métricas de engagement" />;
      case 'billing':
        return <ComingSoon title="Planes y Facturación" description="Gestión de suscripciones, pagos y facturación" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <div className="flex">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 ml-64 p-6">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default Index;
