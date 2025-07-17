'use server';

import { generateFirstMessage } from '@/ai/flows/generate-first-message';
import { weaveDataIntoAnswers } from '@/ai/flows/weave-data-into-answers';

export async function getInitialMessage(): Promise<string> {
  try {
    const { message } = await generateFirstMessage({ topic: 'NeoChat, a futuristic AI assistant' });
    return message;
  } catch (error) {
    console.error('Error fetching initial message:', error);
    return 'Hello! I seem to be having trouble starting up. Please try refreshing the page.';
  }
}

export async function getAiResponse(query: string): Promise<string> {
  if (!query) {
    return "I didn't receive a message. Please try again.";
  }
  
  const relevantData = `
    - NeoChat is a futuristic AI chatbot.
    - It's designed with a dark mode aesthetic featuring electric blue, deep purple, and neon green accents.
    - It aims to provide natural and context-aware responses.
    - The user is currently interacting with it.
  `;

  try {
    const { answer } = await weaveDataIntoAnswers({ query, relevantData });
    return answer;
  } catch (error) {
    console.error('Error getting AI response:', error);
    return 'Sorry, something went wrong on my end. Please try again in a moment.';
  }
}
