
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from './KanbanBoard';
import { CreateColumnModal } from './CreateColumnModal';
import { CreateLeadModal } from './CreateLeadModal';
import { LeadsFilters } from './LeadsFilters';
import { useLeadColumns } from '@/hooks/useLeadColumns';
import { useLeads } from '@/hooks/useLeads';
import { useLeadsFilter } from '@/hooks/useLeadsFilter';

export const LeadsPage = () => {
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');

  const { columns, isLoading: isLoadingColumns } = useLeadColumns();
  const { leads, isLoading: isLoadingLeads } = useLeads();
  
  const {
    searchTerm,
    setSearchTerm,
    filteredLeads,
    hasFilter,
    resultsCount
  } = useLeadsFilter(leads);

  const handleCreateLead = (columnId?: string) => {
    if (columnId) {
      setSelectedColumnId(columnId);
    }
    setIsCreateLeadModalOpen(true);
  };

  if (isLoadingColumns || isLoadingLeads) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Leads</h2>
          <p className="text-muted-foreground">
            Organiza y gestiona tus leads en un tablero Kanban
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleCreateLead()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Lead
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsCreateColumnModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Columna
          </Button>
        </div>
      </div>

      <LeadsFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
      />

      {hasFilter && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Mostrando {resultsCount} de {leads.length} leads</span>
        </div>
      )}

      <KanbanBoard 
        columns={columns}
        leads={filteredLeads}
        onCreateLead={handleCreateLead}
      />

      <CreateColumnModal 
        isOpen={isCreateColumnModalOpen}
        onClose={() => setIsCreateColumnModalOpen(false)}
      />

      <CreateLeadModal 
        isOpen={isCreateLeadModalOpen}
        onClose={() => {
          setIsCreateLeadModalOpen(false);
          setSelectedColumnId('');
        }}
        columns={columns}
        selectedColumnId={selectedColumnId}
      />
    </div>
  );
};
