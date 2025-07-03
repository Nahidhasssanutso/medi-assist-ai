'use server';

/**
 * @fileOverview AI flow for analyzing user-provided symptoms and providing a preliminary diagnosis.
 *
 * - analyzeSymptoms - Function to analyze symptoms and return a preliminary diagnosis.
 * - SymptomAnalysisInput - Input type for the analyzeSymptoms function.
 * - SymptomAnalysisOutput - Output type for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomAnalysisInputSchema = z.object({
  symptoms: z.string().describe('The symptoms described by the user.'),
});
export type SymptomAnalysisInput = z.infer<typeof SymptomAnalysisInputSchema>;

const SymptomAnalysisOutputSchema = z.object({
  diagnosis: z.string().describe('A preliminary diagnosis based on the symptoms provided.'),
  confidenceLevel: z
    .string()
    .describe('A string representing the confidence level of the diagnosis.'),
});
export type SymptomAnalysisOutput = z.infer<typeof SymptomAnalysisOutputSchema>;

export async function analyzeSymptoms(input: SymptomAnalysisInput): Promise<SymptomAnalysisOutput> {
  return symptomAnalysisFlow(input);
}

const symptomAnalysisPrompt = ai.definePrompt({
  name: 'symptomAnalysisPrompt',
  input: {schema: SymptomAnalysisInputSchema},
  output: {schema: SymptomAnalysisOutputSchema},
  prompt: `You are a medical AI assistant providing preliminary diagnoses based on user-provided symptoms.

  Analyze the following symptoms and provide a preliminary diagnosis. Include a confidence level (High, Medium, Low) for your diagnosis.

  Symptoms: {{{symptoms}}}
  `,
});

const symptomAnalysisFlow = ai.defineFlow(
  {
    name: 'symptomAnalysisFlow',
    inputSchema: SymptomAnalysisInputSchema,
    outputSchema: SymptomAnalysisOutputSchema,
  },
  async input => {
    const {output} = await symptomAnalysisPrompt(input);
    return output!;
  }
);
