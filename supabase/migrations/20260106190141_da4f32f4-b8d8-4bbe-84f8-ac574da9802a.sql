-- Add new columns to clients table for logo, signature, and designation
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS signature_url TEXT,
ADD COLUMN IF NOT EXISTS designation TEXT;