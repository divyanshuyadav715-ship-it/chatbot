export const storageService = {
  saveChatHistory: (history) => {
    localStorage.setItem('dsa_mentor_chat_history', JSON.stringify(history));
  },
  
  getChatHistory: () => {
    const history = localStorage.getItem('dsa_mentor_chat_history');
    return history ? JSON.parse(history) : [];
  },

  saveCode: (language, code) => {
    localStorage.setItem(`dsa_mentor_code_${language}`, code);
  },

  getCode: (language, defaultCode) => {
    return localStorage.getItem(`dsa_mentor_code_${language}`) || defaultCode;
  },

  saveProgress: (roadmapId) => {
    const progress = storageService.getProgress();
    if (!progress.includes(roadmapId)) {
      progress.push(roadmapId);
      localStorage.setItem('dsa_mentor_progress', JSON.stringify(progress));
    }
  },

  getProgress: () => {
    const progress = localStorage.getItem('dsa_mentor_progress');
    return progress ? JSON.parse(progress) : [];
  },
  
  saveApiKey: (key) => {
      localStorage.setItem('dsa_mentor_api_key', key);
  },
  
  getApiKey: () => {
      return localStorage.getItem('dsa_mentor_api_key') || '';
  }
};
