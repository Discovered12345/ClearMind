import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Heart, BookOpen, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useSupabaseStorage } from '../hooks/useSupabaseStorage';
import { useAuth } from '../hooks/useAuth';
import type { Database } from '../types/database';

type MoodEntry = Database['public']['Tables']['mood_entries']['Row'];
type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];

export default function Insights() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getMoodEntries, getJournalEntries } = useSupabaseStorage();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading insights data...');
      const [moods, journals] = await Promise.all([
        getMoodEntries(),
        getJournalEntries()
      ]);
      console.log('Loaded moods for insights:', moods);
      console.log('Loaded journals for insights:', journals);
      setMoodEntries(moods);
      setJournalEntries(journals);
    } catch (error) {
      console.error('Error loading insights data:', error);
    }
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Prepare mood trend data
  const moodTrendData = moodEntries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14) // Last 14 days
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.mood,
    }));

  // Prepare mood distribution data
  const moodDistribution = [
    { name: 'Amazing', value: moodEntries.filter(e => e.mood === 5).length, color: '#10B981' },
    { name: 'Good', value: moodEntries.filter(e => e.mood === 4).length, color: '#34D399' },
    { name: 'Okay', value: moodEntries.filter(e => e.mood === 3).length, color: '#FBBF24' },
    { name: 'Low', value: moodEntries.filter(e => e.mood === 2).length, color: '#FB923C' },
    { name: 'Very Low', value: moodEntries.filter(e => e.mood === 1).length, color: '#F87171' },
  ].filter(item => item.value > 0);

  // Calculate stats
  const averageMood = moodEntries.length > 0 
    ? (moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length).toFixed(1)
    : '0';

  const totalEntries = moodEntries.length + journalEntries.length;
  const thisWeek = moodEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

  const sentimentData = [
    { name: 'Positive', value: journalEntries.filter(e => e.sentiment === 'positive').length, color: '#10B981' },
    { name: 'Neutral', value: journalEntries.filter(e => e.sentiment === 'neutral').length, color: '#6B7280' },
    { name: 'Negative', value: journalEntries.filter(e => e.sentiment === 'negative').length, color: '#EF4444' },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your insights...</p>
        </div>
      </div>
    );
  }

  if (moodEntries.length === 0 && journalEntries.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={40} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Journey Starts Here</h2>
          <p className="text-gray-600 mb-6">
            Start tracking your mood and journaling to see meaningful insights about your mental health journey.
          </p>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
            <p className="text-sm text-gray-700">
              Your insights will appear here as you track your mood and write journal entries. 
              Even a few days of data can reveal helpful patterns!
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Your Mental Health Insights
          </h1>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            title="Refresh insights"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-gray-600">Understanding your patterns helps you grow.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-700">{averageMood}</div>
          <div className="text-sm text-indigo-600">Average Mood</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{thisWeek}</div>
          <div className="text-sm text-green-600">Check-ins This Week</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center mb-6">
        <div className="text-lg font-semibold text-blue-800 mb-2">Data Summary</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xl font-bold text-blue-700">{moodEntries.length}</div>
            <div className="text-blue-600">Mood Entries</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-700">{journalEntries.length}</div>
            <div className="text-blue-600">Journal Entries</div>
          </div>
        </div>
      </div>

      {moodTrendData.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-800">Mood Trend (Last 2 Weeks)</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodTrendData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  domain={[1, 5]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#6366F1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {moodDistribution.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={20} className="text-pink-600" />
            <h3 className="font-semibold text-gray-800">Mood Distribution</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {sentimentData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-purple-600" />
            <h3 className="font-semibold text-gray-800">Journal Sentiment Analysis</h3>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h3 className="font-semibold text-gray-800 mb-3">💡 Personal Insights</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• You've completed {totalEntries} total check-ins on your mental health journey.</p>
          {moodEntries.length > 0 && (
            <p>• Your most common mood level is {
              moodDistribution.length > 0 
                ? moodDistribution.reduce((max, current) => max.value > current.value ? max : current).name.toLowerCase()
                : 'not yet determined'
            }.</p>
          )}
          {journalEntries.length > 0 && (
            <p>• You've written {journalEntries.length} journal entries, showing commitment to self-reflection.</p>
          )}
          <p>• Remember: healing isn't linear. Every step counts! 🌱</p>
        </div>
      </div>
    </div>
  );
}