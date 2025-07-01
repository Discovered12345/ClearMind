import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import MoodTracker from './components/MoodTracker';
import Journal from './components/Journal';
import Insights from './components/Insights';
import Mindfulness from './components/Mindfulness';
import Resources from './components/Resources';
import { LogOut } from 'lucide-react';
import type { NavigationTab } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('mood');
  const { user, loading, signOut } = useAuth();

  // Reduced maximum loading time to 3 seconds
  const [maxLoadingReached, setMaxLoadingReached] = useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Maximum loading time reached, showing auth screen');
        setMaxLoadingReached(true);
      }
    }, 3000); // Reduced to 3 seconds

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !maxLoadingReached) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ClearMind AI...</p>
          <p className="text-gray-400 text-sm mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  if (!user || maxLoadingReached) {
    return <Auth />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'mood':
        return <MoodTracker />;
      case 'journal':
        return <Journal />;
      case 'insights':
        return <Insights />;
      case 'mindfulness':
        return <Mindfulness />;
      case 'resources':
        return <Resources />;
      default:
        return <MoodTracker />;
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm min-h-screen shadow-xl relative">
        <button
          onClick={handleSignOut}
          className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
        
        <main className="pb-20">
          {renderActiveComponent()}
        </main>
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default App;