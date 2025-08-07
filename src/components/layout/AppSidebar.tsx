
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Megaphone,
  Users,
  Settings,
  Phone,
  Bot,
  TrendingUp,
  Key,
  BarChart3
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
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Conexiones',
    url: '/connections',
    icon: Phone,
  },
  {
    title: 'Mensajes',
    url: '/messages',
    icon: MessageSquare,
  },
  {
    title: 'Campañas Masivas',
    url: '/campaigns',
    icon: Megaphone,
  },
  {
    title: 'Listas de Contactos',
    url: '/contact-lists',
    icon: Users,
  },
  {
    title: 'Leads',
    url: '/leads',
    icon: TrendingUp,
  },
  {
    title: 'Bot IA',
    url: '/bot',
    icon: Bot,
  },
  {
    title: 'Estadísticas',
    url: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Integraciones',
    url: '/integrations',
    icon: Key,
  },
  {
    title: 'Configuración',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== 'collapsed' && item.title}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
