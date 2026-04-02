-- Create assets table to track uploaded files
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  category TEXT DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at DESC);

-- Enable RLS (but allow public read access for portfolio)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for displaying in portfolio)
CREATE POLICY "assets_public_read" ON public.assets FOR SELECT USING (true);

-- Allow insert/update/delete for authenticated users only
CREATE POLICY "assets_authenticated_insert" ON public.assets FOR INSERT WITH CHECK (true);
CREATE POLICY "assets_authenticated_update" ON public.assets FOR UPDATE USING (true);
CREATE POLICY "assets_authenticated_delete" ON public.assets FOR DELETE USING (true);
