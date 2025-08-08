
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LeadsFiltersProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export const LeadsFilters: React.FC<LeadsFiltersProps> = ({
  searchTerm,
  onSearchTermChange
}) => {
  const handleClearSearch = () => {
    onSearchTermChange('');
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          Filtrando por: "{searchTerm}"
        </div>
      )}
    </div>
  );
};
