
export interface WhatsAppConnection {
  id: string;
  user_id: string;
  name: string;
  color: string;
  phone_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  function_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWhatsAppConnectionData {
  name: string;
  color: string;
  phone_number: string;
}

export interface AIBot {
  id: string;
  user_id: string;
  name: string;
  whatsapp_connection_name: string;
  instructions: string;
  message_delay: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAIBotData {
  name: string;
  whatsapp_connection_name: string;
  instructions: string;
  message_delay: number;
  is_active: boolean;
}
