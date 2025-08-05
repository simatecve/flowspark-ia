
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
  Smartphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ currentPage, onPageChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['main']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const menuGroups = [
    {
      id: 'main',
      label: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Panel Principal',
          icon: LayoutDashboard,
          color: 'text-saas-600 dark:text-saas-400'
        }
      ]
    },
    {
      id: 'communication',
      label: 'Comunicación',
      items: [
        {
          id: 'messages',
          label: 'Mensajería',
          icon: MessageCircle,
          color: 'text-whatsapp-600 dark:text-whatsapp-400'
        },
        {
          id: 'campaigns',
          label: 'Campañas Masivas',
          icon: Megaphone,
          color: 'text-orange-600 dark:text-orange-400'
        },
        {
          id: 'connections',
          label: 'Conexiones WhatsApp',
          icon: Smartphone,
          color: 'text-emerald-600 dark:text-emerald-400'
        }
      ]
    },
    {
      id: 'management',
      label: 'Gestión',
      items: [
        {
          id: 'leads',
          label: 'Gestión de Leads',
          icon: Users,
          color: 'text-purple-600 dark:text-purple-400'
        },
        {
          id: 'calendar',
          label: 'Calendario',
          icon: Calendar,
          color: 'text-blue-600 dark:text-blue-400'
        }
      ]
    },
    {
      id: 'automation',
      label: 'Automatización',
      items: [
        {
          id: 'bot',
          label: 'Bot IA',
          icon: Bot,
          color: 'text-green-600 dark:text-green-400'
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Análisis',
      items: [
        {
          id: 'analytics',
          label: 'Estadísticas',
          icon: BarChart3,
          color: 'text-cyan-600 dark:text-cyan-400'
        }
      ]
    },
    {
      id: 'account',
      label: 'Cuenta',
      items: [
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
      ]
    }
  ];

  return (
    <aside className={cn(
      'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300 overflow-y-auto',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-full flex-col">
        {/* Toggle button */}
        <div className="flex justify-end p-2 border-b">
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
        <nav className="flex-1 space-y-2 p-2">
          {menuGroups.map((group) => (
            <div key={group.id} className="space-y-1">
              {!collapsed && (
                <Button
                  variant="ghost"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full justify-between px-2 py-1 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {group.label}
                  {expandedGroups.includes(group.id) ? 
                    <ChevronUp className="h-3 w-3" /> : 
                    <ChevronDown className="h-3 w-3" />
                  }
                </Button>
              )}
              
              {(collapsed || expandedGroups.includes(group.id)) && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start transition-all duration-200",
                          collapsed ? "px-2" : "px-3 ml-2",
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
                </div>
              )}
            </div>
          ))}
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
