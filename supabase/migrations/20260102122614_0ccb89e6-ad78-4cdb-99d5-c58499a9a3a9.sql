-- Add cloudinary_public_id column to data_records table
ALTER TABLE public.data_records 
ADD COLUMN IF NOT EXISTS cloudinary_public_id text;