-- Create leads table for storing generated leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  address TEXT,
  source TEXT DEFAULT 'google_places',
  place_id TEXT,
  score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'replied', 'converted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own leads
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own leads
CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own leads
CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own leads
CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
