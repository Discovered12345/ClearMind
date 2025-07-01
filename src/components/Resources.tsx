import React from 'react';
import { Phone, MessageCircle, Globe, AlertTriangle, Heart, Users } from 'lucide-react';

export default function Resources() {
  const crisisResources = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      description: "24/7 free and confidential support",
      icon: Phone,
      color: "text-red-600 bg-red-50"
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      description: "Free, 24/7 crisis support via text",
      icon: MessageCircle,
      color: "text-blue-600 bg-blue-50"
    },
    {
      name: "Teen Line",
      number: "800-852-8336",
      description: "Teens helping teens, 6PM-10PM PST",
      icon: Users,
      color: "text-purple-600 bg-purple-50"
    }
  ];

  const supportResources = [
    {
      name: "National Alliance on Mental Illness (NAMI)",
      url: "https://nami.org",
      description: "Mental health education, advocacy, and support",
      icon: Heart
    },
    {
      name: "Mental Health America",
      url: "https://mhanational.org",
      description: "Mental health screening tools and resources",
      icon: Globe
    },
    {
      name: "Crisis Text Line",
      url: "https://crisistextline.org",
      description: "Free crisis counseling via text message",
      icon: MessageCircle
    },
    {
      name: "JED Campus",
      url: "https://jedcampus.org",
      description: "Mental health resources for students",
      icon: Users
    }
  ];

  const selfCareActivities = [
    "Take a warm bath or shower",
    "Go for a walk in nature",
    "Listen to your favorite music",
    "Call a trusted friend or family member",
    "Practice deep breathing exercises",
    "Write in a journal",
    "Watch funny videos or movies",
    "Do some gentle stretching or yoga",
    "Make your favorite healthy snack",
    "Create art, draw, or doodle",
    "Read a book or listen to a podcast",
    "Organize your space"
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Support & Resources
        </h1>
        <p className="text-gray-600">You're not alone. Help is always available.</p>
      </div>

      {/* Crisis Resources */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-red-600 font-semibold">
          <AlertTriangle size={20} />
          <h2 className="text-lg">🚨 Crisis Support (Available 24/7)</h2>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-800 font-medium mb-4">
            If you're having thoughts of self-harm or suicide, please reach out immediately:
          </p>
          
          <div className="space-y-3">
            {crisisResources.map((resource, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-red-100">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${resource.color}`}>
                    <resource.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{resource.name}</h3>
                    <p className="text-lg font-bold text-gray-900 my-1">{resource.number}</p>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* General Support Resources */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Heart size={20} className="text-pink-600" />
          Mental Health Support
        </h2>
        
        <div className="grid gap-4">
          {supportResources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <resource.icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {resource.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Self-Care Activities */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">💚 Self-Care Ideas</h2>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <p className="text-gray-700 mb-4">When you're feeling overwhelmed, try one of these activities:</p>
          
          <div className="grid grid-cols-1 gap-2">
            {selfCareActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Important Reminders */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
        <h3 className="font-semibold text-gray-800 mb-3">🌟 Remember</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Your mental health is just as important as your physical health</p>
          <p>• It's okay to not be okay - seeking help is a sign of strength</p>
          <p>• Healing takes time, and that's completely normal</p>
          <p>• You deserve support, care, and happiness</p>
          <p>• Small steps forward are still progress</p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-600">
          🔒 Privacy Notice: All your data stays on your device. We never store or share your personal information.
          This app is a supportive tool and not a substitute for professional mental health care.
        </p>
      </div>
    </div>
  );
}