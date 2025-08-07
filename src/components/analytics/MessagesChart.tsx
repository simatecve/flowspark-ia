
import React from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, BarChart, Area, AreaChart } from 'recharts';

interface MessagesChartProps {
  timeFilter: string;
  chartType: string;
}

export const MessagesChart = ({ timeFilter, chartType }: MessagesChartProps) => {
  // Datos simulados basados en el período seleccionado
  const generateData = () => {
    const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        fecha: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        enviados: Math.floor(Math.random() * 100) + 20,
        recibidos: Math.floor(Math.random() * 60) + 10
      });
    }
    
    return data;
  };

  const data = generateData();

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="enviados" fill="#3b82f6" radius={4} name="Enviados" />
          <Bar dataKey="recibidos" fill="#10b981" radius={4} name="Recibidos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
