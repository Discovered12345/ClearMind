export interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-5 scale
  moodEmoji: string;
  note?: string;
  aiPrompt?: string;
  aiResponse?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: number;
  aiPrompt?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags?: string[];
}

export interface User {
  id: string;
  nickname?: string;
  createdAt: string;
  preferences: {
    darkMode: boolean;
    reminders: boolean;
    crisisMode: boolean;
  };
}

export type NavigationTab = 'mood' | 'journal' | 'insights' | 'mindfulness' | 'resources';