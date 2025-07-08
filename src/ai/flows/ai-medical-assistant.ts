'use server';

// Note: This will run on the client side in static export mode
// Consider moving AI logic to client-side or using API routes with serverless functions

/**
 * @fileOverview This file defines a Genkit flow for an AI medical assistant.
 *
 * - aiMedicalAssistant - A function that allows users to chat with an AI medical assistant for personalized advice and support.
 * - AiMedicalAssistantInput - The input type for the aiMedicalAssistant function.
 * - AiMedicalAssistantOutput - The return type for the aiMedicalAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiMedicalAssistantInputSchema = z.object({
  message: z.string().describe('The user message to the AI medical assistant.'),
  context: z.string().optional().describe('The context from the user\'s recent analysis report.'),
});
export type AiMedicalAssistantInput = z.infer<typeof AiMedicalAssistantInputSchema>;

const AiMedicalAssistantOutputSchema = z.object({
  response: z.string().describe('The AI medical assistant response.'),
});
export type AiMedicalAssistantOutput = z.infer<typeof AiMedicalAssistantOutputSchema>;

export async function aiMedicalAssistant(input: AiMedicalAssistantInput): Promise<AiMedicalAssistantOutput> {
  return aiMedicalAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMedicalAssistantPrompt',
  input: {schema: AiMedicalAssistantInputSchema},
  output: {schema: AiMedicalAssistantOutputSchema},
  prompt: `You are a 24/7 AI Medical Assistant, tailored to understand user symptoms and guide them toward recovery. Based on a curated medical knowledge base, you provide personalized advice and support. 
  {{#if context}}
  The user has just received the following analysis report. Use this as the primary context for your conversation.
  ---
  {{{context}}}
  ---
  {{/if}}

  User Message: {{{message}}}
  Response: `,
});

const aiMedicalAssistantFlow = ai.defineFlow(
  {
    name: 'aiMedicalAssistantFlow',
    inputSchema: AiMedicalAssistantInputSchema,
    outputSchema: AiMedicalAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
