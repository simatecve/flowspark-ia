
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  max_whatsapp_connections: number;
  max_contacts: number;
  max_monthly_campaigns: number;
  max_bot_responses: number;
  max_storage_mb: number;
  max_device_sessions: number;
  max_conversations: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanData {
  name: string;
  description?: string;
  price: number;
  max_whatsapp_connections: number;
  max_contacts: number;
  max_monthly_campaigns: number;
  max_bot_responses: number;
  max_storage_mb: number;
  max_device_sessions: number;
  max_conversations: number;
}

export interface UpdatePlanData {
  id: string;
  name: string;
  description?: string;
  price: number;
  max_whatsapp_connections: number;
  max_contacts: number;
  max_monthly_campaigns: number;
  max_bot_responses: number;
  max_storage_mb: number;
  max_device_sessions: number;
  max_conversations: number;
}

export interface UserUsage {
  id: string;
  user_id: string;
  plan_id: string;
  whatsapp_connections_used: number;
  contacts_used: number;
  campaigns_this_month: number;
  bot_responses_this_month: number;
  storage_used_mb: number;
  device_sessions_used: number;
  conversations_used: number;
  usage_month: string;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  started_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}
