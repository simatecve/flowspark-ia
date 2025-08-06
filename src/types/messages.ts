
export interface Message {
  id: string;
  user_id: string;
  conversation_id: string;
  instance_name: string;
  whatsapp_number: string;
  pushname?: string;
  message: string;
  direction: 'incoming' | 'outgoing';
  is_bot: boolean;
  attachment_url?: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document';
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  whatsapp_number: string;
  pushname?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageData {
  instance_name: string;
  whatsapp_number: string;
  pushname?: string;
  message: string;
  direction: 'incoming' | 'outgoing';
  is_bot?: boolean;
  attachment_url?: string;
  message_type?: 'text' | 'image' | 'video' | 'audio' | 'document';
}

export interface SendMessageData {
  conversation_id: string;
  message: string;
  attachment_url?: string;
  message_type?: 'text' | 'image' | 'video' | 'audio' | 'document';
}
