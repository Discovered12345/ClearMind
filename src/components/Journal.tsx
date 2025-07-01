import React, { useState, useEffect } from 'react';
import { PenTool, Sparkles, Save, Calendar, RefreshCw } from 'lucide-react';
import { useSupabaseStorage } from '../hooks/useSupabaseStorage';
import { useAuth } from '../hooks/useAuth';
import { generateJournalPrompt, analyzeSentiment } from '../services/gemini';
import type { Database } from '../types/database';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type MoodEntry = Database['public']['Tables']['mood_entries']['Row'];

export default function Journal() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState({ title: '', content: '' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { getJournalEntries, getMoodEntries, saveJournalEntry } = useSupabaseStorage();
  const { userProfile, user } = useAuth();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    // Only generate prompt if we don't have one and we have mood data
    const todayMood = moodEntries.find(entry => entry.date === today);
    if (todayMood && !aiPrompt && !isGeneratingPrompt) {
      generatePrompt();
    }
  }, [moodEntries, today, aiPrompt, isGeneratingPrompt]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading journal and mood data...');
      const [journals, moods] = await Promise.all([
        getJournalEntries(),
        getMoodEntries()
      ]);
      console.log('Loaded journals:', journals);
      console.log('Loaded moods:', moods);
      setJournalEntries(journals);
      setMoodEntries(moods);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const generatePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const todayMood = moodEntries.find(entry => entry.date === today);
      const recentEntries = journalEntries
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map(entry => entry.content);

      const prompt = await generateJournalPrompt(todayMood?.mood || 3, recentEntries);
      setAiPrompt(prompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      setAiPrompt("What's one thing that happened today that you'd like to explore more deeply?");
    }
    setIsGeneratingPrompt(false);
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.title.trim() || !currentEntry.content.trim()) return;

    setIsSaving(true);
    try {
      const todayMood = moodEntries.find(entry => entry.date === today);
      
      // Analyze sentiment with fallback
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      try {
        sentiment = await analyzeSentiment(currentEntry.content);
      } catch (error) {
        console.log('Using neutral sentiment due to analysis error:', error);
      }
      
      const entryData = {
        date: today,
        title: currentEntry.title.trim(),
        content: currentEntry.content.trim(),
        mood: todayMood?.mood || 3,
        ai_prompt: aiPrompt || null,
        sentiment,
        tags: []
      };

      const { data, error } = await saveJournalEntry(entryData);

      if (error) {
        console.error('Error saving journal entry:', error);
      } else if (data) {
        setJournalEntries(prev => [data, ...prev]);
        setCurrentEntry({ title: '', content: '' });
        setAiPrompt('');
        // Refresh data to ensure we have the latest
        await refreshData();
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    }
    setIsSaving(false);
  };

  const recentEntries = journalEntries.slice(0, 5);

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your journal entries...</p>
        </div>
      </div>
    );
  }

  const userName = userProfile?.nickname || 'friend';

  return (
    <div className="p-6 space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Your Safe Space, {userName}
          </h1>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            title="Refresh entries"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-gray-600">Express your thoughts freely. This is your private journal.</p>
      </div>

      <div className="space-y-6">
        {aiPrompt && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles size={20} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">Today's Reflection Prompt for {userName}</h3>
                <p className="text-gray-700 leading-relaxed">{aiPrompt}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            value={currentEntry.title}
            onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Give your entry a title..."
            className="w-full p-4 text-lg font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            maxLength={100}
          />

          <textarea
            value={currentEntry.content}
            onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Start writing your thoughts here... Remember, this is a judgment-free space just for you."
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[200px]"
            maxLength={2000}
          />

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">{currentEntry.content.length}/2000</span>
            <button
              onClick={generatePrompt}
              disabled={isGeneratingPrompt}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {isGeneratingPrompt ? (
                <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              New Prompt
            </button>
          </div>

          <button
            onClick={handleSaveEntry}
            disabled={!currentEntry.title.trim() || !currentEntry.content.trim() || isSaving}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={20} />
                Save Entry
              </>
            )}
          </button>
        </div>
      </div>

      {recentEntries.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Calendar size={20} />
            Recent Entries ({recentEntries.length})
          </div>
          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-lg">{entry.title}</h3>
                  <div className="flex items-center gap-2">
                    {entry.sentiment && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(entry.sentiment)}`}>
                        {entry.sentiment}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed line-clamp-3">
                  {entry.content}
                </p>
                {entry.ai_prompt && (
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-indigo-700 italic">
                      Prompt: {entry.ai_prompt}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PenTool size={40} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No journal entries yet</h3>
          <p className="text-gray-600">Start writing your first entry above to begin your journaling journey.</p>
        </div>
      )}
    </div>
  );
}