import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Heart, Sparkles, Moon } from 'lucide-react';

export default function Mindfulness() {
  const [currentExercise, setCurrentExercise] = useState<'breathing' | 'affirmations' | 'sleep' | null>(null);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);

  const affirmations = [
    "I am worthy of love and respect",
    "My feelings are valid and important",
    "I have the strength to overcome challenges",
    "I am growing and learning every day",
    "I deserve happiness and peace",
    "I am enough exactly as I am",
    "I choose to be kind to myself",
    "My mental health matters",
    "I am resilient and capable",
    "I trust in my ability to heal"
  ];

  const sleepStories = [
    {
      title: "Peaceful Forest Walk",
      description: "Imagine walking through a calm, sunlit forest where every step brings deeper relaxation.",
      content: "Close your eyes and picture yourself at the edge of a beautiful forest. The sun filters through the leaves, creating dancing patterns of light and shadow on the forest floor..."
    },
    {
      title: "Ocean Waves",
      description: "Let the gentle rhythm of ocean waves wash away your worries and guide you to sleep.",
      content: "You're lying on warm, soft sand as gentle waves lap at the shore. Each wave that rolls in carries away tension from your body..."
    },
    {
      title: "Mountain Meadow",
      description: "Find peace in a serene mountain meadow filled with wildflowers and gentle breezes.",
      content: "You find yourself in a beautiful meadow high in the mountains. Colorful wildflowers sway gently in the warm breeze..."
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && currentExercise === 'breathing') {
      interval = setInterval(() => {
        setBreathingCount(prev => {
          const phases = { inhale: 4, hold: 4, exhale: 6 };
          const currentPhaseLength = phases[breathingPhase];
          
          if (prev >= currentPhaseLength - 1) {
            const nextPhase = breathingPhase === 'inhale' ? 'hold' : 
                            breathingPhase === 'hold' ? 'exhale' : 'inhale';
            setBreathingPhase(nextPhase);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, breathingPhase, currentExercise]);

  const resetBreathing = () => {
    setIsActive(false);
    setBreathingPhase('inhale');
    setBreathingCount(0);
  };

  const nextAffirmation = () => {
    setCurrentAffirmation(prev => (prev + 1) % affirmations.length);
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe in slowly...';
      case 'hold': return 'Hold your breath...';
      case 'exhale': return 'Breathe out gently...';
    }
  };

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case 'inhale': return 'from-blue-400 to-blue-600';
      case 'hold': return 'from-purple-400 to-purple-600';
      case 'exhale': return 'from-green-400 to-green-600';
    }
  };

  if (currentExercise === 'breathing') {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
        <button
          onClick={() => setCurrentExercise(null)}
          className="absolute top-6 left-6 text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
        
        <div className="text-center space-y-8">
          <h2 className="text-2xl font-bold text-gray-800">4-4-6 Breathing Exercise</h2>
          
          <div className="relative">
            <div 
              className={`w-32 h-32 rounded-full bg-gradient-to-br ${getBreathingColor()} transition-all duration-1000 flex items-center justify-center ${
                isActive ? 'scale-110 shadow-2xl' : 'scale-100'
              }`}
            >
              <div className="text-white font-bold text-lg">
                {breathingCount + 1}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-xl font-medium text-gray-700">{getBreathingInstruction()}</p>
            <p className="text-gray-600 capitalize">{breathingPhase} Phase</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setIsActive(!isActive)}
              className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isActive ? <Pause size={20} /> : <Play size={20} />}
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetBreathing}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentExercise === 'affirmations') {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex flex-col">
        <button
          onClick={() => setCurrentExercise(null)}
          className="text-gray-600 hover:text-gray-800 mb-6"
        >
          ← Back
        </button>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
          <h2 className="text-2xl font-bold text-gray-800">Daily Affirmations</h2>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md">
            <div className="text-6xl mb-6">✨</div>
            <p className="text-xl font-medium text-gray-800 leading-relaxed">
              {affirmations[currentAffirmation]}
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={nextAffirmation}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Next Affirmation
            </button>
            <p className="text-gray-600 text-sm">
              {currentAffirmation + 1} of {affirmations.length}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentExercise === 'sleep') {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
        <button
          onClick={() => setCurrentExercise(null)}
          className="text-gray-300 hover:text-white mb-6"
        >
          ← Back
        </button>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Sleep Stories</h2>
          
          <div className="space-y-4">
            {sleepStories.map((story, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{story.description}</p>
                <p className="text-gray-100 leading-relaxed">{story.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Mindfulness Zone
        </h1>
        <p className="text-gray-600">Take a moment to center yourself and find peace.</p>
      </div>

      <div className="grid gap-6">
        <button
          onClick={() => setCurrentExercise('breathing')}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-xl text-white group-hover:scale-110 transition-transform">
              <Heart size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-lg">Breathing Exercise</h3>
              <p className="text-gray-600">Calm your mind with guided 4-4-6 breathing</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setCurrentExercise('affirmations')}
          className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-2xl p-6 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500 rounded-xl text-white group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-lg">Daily Affirmations</h3>
              <p className="text-gray-600">Positive reminders to boost your self-worth</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setCurrentExercise('sleep')}
          className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-6 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500 rounded-xl text-white group-hover:scale-110 transition-transform">
              <Moon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-lg">Sleep Stories</h3>
              <p className="text-gray-600">Peaceful stories to help you drift off to sleep</p>
            </div>
          </div>
        </button>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <h3 className="font-semibold text-gray-800 mb-3">✨ Quick Mindfulness Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Take three deep breaths whenever you feel overwhelmed</li>
          <li>• Practice the 5-4-3-2-1 grounding technique: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste</li>
          <li>• Set aside 5 minutes each day for mindful breathing</li>
          <li>• Be patient with yourself - mindfulness is a practice, not perfection</li>
        </ul>
      </div>
    </div>
  );
}