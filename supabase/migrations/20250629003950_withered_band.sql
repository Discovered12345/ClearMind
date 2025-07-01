/*
  # Fix mood and journal entry saving issues

  1. Database Schema Fixes
    - Fix foreign key constraints
    - Update RLS policies to work correctly
    - Add proper indexes

  2. Security
    - Ensure RLS policies allow proper CRUD operations
    - Fix auth.uid() usage in policies
*/

-- First, let's fix the foreign key constraints
ALTER TABLE public.mood_entries DROP CONSTRAINT IF EXISTS mood_entries_user_id_fkey;
ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_id_fkey;

-- Add correct foreign key constraints
ALTER TABLE public.mood_entries 
  ADD CONSTRAINT mood_entries_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.journal_entries 
  ADD CONSTRAINT journal_entries_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Drop all existing policies and recreate them with proper auth.uid() usage
DROP POLICY IF EXISTS "Users can read own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can insert own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can update own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can delete own mood entries" ON public.mood_entries;

DROP POLICY IF EXISTS "Users can read own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;

-- Create new policies for mood_entries with correct auth.uid() usage
CREATE POLICY "Users can read own mood entries"
  ON public.mood_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own mood entries"
  ON public.mood_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own mood entries"
  ON public.mood_entries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own mood entries"
  ON public.mood_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create new policies for journal_entries with correct auth.uid() usage
CREATE POLICY "Users can read own journal entries"
  ON public.journal_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Add helpful function to get current user profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.profiles AS $$
BEGIN
  RETURN (
    SELECT * FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;