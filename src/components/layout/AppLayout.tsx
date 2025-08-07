
import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(() => {
    // Map routes to page IDs
    const routeToPageMap: Record<string, string> = {
      '/': 'dashboard',
      '/connections': 'connections',
      '/messages': 'messages',
      '/campaigns': 'campaigns',
      '/contact-lists': 'leads',
      '/leads': 'leads',
      '/bot': 'bot',
      '/integrations': 'billing',
      '/settings': 'settings',
    };
    return routeToPageMap[location.pathname] || 'dashboard';
  });

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    // We'll handle navigation through the sidebar component
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
        <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
        
        {/* Main content */}
        <main className="flex-1 ml-64 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
