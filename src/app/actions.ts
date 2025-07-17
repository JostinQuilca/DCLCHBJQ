'use server';

import { generateFirstMessage } from '@/ai/flows/generate-first-message';
import { weaveDataIntoAnswers } from '@/ai/flows/weave-data-into-answers';

export async function getInitialMessage(): Promise<string> {
  try {
    const { message } = await generateFirstMessage({ topic: 'NeoChat, un asistente de IA futurista' });
    return message;
  } catch (error) {
    console.error('Error al obtener el mensaje inicial:', error);
    return '¡Hola! Parece que estoy teniendo problemas para iniciar. Por favor, intenta recargar la página.';
  }
}

export async function getAiResponse(query: string): Promise<string> {
  if (!query) {
    return "No he recibido ningún mensaje. Por favor, inténtalo de nuevo.";
  }
  
  const relevantData = `
    - NeoChat es un chatbot de IA futurista.
    - Está diseñado con una estética de modo oscuro con detalles en azul eléctrico, morado intenso y verde neón.
    - Su objetivo es proporcionar respuestas naturales y conscientes del contexto.
    - El usuario está interactuando con él actualmente.
  `;

  try {
    const { answer } = await weaveDataIntoAnswers({ query, relevantData });
    return answer;
  } catch (error) {
    console.error('Error al obtener la respuesta de la IA:', error);
    return 'Lo siento, algo salió mal de mi lado. Por favor, inténtalo de nuevo en un momento.';
  }
}
