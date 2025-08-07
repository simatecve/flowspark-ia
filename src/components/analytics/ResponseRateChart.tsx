
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ResponseRateChartProps {
  timeFilter: string;
}

export const ResponseRateChart = ({ timeFilter }: ResponseRateChartProps) => {
  const data = [
    { name: 'Respondidos', value: 65, color: '#10b981' },
    { name: 'Sin respuesta', value: 35, color: '#ef4444' }
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">{item.name}: {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
