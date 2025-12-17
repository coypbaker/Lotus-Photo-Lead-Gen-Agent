-- Add subscription fields to track user plans
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  leads_used_this_month INTEGER DEFAULT 0,
  leads_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscription (for initial creation)
CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can update subscriptions (for webhook)
CREATE POLICY "Service role can update subscriptions"
  ON user_subscriptions FOR UPDATE USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to reset leads count monthly
CREATE OR REPLACE FUNCTION reset_monthly_leads()
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET leads_used_this_month = 0,
      leads_reset_date = NOW()
  WHERE leads_reset_date < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;
