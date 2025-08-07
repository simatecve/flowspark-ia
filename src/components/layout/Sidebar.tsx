
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Users, 
  Megaphone, 
  Calendar, 
  Bot, 
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  TrendingUp,
  Key,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  collapsed: boolean;
  onToggleCollapsed: (collapsed: boolean) => void;
}

interface UserProfile {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  plan_id?: string;
}

const Sidebar = ({ currentPage, onPageChange, collapsed, onToggleCollapsed }: SidebarProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [planName, setPlanName] = useState<string>('Plan Pro');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          first_name, 
          last_name, 
          company_name, 
          plan_id,
          subscription_plans (name)
        `)
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setUserProfile(data);
        setPlanName(data.subscription_plans?.name || 'Plan Pro');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleNavigation = (pageId: string) => {
    onPageChange(pageId);
    
    const pageToRouteMap: Record<string, string> = {
      'dashboard': '/',
      'connections': '/connections',
      'messages': '/messages',
      'campaigns': '/campaigns',
      'leads': '/leads',
      'contact-lists': '/contact-lists',
      'calendar': '/calendar',
      'bot': '/bot',
      'analytics': '/analytics',
      'integrations': '/integrations',
      'plans': '/plans',
      'settings': '/settings'
    };
    
    const route = pageToRouteMap[pageId];
    if (route) {
      navigate(route);
    }
  };

  const getInitials = () => {
    const firstName = userProfile.first_name || '';
    const lastName = userProfile.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return user?.email?.split('@')[0] || 'Usuario';
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
          color: 'text-blue-600'
        }
      ]
    },
    {
      id: 'communication',
      label: 'Comunicación',
      items: [
        {
          id: 'connections',
          label: 'Conexiones WhatsApp',
          icon: Smartphone,
          color: 'text-emerald-600'
        },
        {
          id: 'messages',
          label: 'Mensajería',
          icon: MessageCircle,
          color: 'text-green-600'
        },
        {
          id: 'campaigns',
          label: 'Campañas Masivas',
          icon: Megaphone,
          color: 'text-orange-600'
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
          icon: Users,
          color: 'text-pink-600'
        },
        {
          id: 'leads',
          label: 'Gestión de Leads',
          icon: TrendingUp,
          color: 'text-purple-600'
        },
        {
          id: 'calendar',
          label: 'Calendario',
          icon: Calendar,
          color: 'text-blue-600'
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
          color: 'text-green-600'
        },
        {
          id: 'integrations',
          label: 'Integraciones IA',
          icon: Key,
          color: 'text-indigo-600'
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
          color: 'text-cyan-600'
        }
      ]
    },
    {
      id: 'admin',
      label: 'Administración',
      items: [
        {
          id: 'plans',
          label: 'Gestión de Planes',
          icon: CreditCard,
          color: 'text-yellow-600'
        },
        {
          id: 'settings',
          label: 'Configuración',
          icon: Settings,
          color: 'text-gray-600'
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
            onClick={() => onToggleCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          {menuGroups.map((group) => (
            <div key={group.id} className="mb-6">
              {!collapsed && (
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 px-2">
                  {group.label}
                </h3>
              )}
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start transition-all duration-200 h-10",
                        collapsed ? "px-2" : "px-3",
                        isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      onClick={() => handleNavigation(item.id)}
                    >
                      <Icon className={cn("h-4 w-4", item.color, collapsed ? "" : "mr-3")} />
                      {!collapsed && (
                        <span className="text-sm">
                          {item.label}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="border-t p-4 mt-auto">
          {collapsed ? (
            <div className="flex justify-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{getDisplayName()}</p>
                <p className="text-xs text-muted-foreground truncate">{planName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
