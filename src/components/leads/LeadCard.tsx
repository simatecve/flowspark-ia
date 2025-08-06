
import React, { useState } from 'react';
import { Mail, Phone, Building, DollarSign, MoreVertical, Edit, Trash2, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditLeadModal } from './EditLeadModal';
import { useLeads } from '@/hooks/useLeads';
import { useLeadColumns } from '@/hooks/useLeadColumns';
import type { Lead } from '@/types/leads';

interface LeadCardProps {
  lead: Lead;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { deleteLead } = useLeads();
  const { columns } = useLeadColumns();

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el lead "${lead.name}"?`)) {
      deleteLead(lead.id);
    }
  };

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            {lead.email && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            
            {lead.phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{lead.phone}</span>
              </div>
            )}
            
            {lead.company && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building className="h-3 w-3" />
                <span className="truncate">{lead.company}</span>
              </div>
            )}
            
            {lead.value && lead.value > 0 && (
              <div className="flex items-center gap-2 text-xs font-medium text-green-600">
                <DollarSign className="h-3 w-3" />
                <span>${lead.value.toLocaleString()}</span>
              </div>
            )}
            
            {lead.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {lead.notes}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <EditLeadModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        lead={lead}
        columns={columns}
      />
    </>
  );
};
