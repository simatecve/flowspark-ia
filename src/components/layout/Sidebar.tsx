
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Users, 
  Megaphone, 
  Calendar, 
  Bot, 
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ currentPage, onPageChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      color: 'text-saas-600 dark:text-saas-400'
    },
    {
      id: 'messages',
      label: 'Mensajería',
      icon: MessageCircle,
      color: 'text-whatsapp-600 dark:text-whatsapp-400'
    },
    {
      id: 'leads',
      label: 'Gestión de Leads',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'campaigns',
      label: 'Campañas Masivas',
      icon: Megaphone,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'bot',
      label: 'Bot IA',
      icon: Bot,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'connections',
      label: 'Conexiones WhatsApp',
      icon: Smartphone,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'analytics',
      label: 'Estadísticas',
      icon: BarChart3,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      id: 'billing',
      label: 'Planes y Facturación',
      icon: CreditCard,
      color: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      color: 'text-gray-600 dark:text-gray-400'
    }
  ];

  return (
    <aside className={cn(
      'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-full flex-col">
        {/* Toggle button */}
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-200",
                  collapsed ? "px-2" : "px-3",
                  isActive && "bg-primary/10 border-r-2 border-primary shadow-sm"
                )}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className={cn("h-4 w-4", item.color)} />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Button>
            );
          })}
        </nav>

        {/* User info at bottom */}
        {!collapsed && (
          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-whatsapp-500 to-saas-500"></div>
              <div className="flex-1 text-sm">
                <p className="font-medium">María García</p>
                <p className="text-xs text-muted-foreground">Plan Pro Activo</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
