import React, { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { useSupabaseStorage } from '../hooks/useSupabaseStorage';
import { useAuth } from '../hooks/useAuth';
import type { Database } from '../types/database';

type MoodEntry = Database['public']['Tables']['mood_entries']['Row'];

const moodOptions = [
  { value: 1, emoji: '😢', label: 'Very Low', color: 'from-red-400 to-red-500' },
  { value: 2, emoji: '😔', label: 'Low', color: 'from-orange-400 to-orange-500' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'from-yellow-400 to-yellow-500' },
  { value: 4, emoji: '😊', label: 'Good', color: 'from-green-400 to-green-500' },
  { value: 5, emoji: '😄', label: 'Amazing', color: 'from-emerald-400 to-emerald-500' },
];

export default function MoodTracker() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const { getMoodEntries, saveMoodEntry } = useSupabaseStorage();
  const { userProfile, user } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = moodEntries.find(entry => entry.date === today);

  useEffect(() => {
    if (user) {
      loadMoodEntries();
    }
  }, [user]);

  const loadMoodEntries = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Loading mood entries...');
      const entries = await getMoodEntries();
      console.log('Loaded mood entries:', entries);
      setMoodEntries(entries);
    } catch (err) {
      console.error('Error loading mood entries:', err);
      setError('Failed to load mood entries');
    }
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadMoodEntries();
    setRefreshing(false);
  };

  const handleSubmitMood = async () => {
    if (!user) {
      setError('You must be logged in to save mood entries');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const moodOption = moodOptions.find(option => option.value === selectedMood)!;
      const entryData = {
        date: today,
        mood: selectedMood,
        mood_emoji: moodOption.emoji,
        note: note.trim() || null,
        ai_prompt: null,
        ai_response: null
      };

      console.log('Submitting mood entry:', entryData);
      const { data, error } = await saveMoodEntry(entryData);

      if (error) {
        console.error('Error saving mood entry:', error);
        setError(`Failed to save mood entry: ${error.message || 'Unknown error'}`);
      } else if (data) {
        console.log('Mood entry saved successfully:', data);
        // Update local state
        setMoodEntries(prev => {
          const filtered = prev.filter(entry => entry.date !== today);
          return [data, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        setNote('');
        setError('');
        // Refresh data to ensure we have the latest
        await refreshData();
      }
    } catch (err) {
      console.error('Unexpected error saving mood entry:', err);
      setError('An unexpected error occurred while saving your mood entry');
    }

    setIsSubmitting(false);
  };

  const recentEntries = moodEntries.slice(0, 7);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your mood tracker...</p>
        </div>
      </div>
    );
  }

  const userName = userProfile?.nickname || 'there';

  return (
    <div className="p-6 space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            How are you feeling today, {userName}?
          </h1>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            title="Refresh mood entries"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-gray-600">Your feelings matter. Take a moment to check in with yourself.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {todayEntry ? (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 text-center">
          <div className="text-6xl mb-4">{todayEntry.mood_emoji}</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            You're feeling {moodOptions.find(m => m.value === todayEntry.mood)?.label.toLowerCase()}, {userName}
          </h3>
          <p className="text-gray-600">Thanks for checking in today!</p>
          {todayEntry.note && (
            <div className="mt-4 p-4 bg-white/50 rounded-lg">
              <p className="text-sm text-gray-700 italic">"{todayEntry.note}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-3">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-200 ${
                  selectedMood === mood.value
                    ? `bg-gradient-to-br ${mood.color} text-white transform scale-105 shadow-lg`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-3xl mb-2">{mood.emoji}</span>
                <span className="text-xs font-medium text-center">{mood.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Want to add a note? (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind today?"
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-right">
              <span className="text-xs text-gray-400">{note.length}/200</span>
            </div>
          </div>

          <button
            onClick={handleSubmitMood}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={20} />
                Save Mood Check-in
              </>
            )}
          </button>
        </div>
      )}

      {recentEntries.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Calendar size={20} />
            Recent Check-ins ({recentEntries.length})
          </div>
          <div className="space-y-2">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{entry.mood_emoji}</span>
                  <div>
                    <div className="font-medium text-gray-800">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    {entry.note && (
                      <div className="text-sm text-gray-600 mt-1">"{entry.note}"</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {moodOptions.find(m => m.value === entry.mood)?.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={40} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No mood entries yet</h3>
          <p className="text-gray-600">Track your first mood above to start your mental health journey.</p>
        </div>
      )}
    </div>
  );
}