-- Create creator_signups table
CREATE TABLE creator_signups (
  id BIGSERIAL PRIMARY KEY,
  discord_id TEXT NOT NULL UNIQUE,
  discord_username TEXT NOT NULL,
  discord_global_name TEXT,
  avatar_url TEXT,
  full_name TEXT NOT NULL,
  tiktok TEXT NOT NULL,
  youtube TEXT NOT NULL,
  instagram TEXT NOT NULL,
  email TEXT NOT NULL,
  wallet TEXT NOT NULL,
  bio TEXT NOT NULL,
  source TEXT DEFAULT 'discord',
  discord_submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_creator_signups_discord_id ON creator_signups(discord_id);
CREATE INDEX idx_creator_signups_email ON creator_signups(email);
CREATE INDEX idx_creator_signups_created_at ON creator_signups(created_at);

-- Enable Row Level Security
ALTER TABLE creator_signups ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (from Discord bot webhook)
CREATE POLICY "allow_insert" ON creator_signups
  FOR INSERT 
  WITH CHECK (true);

-- Allow public reads
CREATE POLICY "allow_select" ON creator_signups
  FOR SELECT 
  USING (true);
