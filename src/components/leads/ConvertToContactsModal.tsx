
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Phone, Mail } from 'lucide-react';
import type { Lead, LeadColumn } from '@/types/leads';
import { useLeadsToContacts } from '@/hooks/useLeadsToContacts';

interface ConvertToContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  column: LeadColumn | null;
  leads: Lead[];
}

export const ConvertToContactsModal: React.FC<ConvertToContactsModalProps> = ({
  isOpen,
  onClose,
  column,
  leads,
}) => {
  const { convertLeadsToContacts, isConverting } = useLeadsToContacts();

  if (!column) return null;

  const validLeads = leads.filter(lead => lead.phone && lead.phone.trim());
  const invalidLeads = leads.filter(lead => !lead.phone || !lead.phone.trim());

  const handleConvert = () => {
    if (validLeads.length === 0) {
      return;
    }

    convertLeadsToContacts(
      { leads, columnName: column.name },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Convertir Leads a Contactos
          </DialogTitle>
          <DialogDescription>
            Convierte todos los leads de la columna "{column.name}" en una lista de contactos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total de leads:</span>
              <Badge variant="secondary">{leads.length}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-green-600">
                <Phone className="h-4 w-4" />
                Con teléfono (se convertirán):
              </span>
              <Badge variant="default">{validLeads.length}</Badge>
            </div>

            {invalidLeads.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-orange-600">Sin teléfono (se omitirán):</span>
                <Badge variant="outline">{invalidLeads.length}</Badge>
              </div>
            )}
          </div>

          {validLeads.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Vista previa de contactos:</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {validLeads.slice(0, 5).map((lead, index) => (
                  <div key={lead.id} className="flex items-center gap-2 text-sm bg-background p-2 rounded border">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">{lead.name}</span>
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{lead.phone}</span>
                    {lead.email && (
                      <>
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{lead.email}</span>
                      </>
                    )}
                  </div>
                ))}
                {validLeads.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    ... y {validLeads.length - 5} más
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>¿Qué sucederá?</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Se creará una nueva lista llamada "Leads - {column.name}"</li>
              <li>• Se crearán {validLeads.length} contactos con la información disponible</li>
              <li>• Los contactos se agregarán automáticamente a la nueva lista</li>
              <li>• Los leads originales permanecerán intactos</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isConverting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConvert} 
            disabled={validLeads.length === 0 || isConverting}
          >
            {isConverting ? 'Convirtiendo...' : `Convertir ${validLeads.length} Leads`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
