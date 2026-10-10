import React from 'react';
import { BookOpen, CheckCircle, Code, Settings, MessageSquare, Menu, X } from 'lucide-react';
import { storageService } from '../services/storageService';

const ROADMAP = [
  {
    tier: 'Level 1: Fundamentals',
    topics: [
      { id: 'arrays', name: 'Arrays & Strings' },
      { id: 'sliding_window', name: 'Sliding Window' },
      { id: 'two_pointers', name: 'Two Pointers' }
    ]
  },
  {
    tier: 'Level 2: Intermediate',
    topics: [
      { id: 'linked_lists', name: 'Linked Lists' },
      { id: 'trees', name: 'Trees & BST' },
      { id: 'binary_search', name: 'Binary Search' }
    ]
  },
  {
    tier: 'Level 3: Advanced',
    topics: [
      { id: 'dp', name: 'Dynamic Programming' },
      { id: 'graphs', name: 'Graphs' },
      { id: 'tries', name: 'Tries' }
    ]
  }
];

export const Sidebar = ({ isOpen, toggleSidebar, onTopicSelect }) => {
  const [progress, setProgress] = React.useState([]);
  const [apiKey, setApiKey] = React.useState('');
  const [showSettings, setShowSettings] = React.useState(false);

  React.useEffect(() => {
    setProgress(storageService.getProgress());
    setApiKey(storageService.getApiKey());
  }, []);

  const handleSaveApiKey = (e) => {
    const val = e.target.value;
    setApiKey(val);
    storageService.saveApiKey(val);
  };

  const handleMarkComplete = (id, e) => {
    e.stopPropagation();
    storageService.saveProgress(id);
    setProgress([...progress, id]);
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-700 text-slate-300 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xl tracking-tight">
          <Code className="w-6 h-6" />
          DSA Mentor AI
        </div>
        <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Learning Roadmap</h2>
          {ROADMAP.map((tier, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">{tier.tier}</h3>
              <ul className="space-y-1">
                {tier.topics.map(topic => {
                  const isCompleted = progress.includes(topic.id);
                  return (
                    <li key={topic.id}>
                      <button 
                        onClick={() => onTopicSelect(topic)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-slate-800 transition-colors group text-left"
                      >
                        <span className="truncate">{topic.name}</span>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <CheckCircle 
                            onClick={(e) => handleMarkComplete(topic.id, e)}
                            className="w-4 h-4 text-slate-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all" 
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full mb-3"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        
        {showSettings && (
          <div className="bg-slate-800 p-3 rounded-lg mb-2">
            <label className="block text-xs text-slate-400 mb-1">Gemini API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={handleSaveApiKey}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
