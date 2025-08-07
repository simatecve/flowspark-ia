
import React, { useState } from 'react';
import { AnalyticsOverview } from './AnalyticsOverview';
import { AnalyticsCharts } from './AnalyticsCharts';
import { AnalyticsFilters } from './AnalyticsFilters';
import { useToast } from '@/hooks/use-toast';

export const AnalyticsPage = () => {
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { toast } = useToast();

  const handleRefresh = () => {
    toast({
      title: "Datos actualizados",
      description: "Las estadísticas han sido actualizadas con la información más reciente.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Exportando datos",
      description: "Se está preparando el archivo de exportación. Te notificaremos cuando esté listo.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Análisis detallado de tu actividad y rendimiento
        </p>
      </div>

      <AnalyticsFilters
        timeFilter={timeFilter}
        onTimeFilterChange={(value: string) => setTimeFilter(value as '7d' | '30d' | '90d' | '1y')}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <AnalyticsOverview />

      <AnalyticsCharts timeFilter={timeFilter} />
    </div>
  );
};
