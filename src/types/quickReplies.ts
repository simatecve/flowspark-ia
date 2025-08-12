
export interface QuickReply {
  id: string;
  user_id: string;
  title: string;
  message: string;
  shortcut?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateQuickReplyData {
  title: string;
  message: string;
  shortcut?: string;
}

export interface UpdateQuickReplyData {
  id: string;
  title?: string;
  message?: string;
  shortcut?: string;
}
