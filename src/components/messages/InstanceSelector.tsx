
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';

interface InstanceSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const InstanceSelector = ({ value, onValueChange }: InstanceSelectorProps) => {
  const { connections, isLoadingConnections } = useWhatsAppConnections();

  if (isLoadingConnections) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Cargando instancias..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Todas las instancias" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las instancias</SelectItem>
        {connections.map((connection) => (
          <SelectItem key={connection.id} value={connection.name}>
            {connection.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
