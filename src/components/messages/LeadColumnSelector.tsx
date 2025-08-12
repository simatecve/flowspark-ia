
import React from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLeadColumns } from '@/hooks/useLeadColumns';
import { useLeads } from '@/hooks/useLeads';
import { useToast } from '@/hooks/use-toast';

interface LeadColumnSelectorProps {
  phoneNumber: string;
  pushname?: string;
}

export const LeadColumnSelector = ({ phoneNumber, pushname }: LeadColumnSelectorProps) => {
  const { leadColumns } = useLeadColumns();
  const { createLead, leads } = useLeads();
  const { toast } = useToast();

  // Buscar si ya existe un lead para este número
  const existingLead = leads.find(lead => lead.phone === phoneNumber);

  const handleAssignToColumn = async (columnId: string, columnName: string) => {
    if (existingLead) {
      toast({
        title: "Lead ya existe",
        description: `Este contacto ya está asignado como lead.`,
      });
      return;
    }

    try {
      await createLead({
        column_id: columnId,
        name: pushname || phoneNumber,
        phone: phoneNumber,
      });

      toast({
        title: "Lead creado",
        description: `El contacto ha sido asignado a la columna "${columnName}".`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el lead.",
        variant: "destructive",
      });
    }
  };

  if (existingLead) {
    const column = leadColumns.find(col => col.id === existingLead.column_id);
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Lead en: {column?.name || 'Sin columna'}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Users className="h-4 w-4 mr-2" />
          Asignar a Lead
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {leadColumns.map((column) => (
          <DropdownMenuItem
            key={column.id}
            onClick={() => handleAssignToColumn(column.id, column.name)}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: column.color }}
              />
              {column.name}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
