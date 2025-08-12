
export interface ScheduledMessage {
  id: string;
  user_id: string;
  instance_name: string;
  whatsapp_number: string;
  pushname?: string;
  message: string;
  attachment_url?: string;
  scheduled_for: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledMessageData {
  instance_name: string;
  whatsapp_number: string;
  pushname?: string;
  message: string;
  attachment_url?: string;
  scheduled_for: string;
}

export interface UpdateScheduledMessageData {
  id: string;
  status?: 'pending' | 'sent' | 'failed' | 'cancelled';
  sent_at?: string;
  error_message?: string;
}
