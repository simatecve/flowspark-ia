
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
        return <ComingSoon title={getPageTitle(currentPage)} />;
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
