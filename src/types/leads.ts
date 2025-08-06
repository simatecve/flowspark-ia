
export interface LeadColumn {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  column_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  value?: number;
  notes?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadColumnData {
  name: string;
  color: string;
  position?: number;
}

export interface CreateLeadData {
  column_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  value?: number;
  notes?: string;
  position?: number;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  id: string;
}

export interface MoveLeadData {
  id: string;
  column_id: string;
  position: number;
}
