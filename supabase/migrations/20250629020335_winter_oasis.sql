/*
  # Fix sign-in authentication issues

  1. Profile Access Issues
    - Update RLS policies to allow proper profile access during authentication
    - Ensure profiles can be created and accessed by authenticated users
    - Fix potential issues with auth.uid() in policies

  2. Security
    - Maintain security while allowing proper authentication flow
    - Ensure users can only access their own data
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create more permissive policies for profiles to fix authentication issues
CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile" 
  ON public.profiles 
  FOR SELECT 
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO public
  USING (auth.uid() = id);

-- Ensure the handle_new_user function works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with error handling
  INSERT INTO public.profiles (id, nickname, preferences)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    '{"darkMode": false, "reminders": true, "crisisMode": false}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to help with profile creation if it doesn't exist
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, preferences)
    VALUES (
      current_user_id,
      '{"darkMode": false, "reminders": true, "crisisMode": false}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;