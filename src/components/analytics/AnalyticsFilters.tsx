
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';

interface AnalyticsFiltersProps {
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
}

export const AnalyticsFilters = ({ 
  timeFilter, 
  onTimeFilterChange, 
  onRefresh, 
  onExport 
}: AnalyticsFiltersProps) => {
  const timeFilterOptions = [
    { value: '7d', label: '7 días', description: 'Última semana' },
    { value: '30d', label: '30 días', description: 'Último mes' },
    { value: '90d', label: '90 días', description: 'Últimos 3 meses' },
    { value: '1y', label: '1 año', description: 'Último año' }
  ];

  const currentOption = timeFilterOptions.find(opt => opt.value === timeFilter);

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeFilter} onValueChange={onTimeFilterChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentOption && (
          <Badge variant="outline" className="text-xs">
            Período: {currentOption.description}
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        )}
        
        {onExport && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        )}
      </div>
    </div>
  );
};
