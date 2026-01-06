-- Create project_files table to track Cloudinary uploads
CREATE TABLE public.project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  cloudinary_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_project_files_project_id ON public.project_files(project_id);

-- RLS Policies
-- Allow users to view files for projects they have access to
CREATE POLICY "Users can view project files" 
ON public.project_files 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id 
    AND (
      p.vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM vendor_staff vs WHERE vs.vendor_id = p.vendor_id AND vs.user_id = auth.uid() AND vs.active = true)
      OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
    )
  )
);

-- Allow users to upload files to projects they have access to
CREATE POLICY "Users can upload project files" 
ON public.project_files 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id 
    AND (
      p.vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM vendor_staff vs WHERE vs.vendor_id = p.vendor_id AND vs.user_id = auth.uid() AND vs.active = true)
      OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
    )
  )
);

-- Allow users to delete files from projects they have access to
CREATE POLICY "Users can delete project files" 
ON public.project_files 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id 
    AND (
      p.vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM vendor_staff vs WHERE vs.vendor_id = p.vendor_id AND vs.user_id = auth.uid() AND vs.active = true)
      OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
    )
  )
);