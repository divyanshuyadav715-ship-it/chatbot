import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { CodeEditor } from './CodeEditor';
import { ChatArea } from './ChatArea';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { Menu, BookOpen } from 'lucide-react';

export const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mode, setMode] = useState('mentor'); // 'mentor' | 'review'
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [chatSession, setChatSession] = useState(null);

  useEffect(() => {
    const savedHistory = storageService.getChatHistory();
    setHistory(savedHistory);
  }, []);

  const initChatSession = async () => {
    try {
      const session = await geminiService.getChatSession(history, mode);
      setChatSession(session);
      return session;
    } catch (error) {
      console.error("Failed to initialize chat session:", error);
      alert(error.message);
      return null;
    }
  };

  const handleSendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    const newHistory = [...history, { role: 'user', content }];
    setHistory(newHistory);
    storageService.saveChatHistory(newHistory);
    setIsLoading(true);
    setCurrentStreamingMessage('');

    try {
      let session = chatSession;
      if (!session) {
        session = await initChatSession();
      }
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      let fullResponse = '';
      const stream = geminiService.sendMessageStream(session, content);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setCurrentStreamingMessage(fullResponse);
      }

      const updatedHistory = [...newHistory, { role: 'model', content: fullResponse }];
      setHistory(updatedHistory);
      storageService.saveChatHistory(updatedHistory);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg = `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again or check your API key.`;
      const updatedHistory = [...newHistory, { role: 'model', content: errorMsg }];
      setHistory(updatedHistory);
      storageService.saveChatHistory(updatedHistory);
      setChatSession(null);
    } finally {
      setIsLoading(false);
      setCurrentStreamingMessage('');
    }
  };

  const handleEditorAction = ({ actionType, code, language }) => {
    let prompt = '';
    
    if (actionType === 'Review Code') {
      setMode('review');
      prompt = `Please review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide refactoring tips, highlight potential bugs, and suggest clean code practices.`;
    } else if (actionType === 'Analyze Big-O') {
      prompt = `Analyze the time and space complexity of this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nExplain the reasoning step by step.`;
    } else if (actionType === 'Generate Edge Cases') {
      prompt = `What are the important edge cases to consider for this ${language} implementation? Please provide examples.\n\n\`\`\`${language}\n${code}\n\`\`\``;
    } else if (actionType === 'Ask for Hint') {
      setMode('mentor');
      prompt = `I need a hint for my current approach in ${language}:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nPlease use the Socratic method and do NOT give me the direct solution.`;
    }

    handleSendMessage(prompt);
  };

  const handleTopicSelect = (topic) => {
    handleSendMessage(`I'd like to start practicing "${topic.name}". Can you give me a conceptual overview or a beginner-friendly problem to start with?`);
    setIsSidebarOpen(false);
  };

  const handleModeToggle = () => {
    setMode(prev => prev === 'mentor' ? 'review' : 'mentor');
    setChatSession(null); // Force re-init with new persona
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-300">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(false)} 
        onTopicSelect={handleTopicSelect} 
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between p-3 lg:p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h1 className="font-semibold text-white">Interactive Workspace</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button 
                onClick={() => handleModeToggle()}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'mentor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Mentor Mode
              </button>
              <button 
                onClick={() => handleModeToggle()}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'review' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Code Review
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <CodeEditor onAction={handleEditorAction} />
          <ChatArea 
            history={history} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            currentStreamingMessage={currentStreamingMessage} 
          />
        </div>
      </main>
    </div>
  );
};
