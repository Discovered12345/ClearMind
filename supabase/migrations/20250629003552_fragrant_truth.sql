/*
  # Safe Schema Update for ClearMind AI

  1. New Tables
    - `profiles` - User profile information
    - `mood_entries` - Daily mood tracking data  
    - `journal_entries` - Journal entries with AI analysis
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data only
  3. Functions & Triggers
    - Auto-create profile on user signup
    - Auto-update timestamps
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{
    "darkMode": false,
    "reminders": true,
    "crisisMode": false
  }'::jsonb
);

-- Create mood_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  mood integer NOT NULL CHECK (mood >= 1 AND mood <= 5),
  mood_emoji text NOT NULL,
  note text,
  ai_prompt text,
  ai_response text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create journal_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  mood integer NOT NULL CHECK (mood >= 1 AND mood <= 5),
  ai_prompt text,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  
  -- Mood entries policies
  DROP POLICY IF EXISTS "Users can read own mood entries" ON mood_entries;
  DROP POLICY IF EXISTS "Users can insert own mood entries" ON mood_entries;
  DROP POLICY IF EXISTS "Users can update own mood entries" ON mood_entries;
  DROP POLICY IF EXISTS "Users can delete own mood entries" ON mood_entries;
  
  -- Journal entries policies
  DROP POLICY IF EXISTS "Users can read own journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;
END $$;

-- Create policies for profiles
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Create policies for mood_entries
CREATE POLICY "Users can read own mood entries" ON mood_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood entries" ON mood_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood entries" ON mood_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood entries" ON mood_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create policies for journal_entries
CREATE POLICY "Users can read own journal entries" ON journal_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON journal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON journal_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON journal_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_sentiment ON journal_entries(user_id, sentiment);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, created_at, updated_at) VALUES (NEW.id, now(), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;

-- Create triggers
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();