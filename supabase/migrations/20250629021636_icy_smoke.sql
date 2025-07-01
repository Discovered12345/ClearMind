/*
  # Fix Authentication Integration

  1. Database Changes
    - Update profiles table foreign key to reference auth.users
    - Create trigger function to automatically create profiles for new users
    - Add proper RLS policies for profiles table
    
  2. Security
    - Ensure RLS is properly configured
    - Update policies to work with auth.uid()
    
  3. Triggers
    - Auto-create profile when user signs up
*/

-- First, let's update the foreign key constraint to reference auth.users
DO $$
BEGIN
  -- Drop the existing foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
  
  -- Add the correct foreign key constraint
  ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Create or replace the trigger function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, preferences)
  VALUES (
    NEW.id,
    '{"darkMode": false, "reminders": true, "crisisMode": false}'::jsonb
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update RLS policies for profiles to use auth.uid()
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create updated RLS policies
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Also allow public access for profile creation during signup
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Update mood_entries foreign key to reference auth.users through profiles
DO $$
BEGIN
  -- The mood_entries table should reference profiles, which is correct
  -- But let's make sure the profiles table is properly set up first
  
  -- Update journal_entries foreign key as well
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'journal_entries_user_id_fkey' 
    AND table_name = 'journal_entries'
  ) THEN
    ALTER TABLE journal_entries DROP CONSTRAINT journal_entries_user_id_fkey;
    ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Update mood_entries foreign key
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'mood_entries_user_id_fkey' 
    AND table_name = 'mood_entries'
  ) THEN
    ALTER TABLE mood_entries DROP CONSTRAINT mood_entries_user_id_fkey;
    ALTER TABLE mood_entries ADD CONSTRAINT mood_entries_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
