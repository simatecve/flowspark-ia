
-- Create storage bucket for campaign attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-attachments', 'campaign-attachments', true);

-- Create RLS policies for the campaign attachments bucket
CREATE POLICY "Users can upload their own campaign attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'campaign-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own campaign attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'campaign-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own campaign attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'campaign-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add attachment fields to mass_campaigns table
ALTER TABLE public.mass_campaigns 
ADD COLUMN attachment_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN attachment_names TEXT[] DEFAULT ARRAY[]::TEXT[];
