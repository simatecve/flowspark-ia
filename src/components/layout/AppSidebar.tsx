import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Smartphone,
  ContactRound,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  url: string;
}

interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const collapsed = state === 'collapsed';

  const getInitials = () => {
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    return user?.email?.split('@')[0] || 'Usuario';
  };

  const menuGroups: MenuGroup[] = [
    {
      id: 'main',
      label: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Panel Principal',
          icon: LayoutDashboard,
          color: 'text-saas-600 dark:text-saas-400',
          url: '/'
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
          color: 'text-whatsapp-600 dark:text-whatsapp-400',
          url: '/messages'
        },
        {
          id: 'campaigns',
          label: 'Campañas Masivas',
          icon: Megaphone,
          color: 'text-orange-600 dark:text-orange-400',
          url: '/campaigns'
        },
        {
          id: 'connections',
          label: 'Conexiones WhatsApp',
          icon: Smartphone,
          color: 'text-emerald-600 dark:text-emerald-400',
          url: '/connections'
        }
      ]
    },
    {
      id: 'management',
      label: 'Gestión',
      items: [
        {
          id: 'contact-lists',
          label: 'Listas de Contactos',
          icon: ContactRound,
          color: 'text-pink-600 dark:text-pink-400',
          url: '/contact-lists'
        },
        {
          id: 'leads',
          label: 'Gestión de Leads',
          icon: Users,
          color: 'text-purple-600 dark:text-purple-400',
          url: '/leads'
        },
        {
          id: 'calendar',
          label: 'Calendario',
          icon: Calendar,
          color: 'text-blue-600 dark:text-blue-400',
          url: '/calendar'
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
          color: 'text-green-600 dark:text-green-400',
          url: '/bot'
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
          color: 'text-cyan-600 dark:text-cyan-400',
          url: '/analytics'
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
          color: 'text-indigo-600 dark:text-indigo-400',
          url: '/billing'
        },
        {
          id: 'settings',
          label: 'Configuración',
          icon: Settings,
          color: 'text-gray-600 dark:text-gray-400',
          url: '/settings'
        }
      ]
    }
  ];

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'}>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.id}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="transition-all duration-200"
                      >
                        <NavLink to={item.url}>
                          <Icon className={`h-4 w-4 ${item.color}`} />
                          {!collapsed && (
                            <span className="ml-3 text-sm font-medium">
                              {item.label}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {collapsed ? (
          <div className="flex justify-center p-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-whatsapp-500 to-saas-500 text-white text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-whatsapp-500 to-saas-500 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{getDisplayName()}</p>
              <p className="text-xs text-muted-foreground">Plan Pro</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
