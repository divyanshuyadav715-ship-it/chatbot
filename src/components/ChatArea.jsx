import React, { useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Copy } from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-'
});

const QUICK_ACTIONS = [
  "Explain like I'm 5",
  "Dry run with test case",
  "Optimize Space Complexity"
];

export const ChatArea = ({ history, onSendMessage, isLoading, currentStreamingMessage }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, currentStreamingMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleCopyCode = (e) => {
    if (e.target.tagName === 'BUTTON' && e.target.classList.contains('copy-btn')) {
      const codeBlock = e.target.nextElementSibling;
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.textContent);
        const originalText = e.target.innerHTML;
        e.target.innerHTML = '<span class="text-xs">Copied!</span>';
        setTimeout(() => {
          e.target.innerHTML = originalText;
        }, 2000);
      }
    }
  };

  useEffect(() => {
    const renderer = new marked.Renderer();
    renderer.code = (code, language) => {
      const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
      const highlightedCode = hljs.highlight(code, { language: validLanguage }).value;
      return `<div class="code-block-wrapper relative group mt-4 mb-4 rounded-md overflow-hidden bg-[#1e1e1e] border border-slate-700">
        <div class="flex items-center justify-between px-4 py-1.5 bg-slate-800 border-b border-slate-700">
          <span class="text-xs text-slate-400 font-mono">${validLanguage}</span>
          <button class="copy-btn flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors" data-code="${encodeURIComponent(code)}">
            Copy Code
          </button>
        </div>
        <pre class="p-4 overflow-x-auto text-sm"><code class="hljs ${validLanguage}">${highlightedCode}</code></pre>
      </div>`;
    };
    marked.use({ renderer });
  }, []);

  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.addEventListener('click', handleCopyCode);
      return () => chatContainer.removeEventListener('click', handleCopyCode);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 w-full lg:flex-1 relative">
      <div id="chat-container" className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar scroll-smooth space-y-6">
        {history.length === 0 && !currentStreamingMessage ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 max-w-md mx-auto text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-2 shadow-inner">
              <Bot className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-300">Welcome to DSA Mentor AI</h3>
            <p className="text-sm">I'm your Socratic guide to mastering Data Structures and Algorithms. Select a topic, write some code, or ask a question to get started.</p>
          </div>
        ) : (
          history.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div 
                  className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm w-full prose prose-invert max-w-none'
                  }`}
                  dangerouslySetInnerHTML={msg.role === 'model' ? { __html: marked.parse(msg.content) } : undefined}
                >
                  {msg.role === 'user' && msg.content}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))
        )}

        {currentStreamingMessage && (
          <div className="flex gap-4 max-w-4xl mx-auto justify-start">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-start max-w-[85%] w-full">
              <div 
                className="p-4 rounded-2xl shadow-sm bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm w-full prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(currentStreamingMessage) }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-3 overflow-x-auto custom-scrollbar pb-1">
            {QUICK_ACTIONS.map((action, i) => (
              <button 
                key={i} 
                onClick={() => onSendMessage(action)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or request a hint..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-4 pr-12 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && !currentStreamingMessage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
