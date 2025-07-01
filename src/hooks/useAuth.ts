import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Quick timeout for initial auth check
        const authTimeout = setTimeout(() => {
          if (mounted && loading) {
            console.log('Auth initialization timeout, showing login');
            setLoading(false);
          }
        }, 3000); // Reduced to 3 seconds

        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (mounted) {
          clearTimeout(authTimeout);
          
          if (error) {
            console.error('Auth initialization error:', error);
          }

          setUser(user);
          if (user) {
            // Load profile in background, don't block UI
            loadUserProfile(user.id).catch(console.error);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        console.log('Auth state change:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Load profile in background
          loadUserProfile(session.user.id).catch(console.error);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              preferences: { darkMode: false, reminders: true, crisisMode: false }
            })
            .select()
            .single();

          if (newProfile) {
            setUserProfile(newProfile);
          }
        } else {
          console.error('Error loading profile:', error);
        }
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Profile loading error:', error);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined // Remove redirect to speed up signup
      }
    });
    
    // If signup successful and we have a name, update profile later
    if (!error && data.user && name) {
      // Don't wait for this, do it in background
      setTimeout(async () => {
        try {
          await supabase
            .from('profiles')
            .update({ nickname: name })
            .eq('id', data.user!.id);
        } catch (error) {
          console.error('Error updating profile with name:', error);
        }
      }, 1000);
    }
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUserProfile(null);
    return { error };
  };

  return {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  };
}