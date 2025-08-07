
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/auth/AuthForm';
import { AppLayout } from '@/components/layout/AppLayout';
import DashboardPage from "./pages/Dashboard";
import ConnectionsPage from "./pages/Connections";
import MessagesPage from "./pages/Messages";
import MassCampaigns from "./pages/MassCampaigns";
import ContactLists from "./pages/ContactLists";
import LeadsPage from "./pages/Leads";
import IntegrationsPage from "./pages/Integrations";
import PlansPage from "./pages/Plans";
import SettingsPage from "@/components/settings/SettingsPage";
import { AIBotsPage } from "@/components/ai/AIBotsPage";
import NotFound from "./pages/NotFound";

// Create QueryClient outside of component to avoid recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Bienvenido</h1>
            <p className="text-muted-foreground mt-2">
              Inicia sesión para acceder a ChatFlow Pro
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/campaigns" element={<MassCampaigns />} />
        <Route path="/contact-lists" element={<ContactLists />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/bot" element={<AIBotsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </QueryClientProvider>
    </TooltipProvider>
  );
}

export default App;
