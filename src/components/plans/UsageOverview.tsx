
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Phone, Users, Megaphone, Bot, HardDrive } from 'lucide-react';
import { useUserUsage, useUserPlan } from '@/hooks/useUserUsage';
import { useDashboardData } from '@/hooks/useDashboardData';

export const UsageOverview = () => {
  const { data: userUsage, isLoading: usageLoading } = useUserUsage();
  const { data: userPlan, isLoading: planLoading } = useUserPlan();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();

  if (usageLoading || planLoading || dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const plan = userPlan || {
    name: 'Plan Básico',
    price: 29.99,
    max_whatsapp_connections: 2,
    max_contacts: 500,
    max_monthly_campaigns: 3,
    max_bot_responses: 1000,
    max_storage_mb: 500
  };

  const usage = userUsage || {
    whatsapp_connections_used: 0,
    contacts_used: 0,
    campaigns_this_month: 0,
    bot_responses_this_month: 0,
    storage_used_mb: 0
  };

  const calculatePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Plan Actual: {plan.name}
            <Badge variant="secondary">${plan.price}/mes</Badge>
          </CardTitle>
          <CardDescription>
            {plan.description || 'Tu plan de suscripción actual'}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-600" />
              Conexiones WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{dashboardData?.activeConnections || 0} / {plan.max_whatsapp_connections}</span>
                <span className={`${getUsageColor(calculatePercentage(dashboardData?.activeConnections || 0, plan.max_whatsapp_connections))}`}>
                  {calculatePercentage(dashboardData?.activeConnections || 0, plan.max_whatsapp_connections).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={calculatePercentage(dashboardData?.activeConnections || 0, plan.max_whatsapp_connections)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Contactos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{dashboardData?.contactsCount || 0} / {plan.max_contacts.toLocaleString()}</span>
                <span className={`${getUsageColor(calculatePercentage(dashboardData?.contactsCount || 0, plan.max_contacts))}`}>
                  {calculatePercentage(dashboardData?.contactsCount || 0, plan.max_contacts).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={calculatePercentage(dashboardData?.contactsCount || 0, plan.max_contacts)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-orange-600" />
              Campañas este mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{usage.campaigns_this_month} / {plan.max_monthly_campaigns}</span>
                <span className={`${getUsageColor(calculatePercentage(usage.campaigns_this_month, plan.max_monthly_campaigns))}`}>
                  {calculatePercentage(usage.campaigns_this_month, plan.max_monthly_campaigns).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={calculatePercentage(usage.campaigns_this_month, plan.max_monthly_campaigns)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4 text-green-600" />
              Respuestas Bot este mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{usage.bot_responses_this_month} / {plan.max_bot_responses.toLocaleString()}</span>
                <span className={`${getUsageColor(calculatePercentage(usage.bot_responses_this_month, plan.max_bot_responses))}`}>
                  {calculatePercentage(usage.bot_responses_this_month, plan.max_bot_responses).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={calculatePercentage(usage.bot_responses_this_month, plan.max_bot_responses)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-purple-600" />
              Almacenamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{usage.storage_used_mb} / {plan.max_storage_mb} MB</span>
                <span className={`${getUsageColor(calculatePercentage(usage.storage_used_mb, plan.max_storage_mb))}`}>
                  {calculatePercentage(usage.storage_used_mb, plan.max_storage_mb).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={calculatePercentage(usage.storage_used_mb, plan.max_storage_mb)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
