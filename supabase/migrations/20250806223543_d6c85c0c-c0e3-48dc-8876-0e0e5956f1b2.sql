
-- Create table for contact lists
CREATE TABLE public.contact_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for contacts
CREATE TABLE public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  phone_number text NOT NULL,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create junction table for contacts in lists
CREATE TABLE public.contact_list_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_list_id uuid REFERENCES public.contact_lists(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(contact_list_id, contact_id)
);

-- Add contact_list_id to mass_campaigns table
ALTER TABLE public.mass_campaigns 
ADD COLUMN contact_list_id uuid REFERENCES public.contact_lists(id);

-- Enable Row Level Security
ALTER TABLE public.contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_list_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_lists
CREATE POLICY "Users can view their own contact lists" 
  ON public.contact_lists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contact lists" 
  ON public.contact_lists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact lists" 
  ON public.contact_lists 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact lists" 
  ON public.contact_lists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for contacts
CREATE POLICY "Users can view their own contacts" 
  ON public.contacts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
  ON public.contacts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
  ON public.contacts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
  ON public.contacts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for contact_list_members
CREATE POLICY "Users can view members of their contact lists" 
  ON public.contact_list_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.contact_lists cl 
      WHERE cl.id = contact_list_id AND cl.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add contacts to their lists" 
  ON public.contact_list_members 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contact_lists cl 
      WHERE cl.id = contact_list_id AND cl.user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.contacts c 
      WHERE c.id = contact_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove contacts from their lists" 
  ON public.contact_list_members 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.contact_lists cl 
      WHERE cl.id = contact_list_id AND cl.user_id = auth.uid()
    )
  );
