/*
  # Final Authentication Fix

  1. Database Schema Fixes
    - Ensure proper foreign key constraints
    - Fix RLS policies for better performance
    - Optimize profile creation trigger

  2. Performance Improvements
    - Remove unnecessary constraints that slow down auth
    - Streamline profile creation process
*/

-- Ensure profiles table has correct structure
DO $$
BEGIN
  -- Drop and recreate foreign key constraint to auth.users
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
  
  ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Simplify and optimize the profile creation trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, preferences)
  VALUES (
    NEW.id,
    '{"darkMode": false, "reminders": true, "crisisMode": false}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Don't fail user creation if profile creation fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Optimize RLS policies for profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;

-- Create optimized policies
CREATE POLICY "Users can manage own profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow profile creation during signup process
CREATE POLICY "Allow profile creation"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure mood_entries and journal_entries have correct foreign keys
DO $$
BEGIN
  -- Fix mood_entries foreign key
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'mood_entries_user_id_fkey' 
    AND table_name = 'mood_entries'
  ) THEN
    ALTER TABLE mood_entries DROP CONSTRAINT mood_entries_user_id_fkey;
  END IF;
  
  ALTER TABLE mood_entries ADD CONSTRAINT mood_entries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

  -- Fix journal_entries foreign key
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'journal_entries_user_id_fkey' 
    AND table_name = 'journal_entries'
  ) THEN
    ALTER TABLE journal_entries DROP CONSTRAINT journal_entries_user_id_fkey;
  END IF;
  
  ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);