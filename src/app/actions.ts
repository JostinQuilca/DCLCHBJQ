"use server";

import { generateFirstMessage } from "@/ai/flows/generate-first-message";
import { weaveDataIntoAnswers } from "@/ai/flows/weave-data-into-answers";
import { generateChatTitle as generateTitle } from "@/ai/flows/generate-chat-title";

export async function getInitialMessage(): Promise<string> {
  try {
    const { message } = await generateFirstMessage({
      topic: "NeoChat, un asistente de IA futurista",
    });
    return message;
  } catch (error) {
    console.error("Error al obtener el mensaje inicial:", error);
    return "¡Hola! Parece que estoy teniendo problemas para iniciar. Por favor, intenta recargar la página.";
  }
}

export async function getAiResponse(
  query: string,
  photoDataUri?: string
): Promise<string> {
  if (!query && !photoDataUri) {
    return "No he recibido ningún mensaje o imagen. Por favor, inténtalo de nuevo.";
  }

  // This data is now much simpler, as specific info is handled by tools.
  const relevantData = `
    - Eres NeoChat, un chatbot de IA futurista.
    - Tu objetivo es proporcionar respuestas naturales y conscientes del contexto.
    - El usuario está interactuando contigo ahora mismo.
  `;

  try {
    const { answer } = await weaveDataIntoAnswers({
      query,
      relevantData,
      photoDataUri,
    });
    return answer;
  } catch (error) {
    console.error("Error al obtener la respuesta de la IA:", error);
    return "Lo siento, algo salió mal de mi lado. Por favor, inténtalo de nuevo en un momento.";
  }
}

export async function generateChatTitle(message: string): Promise<string> {
  try {
    const { title } = await generateTitle({ message });
    return title;
  } catch (error) {
    console.error("Error al generar el título del chat:", error);
    // Fallback title
    return "Nuevo Chat";
  }
}
