"use server";
/**
 * @fileOverview An AI agent that intelligently weaves pieces of relevant data into its answers.
 *
 * - weaveDataIntoAnswers - A function that handles weaving relevant data into answers.
 * - WeaveDataIntoAnswersInput - The input type for the weaveDataIntoAnswers function.
 * - WeaveDataIntoAnswersOutput - The return type for the weaveDataIntoAnswers function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { getCreatorInfoTool } from "@/ai/tools/get-creator-info";

const WeaveDataIntoAnswersInputSchema = z.object({
  query: z.string().describe("The user query."),
  relevantData: z
    .string()
    .describe("Pieces of relevant data to weave into the answer."),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo from the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type WeaveDataIntoAnswersInput = z.infer<
  typeof WeaveDataIntoAnswersInputSchema
>;

const WeaveDataIntoAnswersOutputSchema = z.object({
  answer: z
    .string()
    .describe("The answer to the query, with relevant data woven in."),
});
export type WeaveDataIntoAnswersOutput = z.infer<
  typeof WeaveDataIntoAnswersOutputSchema
>;

export async function weaveDataIntoAnswers(
  input: WeaveDataIntoAnswersInput
): Promise<WeaveDataIntoAnswersOutput> {
  return weaveDataIntoAnswersFlow(input);
}

const prompt = ai.definePrompt({
  name: "weaveDataIntoAnswersPrompt",
  input: { schema: WeaveDataIntoAnswersInputSchema },
  output: { schema: WeaveDataIntoAnswersOutputSchema },
  tools: [getCreatorInfoTool],
  prompt: `Eres un chatbot de IA que responde a las consultas de los usuarios incorporando datos relevantes y analizando imágenes si se proporcionan. Responde siempre en español.

  Instrucciones:
  - Si el usuario pregunta sobre tu creador o tu origen, utiliza la herramienta 'getCreatorInfoTool' para obtener esa información e inclúyela en tu respuesta.
  - El diseño de la aplicación tiene una estética de modo oscuro con detalles en morado intenso. Menciona esto SOLO si es relevante para la conversación (por ejemplo, si te preguntan por tu apariencia).

  Consulta del usuario: {{{query}}}
  
  {{#if photoDataUri}}
  El usuario ha proporcionado esta imagen para que la analices:
  {{media url=photoDataUri}}
  {{/if}}

  Datos relevantes sobre ti: {{{relevantData}}}

  Por favor, proporciona una respuesta completa e informativa a la consulta del usuario, siguiendo las instrucciones y utilizando las herramientas disponibles cuando sea necesario. Asegúrate de que suene natural.`,
});

const weaveDataIntoAnswersFlow = ai.defineFlow(
  {
    name: "weaveDataIntoAnswersFlow",
    inputSchema: WeaveDataIntoAnswersInputSchema,
    outputSchema: WeaveDataIntoAnswersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
