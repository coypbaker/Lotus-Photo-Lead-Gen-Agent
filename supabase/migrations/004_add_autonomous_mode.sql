-- Add autonomous mode setting to user_settings table
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS autonomous_mode BOOLEAN DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS daily_outreach_limit INTEGER DEFAULT 5;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS last_autonomous_run TIMESTAMP WITH TIME ZONE;

-- Create table to track daily autonomous runs
CREATE TABLE IF NOT EXISTS autonomous_run_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  leads_found INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  summary_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, run_date)
);

-- Enable RLS
ALTER TABLE autonomous_run_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own run logs
CREATE POLICY "Users can view own run logs"
  ON autonomous_run_logs FOR SELECT USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_autonomous_run_logs_user_date ON autonomous_run_logs(user_id, run_date);
