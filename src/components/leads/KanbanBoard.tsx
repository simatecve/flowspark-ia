
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LeadCard } from './LeadCard';
import { EditColumnModal } from './EditColumnModal';
import type { LeadColumn, Lead } from '@/types/leads';
import { useLeads } from '@/hooks/useLeads';
import { useLeadColumns } from '@/hooks/useLeadColumns';

interface KanbanBoardProps {
  columns: LeadColumn[];
  leads: Lead[];
  onCreateLead: (columnId?: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  leads,
  onCreateLead
}) => {
  const [editingColumn, setEditingColumn] = useState<LeadColumn | null>(null);
  const { moveLead } = useLeads();
  const { deleteColumn } = useLeadColumns();

  const getLeadsByColumn = (columnId: string) => {
    return leads
      .filter(lead => lead.column_id === columnId)
      .sort((a, b) => a.position - b.position);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const lead = leads.find(l => l.id === draggableId);
    if (!lead) return;

    // Calculate new position based on destination index
    const destinationLeads = getLeadsByColumn(destination.droppableId);
    let newPosition: number;

    if (destination.index === 0) {
      newPosition = destinationLeads.length > 0 ? destinationLeads[0].position - 1 : 0;
    } else if (destination.index >= destinationLeads.length) {
      newPosition = destinationLeads.length > 0 ? destinationLeads[destinationLeads.length - 1].position + 1 : 0;
    } else {
      const beforePosition = destinationLeads[destination.index - 1].position;
      const afterPosition = destinationLeads[destination.index].position;
      newPosition = (beforePosition + afterPosition) / 2;
    }

    moveLead({
      id: draggableId,
      column_id: destination.droppableId,
      position: newPosition
    });
  };

  const handleDeleteColumn = (column: LeadColumn) => {
    if (column.is_default) {
      return; // No permitir eliminar la columna por defecto
    }
    
    if (window.confirm(`¿Estás seguro de que deseas eliminar la columna "${column.name}"?`)) {
      deleteColumn(column.id);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 min-w-fit pb-6">
          {columns.map((column) => {
            const columnLeads = getLeadsByColumn(column.id);
            const totalValue = columnLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: column.color }}
                        />
                        <h3 className="font-semibold">{column.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {columnLeads.length}
                        </Badge>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingColumn(column)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {!column.is_default && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteColumn(column)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {totalValue > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Valor total: ${totalValue.toLocaleString()}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Button 
                      variant="ghost" 
                      className="w-full mb-4 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
                      onClick={() => onCreateLead(column.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Lead
                    </Button>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[200px] ${
                            snapshot.isDraggingOver ? 'bg-muted/50 rounded-lg' : ''
                          }`}
                        >
                          {columnLeads.map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${
                                    snapshot.isDragging ? 'rotate-2' : ''
                                  }`}
                                >
                                  <LeadCard lead={lead} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {editingColumn && (
        <EditColumnModal
          isOpen={!!editingColumn}
          onClose={() => setEditingColumn(null)}
          column={editingColumn}
        />
      )}
    </div>
  );
};
