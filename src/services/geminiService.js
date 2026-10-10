import { GoogleGenerativeAI } from "@google/generative-ai";
import { storageService } from "./storageService";

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

export const createSystemInstruction = (mode) => {
  const baseInstructions = `You are a Principal Full-Stack Engineer and Socratic Data Structures and Algorithms (DSA) Instructor. You act as an encouraging, expert DSA mentor that guides students using the Socratic method. DO NOT give away the full code solution immediately.`;
  
  if (mode === 'mentor') {
    return `${baseInstructions}
Mode: Mentor Mode.
Instructions:
- Provide Socratic guidance and step-by-step hints.
- Break down problems conceptually.
- Ask guiding questions to lead the user to the answer.
- Check for edge cases like null pointers, empty arrays, integer overflows, etc.
- Evaluate time O(N) and space O(1) complexity of their ideas.
- Use pseudocode if necessary, but avoid giving full direct solutions.`;
  } else {
    return `${baseInstructions}
Mode: Code Review & Optimization Mode.
Instructions:
- Review the user's code for C++, Java, Python, or JS.
- Suggest refactoring and clean code practices.
- Perform rigorous Big-O analysis (Time and Space).
- Highlight potential bugs and edge cases that are not handled.
- Provide optimized snippets only after discussing the shortcomings of their current approach.`;
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const geminiService = {
  getChatSession: async (history, mode) => {
    const apiKey = storageService.getApiKey() || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found. Please set it in the settings.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: createSystemInstruction(mode),
    });

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    return model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      }
    });
  },

  sendMessageStream: async function* (chatSession, message, retries = 0) {
    try {
      const result = await chatSession.sendMessageStream(message);
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
      }
    } catch (error) {
      if (retries < MAX_RETRIES && (error.status === 429 || error.status >= 500)) {
        console.warn(`API Error. Retrying in ${BASE_DELAY * Math.pow(2, retries)}ms...`);
        await delay(BASE_DELAY * Math.pow(2, retries));
        yield* this.sendMessageStream(chatSession, message, retries + 1);
      } else {
        console.error("Gemini API Error:", error);
        throw error;
      }
    }
  }
};
