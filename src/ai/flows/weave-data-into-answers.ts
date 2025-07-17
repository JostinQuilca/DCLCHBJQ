// src/ai/flows/weave-data-into-answers.ts
'use server';
/**
 * @fileOverview An AI agent that intelligently weaves pieces of relevant data into its answers.
 *
 * - weaveDataIntoAnswers - A function that handles weaving relevant data into answers.
 * - WeaveDataIntoAnswersInput - The input type for the weaveDataIntoAnswers function.
 * - WeaveDataIntoAnswersOutput - The return type for the weaveDataIntoAnswers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WeaveDataIntoAnswersInputSchema = z.object({
  query: z.string().describe('The user query.'),
  relevantData: z.string().describe('Pieces of relevant data to weave into the answer.'),
});
export type WeaveDataIntoAnswersInput = z.infer<typeof WeaveDataIntoAnswersInputSchema>;

const WeaveDataIntoAnswersOutputSchema = z.object({
  answer: z.string().describe('The answer to the query, with relevant data woven in.'),
});
export type WeaveDataIntoAnswersOutput = z.infer<typeof WeaveDataIntoAnswersOutputSchema>;

export async function weaveDataIntoAnswers(input: WeaveDataIntoAnswersInput): Promise<WeaveDataIntoAnswersOutput> {
  return weaveDataIntoAnswersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weaveDataIntoAnswersPrompt',
  input: {schema: WeaveDataIntoAnswersInputSchema},
  output: {schema: WeaveDataIntoAnswersOutputSchema},
  prompt: `Eres un chatbot de IA que responde a las consultas de los usuarios incorporando datos relevantes. Responde siempre en español.

  Consulta del usuario: {{{query}}}

  Datos relevantes: {{{relevantData}}}

  Por favor, proporciona una respuesta completa e informativa a la consulta del usuario, incorporando los datos relevantes proporcionados. Asegúrate de que suene natural y no como si simplemente estuvieras enumerando hechos.`,
});

const weaveDataIntoAnswersFlow = ai.defineFlow(
  {
    name: 'weaveDataIntoAnswersFlow',
    inputSchema: WeaveDataIntoAnswersInputSchema,
    outputSchema: WeaveDataIntoAnswersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
