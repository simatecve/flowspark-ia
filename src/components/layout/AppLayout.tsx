import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    // Map routes to page IDs
    const routeToPageMap: Record<string, string> = {
      '/': 'dashboard',
      '/connections': 'connections',
      '/messages': 'messages',
      '/campaigns': 'campaigns',
      '/contact-lists': 'contact-lists',
      '/leads': 'leads',
      '/bot': 'bot',
      '/integrations': 'integrations',
      '/plans': 'plans',
      '/settings': 'settings',
    };
    return routeToPageMap[location.pathname] || 'dashboard';
  });

  // Update current page when location changes
  useEffect(() => {
    const routeToPageMap: Record<string, string> = {
      '/': 'dashboard',
      '/connections': 'connections',
      '/messages': 'messages',
      '/campaigns': 'campaigns',
      '/contact-lists': 'contact-lists',
      '/leads': 'leads',
      '/bot': 'bot',
      '/integrations': 'integrations',
      '/plans': 'plans',
      '/settings': 'settings',
    };
    setCurrentPage(routeToPageMap[location.pathname] || 'dashboard');
  }, [location.pathname]);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const handleToggleCollapsed = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <Navbar />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          collapsed={collapsed}
          onToggleCollapsed={handleToggleCollapsed}
        />
        
        {/* Main content */}
        <main className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          collapsed ? "ml-16" : "ml-64"
        )}>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
