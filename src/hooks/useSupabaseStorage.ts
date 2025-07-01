import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '../types/database';

type MoodEntry = Database['public']['Tables']['mood_entries']['Row'];
type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export function useSupabaseStorage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Mood entries
  const getMoodEntries = async (): Promise<MoodEntry[]> => {
    if (!user) {
      console.log('No user found, returning empty mood entries');
      return [];
    }
    
    try {
      console.log('Fetching mood entries for user:', user.id);
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching mood entries:', error);
        return [];
      }

      console.log('Fetched mood entries:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getMoodEntries:', error);
      return [];
    }
  };

  const saveMoodEntry = async (entry: Omit<MoodEntry, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { data: null, error: { message: 'User not authenticated' } };

    try {
      console.log('Saving mood entry:', { ...entry, user_id: user.id });
      
      const { data, error } = await supabase
        .from('mood_entries')
        .upsert({
          ...entry,
          user_id: user.id
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving mood entry:', error);
      } else {
        console.log('Mood entry saved successfully:', data);
      }

      return { data, error };
    } catch (error) {
      console.error('Error in saveMoodEntry:', error);
      return { data: null, error };
    }
  };

  // Journal entries
  const getJournalEntries = async (): Promise<JournalEntry[]> => {
    if (!user) {
      console.log('No user found, returning empty journal entries');
      return [];
    }
    
    try {
      console.log('Fetching journal entries for user:', user.id);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }

      console.log('Fetched journal entries:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getJournalEntries:', error);
      return [];
    }
  };

  const saveJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { data: null, error: { message: 'User not authenticated' } };

    try {
      console.log('Saving journal entry:', { ...entry, user_id: user.id });
      
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          ...entry,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving journal entry:', error);
      } else {
        console.log('Journal entry saved successfully:', data);
      }

      return { data, error };
    } catch (error) {
      console.error('Error in saveJournalEntry:', error);
      return { data: null, error };
    }
  };

  const updateJournalEntry = async (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return { data: null, error: { message: 'User not authenticated' } };

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in updateJournalEntry:', error);
      return { data: null, error };
    }
  };

  const deleteJournalEntry = async (id: string) => {
    if (!user) return { error: { message: 'User not authenticated' } };

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      return { error };
    } catch (error) {
      console.error('Error in deleteJournalEntry:', error);
      return { error };
    }
  };

  // Profile
  const getProfile = async (): Promise<Profile | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  };

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return { data: null, error: { message: 'User not authenticated' } };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { data: null, error };
    }
  };

  return {
    loading,
    getMoodEntries,
    saveMoodEntry,
    getJournalEntries,
    saveJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    getProfile,
    updateProfile
  };
}