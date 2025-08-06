
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactListMember {
  id: string;
  contact_list_id: string;
  contact_id: string;
  added_at: string;
}

export interface CreateContactData {
  name: string;
  phone_number: string;
  email?: string;
}

export interface CreateContactListData {
  name: string;
  description?: string;
}

export interface ContactWithMembership extends Contact {
  is_member?: boolean;
}
