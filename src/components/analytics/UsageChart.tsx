
import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface UsageChartProps {
  userUsage: any;
  userPlan: any;
  dashboardData: any;
}

export const UsageChart = ({ userUsage, userPlan, dashboardData }: UsageChartProps) => {
  const data = [
    {
      name: 'Conexiones',
      usado: dashboardData?.activeConnections || 0,
      limite: userPlan?.max_whatsapp_connections || 2,
      porcentaje: Math.round(((dashboardData?.activeConnections || 0) / (userPlan?.max_whatsapp_connections || 2)) * 100)
    },
    {
      name: 'Conversaciones',
      usado: dashboardData?.conversationsCount || 0,
      limite: userPlan?.max_conversations || 50,
      porcentaje: Math.round(((dashboardData?.conversationsCount || 0) / (userPlan?.max_conversations || 50)) * 100)
    },
    {
      name: 'Contactos',
      usado: dashboardData?.contactsCount || 0,
      limite: userPlan?.max_contacts || 500,
      porcentaje: Math.round(((dashboardData?.contactsCount || 0) / (userPlan?.max_contacts || 500)) * 100)
    },
    {
      name: 'Campañas',
      usado: dashboardData?.totalCampaigns || 0,
      limite: userPlan?.max_monthly_campaigns || 3,
      porcentaje: Math.round(((dashboardData?.totalCampaigns || 0) / (userPlan?.max_monthly_campaigns || 3)) * 100)
    },
    {
      name: 'Bot',
      usado: userUsage?.bot_responses_this_month || 0,
      limite: userPlan?.max_bot_responses || 1000,
      porcentaje: Math.round(((userUsage?.bot_responses_this_month || 0) / (userPlan?.max_bot_responses || 1000)) * 100)
    }
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              name === 'porcentaje' ? `${value}%` : value,
              name === 'usado' ? 'Usado' : name === 'limite' ? 'Límite' : 'Porcentaje'
            ]}
          />
          <Bar dataKey="porcentaje" fill="#3b82f6" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
