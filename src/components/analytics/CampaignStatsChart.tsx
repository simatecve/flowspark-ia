
import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface CampaignStatsChartProps {
  timeFilter: string;
  chartType: string;
}

export const CampaignStatsChart = ({ timeFilter, chartType }: CampaignStatsChartProps) => {
  const data = [
    {
      nombre: 'Ofertas Verano',
      enviados: 1234,
      entregados: 1200,
      leidos: 890,
      respondidos: 156
    },
    {
      nombre: 'Promoción Black Friday',
      enviados: 2100,
      entregados: 2050,
      leidos: 1420,
      respondidos: 284
    },
    {
      nombre: 'Newsletter Enero',
      enviados: 850,
      entregados: 830,
      leidos: 620,
      respondidos: 89
    }
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal">
          <XAxis type="number" />
          <YAxis dataKey="nombre" type="category" width={120} />
          <Tooltip />
          <Bar dataKey="enviados" fill="#3b82f6" name="Enviados" />
          <Bar dataKey="entregados" fill="#10b981" name="Entregados" />
          <Bar dataKey="leidos" fill="#f59e0b" name="Leídos" />
          <Bar dataKey="respondidos" fill="#ef4444" name="Respondidos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
