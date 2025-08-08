
import { useState, useMemo } from 'react';
import type { Lead } from '@/types/leads';

export const useLeadsFilter = (leads: Lead[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) {
      return leads;
    }

    const term = searchTerm.toLowerCase().trim();
    
    return leads.filter(lead => {
      // Filtrar por nombre
      const nameMatch = lead.name.toLowerCase().includes(term);
      
      // Filtrar por teléfono (si existe)
      const phoneMatch = lead.phone?.toLowerCase().includes(term) || false;
      
      // Filtrar por email (como funcionalidad adicional)
      const emailMatch = lead.email?.toLowerCase().includes(term) || false;
      
      return nameMatch || phoneMatch || emailMatch;
    });
  }, [leads, searchTerm]);

  const clearFilter = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredLeads,
    clearFilter,
    hasFilter: searchTerm.trim().length > 0,
    resultsCount: filteredLeads.length
  };
};
