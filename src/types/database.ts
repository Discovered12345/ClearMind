export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string | null;
          created_at: string;
          updated_at: string;
          preferences: {
            darkMode: boolean;
            reminders: boolean;
            crisisMode: boolean;
          };
        };
        Insert: {
          id: string;
          nickname?: string | null;
          created_at?: string;
          updated_at?: string;
          preferences?: {
            darkMode?: boolean;
            reminders?: boolean;
            crisisMode?: boolean;
          };
        };
        Update: {
          id?: string;
          nickname?: string | null;
          created_at?: string;
          updated_at?: string;
          preferences?: {
            darkMode?: boolean;
            reminders?: boolean;
            crisisMode?: boolean;
          };
        };
      };
      mood_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood: number;
          mood_emoji: string;
          note: string | null;
          ai_prompt: string | null;
          ai_response: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          mood: number;
          mood_emoji: string;
          note?: string | null;
          ai_prompt?: string | null;
          ai_response?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          mood?: number;
          mood_emoji?: string;
          note?: string | null;
          ai_prompt?: string | null;
          ai_response?: string | null;
          created_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          title: string;
          content: string;
          mood: number;
          ai_prompt: string | null;
          sentiment: 'positive' | 'neutral' | 'negative' | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          title: string;
          content: string;
          mood: number;
          ai_prompt?: string | null;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          title?: string;
          content?: string;
          mood?: number;
          ai_prompt?: string | null;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}