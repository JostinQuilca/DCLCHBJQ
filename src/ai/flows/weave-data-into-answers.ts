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
  prompt: `You are an AI chatbot that answers user queries by weaving in relevant data.

  User Query: {{{query}}}

  Relevant Data: {{{relevantData}}}

  Please provide a comprehensive and informative answer to the user query, incorporating the relevant data provided.  Make sure it sounds natural and not like you're just listing facts. `,
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
