import React from 'react';
import { Heart, BookOpen, BarChart3, Brain, Phone } from 'lucide-react';
import type { NavigationTab } from '../types';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

const tabs = [
  { id: 'mood' as NavigationTab, icon: Heart, label: 'Mood' },
  { id: 'journal' as NavigationTab, icon: BookOpen, label: 'Journal' },
  { id: 'insights' as NavigationTab, icon: BarChart3, label: 'Insights' },
  { id: 'mindfulness' as NavigationTab, icon: Brain, label: 'Mindfulness' },
  { id: 'resources' as NavigationTab, icon: Phone, label: 'Help' },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon 
                  size={20} 
                  className={`mb-1 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`} 
                />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}