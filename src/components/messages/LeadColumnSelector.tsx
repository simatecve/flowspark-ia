
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
  const { columns } = useLeadColumns();
  const { createLead, updateLead, leads } = useLeads();
  const { toast } = useToast();

  // Buscar si ya existe un lead para este número
  const existingLead = leads.find(lead => lead.phone === phoneNumber);

  const handleAssignToColumn = async (columnId: string, columnName: string) => {
    if (existingLead) {
      // Si ya existe un lead, lo movemos a la nueva columna
      try {
        await updateLead({
          id: existingLead.id,
          column_id: columnId,
        });

        toast({
          title: "Lead movido",
          description: `El lead ha sido movido a la columna "${columnName}".`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo mover el lead.",
          variant: "destructive",
        });
      }
    } else {
      // Si no existe, creamos un nuevo lead
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
    }
  };

  const currentColumn = existingLead ? columns.find(col => col.id === existingLead.column_id) : null;
  const buttonText = existingLead 
    ? `Lead en: ${currentColumn?.name || 'Sin columna'}` 
    : 'Asignar a Lead';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Users className="h-4 w-4 mr-2" />
          {buttonText}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {columns.map((column) => (
          <DropdownMenuItem
            key={column.id}
            onClick={() => handleAssignToColumn(column.id, column.name)}
            className={currentColumn?.id === column.id ? "bg-accent" : ""}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: column.color }}
              />
              {column.name}
              {currentColumn?.id === column.id && (
                <span className="ml-auto text-xs text-muted-foreground">Actual</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
