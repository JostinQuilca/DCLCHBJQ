'use server';

/**
 * @fileOverview Generates an initial greeting or suggestion to start the conversation.
 *
 * - generateFirstMessage - A function that generates the first message.
 * - GenerateFirstMessageInput - The input type for the generateFirstMessage function.
 * - GenerateFirstMessageOutput - The return type for the generateFirstMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFirstMessageInputSchema = z.object({
  topic: z.string().optional().describe('The topic of the conversation.'),
});
export type GenerateFirstMessageInput = z.infer<typeof GenerateFirstMessageInputSchema>;

const GenerateFirstMessageOutputSchema = z.object({
  message: z.string().describe('The initial greeting or suggestion.'),
});
export type GenerateFirstMessageOutput = z.infer<typeof GenerateFirstMessageOutputSchema>;

export async function generateFirstMessage(input: GenerateFirstMessageInput): Promise<GenerateFirstMessageOutput> {
  return generateFirstMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFirstMessagePrompt',
  input: {schema: GenerateFirstMessageInputSchema},
  output: {schema: GenerateFirstMessageOutputSchema},
  prompt: `You are a helpful chatbot assistant. Your goal is to start a conversation with the user.

{{#if topic}}
The user is interested in the topic: {{topic}}.
Suggest an opening line related to this topic.
{{else}}
Suggest a general opening line to start a conversation.
{{/if}}

Response:`,
});

const generateFirstMessageFlow = ai.defineFlow(
  {
    name: 'generateFirstMessageFlow',
    inputSchema: GenerateFirstMessageInputSchema,
    outputSchema: GenerateFirstMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
