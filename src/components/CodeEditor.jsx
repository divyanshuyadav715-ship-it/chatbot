import React from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckSquare, Search, Lightbulb } from 'lucide-react';
import { storageService } from '../services/storageService';

const DEFAULT_CODE = {
  javascript: '// Write your JavaScript code here\nfunction solve() {\n  \n}',
  python: '# Write your Python code here\ndef solve():\n    pass',
  java: '// Write your Java code here\nclass Solution {\n    public void solve() {\n        \n    }\n}',
  cpp: '// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}'
};

export const CodeEditor = ({ onAction }) => {
  const [language, setLanguage] = React.useState('javascript');
  const [code, setCode] = React.useState('');

  React.useEffect(() => {
    const savedCode = storageService.getCode(language, DEFAULT_CODE[language]);
    setCode(savedCode);
  }, [language]);

  const handleEditorChange = (value) => {
    setCode(value);
    storageService.saveCode(language, value);
  };

  const handleAction = (actionType) => {
    onAction({ actionType, code, language });
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-r border-slate-800 w-full lg:w-1/2 flex-shrink-0">
      <div className="flex items-center justify-between p-2 bg-slate-900 border-b border-slate-800">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-slate-800 text-slate-300 text-sm rounded px-2 py-1 focus:outline-none border border-slate-700"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>

        <div className="flex gap-2">
          <button onClick={() => handleAction('Review Code')} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors shadow-sm">
            <CheckSquare className="w-3.5 h-3.5" /> Review
          </button>
          <button onClick={() => handleAction('Analyze Big-O')} className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded transition-colors">
            <Search className="w-3.5 h-3.5" /> Big-O
          </button>
          <button onClick={() => handleAction('Generate Edge Cases')} className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded transition-colors">
            <Play className="w-3.5 h-3.5" /> Edge Cases
          </button>
          <button onClick={() => handleAction('Ask for Hint')} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors shadow-sm">
            <Lightbulb className="w-3.5 h-3.5" /> Hint
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: 16 }
          }}
        />
      </div>
    </div>
  );
};
