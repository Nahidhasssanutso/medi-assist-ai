'use server';

// Note: This will run on the client side in static export mode
// Consider moving AI logic to client-side or using API routes with serverless functions

/**
 * @fileOverview AI flow for analyzing user-provided symptoms and providing a detailed preliminary diagnosis report.
 *
 * - analyzeSymptoms - Function to analyze symptoms and return a detailed report.
 * - SymptomAnalysisInput - Input type for the analyzeSymptoms function.
 * - SymptomAnalysisOutput - Output type for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomAnalysisInputSchema = z.object({
  symptoms: z.string().describe('The symptoms described by the user.'),
  affectedPlacePhoto: z
    .string()
    .optional()
    .describe(
      "A photo of the affected area, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  seenDoctor: z.boolean().describe('Whether the user has seen a doctor for these symptoms.'),
  doctorReportPhoto: z
    .string()
    .optional()
    .describe(
      "A photo of the doctor's report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SymptomAnalysisInput = z.infer<typeof SymptomAnalysisInputSchema>;

const SymptomAnalysisOutputSchema = z.object({
  diseaseInfo: z.object({
    name: z.string().describe('The name of the potential disease or condition.'),
    localName: z.string().describe('The common or local name for the disease.'),
    description: z.string().describe('A detailed explanation of what the disease is.'),
  }),
  whatToDoNow: z.object({
    immediateSteps: z.array(z.string()).describe('A list of immediate actions the user should take.'),
    emergencyAdvice: z.string().describe('Clear, step-by-step advice for emergency situations. Be calm and reassuring.'),
  }),
  recommendedMedicine: z.array(z.object({
    name: z.string().describe('The generic name of the medicine.'),
    localName: z.string().describe('A common brand or local name for the medicine.'),
    dosage: z.string().describe('The recommended dosage (e.g., "500mg tablet").'),
    timing: z.string().describe('When to take the medicine (e.g., "Twice a day after meals").'),
    notes: z.string().describe('Any additional important notes about the medicine.'),
  })).describe("A list of recommended over-the-counter medicines. Preface this with a strong disclaimer that this is not a prescription and a doctor must be consulted."),
  foodAndNutrition: z.object({
    foodsToInclude: z.array(z.string()).describe('List of foods that are beneficial.'),
    hydrationTips: z.array(z.string()).describe('Advice on staying hydrated.'),
    foodsToAvoid: z.array(z.string()).describe('List of foods to avoid.'),
    lifestyleGuidelines: z.array(z.string()).describe('Lifestyle changes that can help with recovery.'),
  }),
  whatNotToDo: z.array(z.string()).describe('A list of activities or things the user should absolutely avoid.'),
  recoveryEstimate: z.string().describe('An estimated time for recovery if all advice is followed.'),
  additionalInfo: z.string().describe('Any other important information the user needs to know.'),
});
export type SymptomAnalysisOutput = z.infer<typeof SymptomAnalysisOutputSchema>;

export async function analyzeSymptoms(input: SymptomAnalysisInput): Promise<SymptomAnalysisOutput> {
  return symptomAnalysisFlow(input);
}

const symptomAnalysisPrompt = ai.definePrompt({
  name: 'symptomAnalysisPrompt',
  input: {schema: SymptomAnalysisInputSchema},
  output: {schema: SymptomAnalysisOutputSchema},
  prompt: `You are an advanced AI Medical Analyst. Your task is to provide a detailed, structured, and responsible preliminary analysis based on the user's input. The user's health is the top priority. Be caring, clear, and provide actionable advice. IMPORTANT: Always include a disclaimer that you are an AI assistant and your analysis is not a substitute for professional medical advice.

User Inputs:
- Symptoms: {{{symptoms}}}
- Has seen a doctor: {{#if seenDoctor}}Yes{{else}}No{{/if}}

{{#if affectedPlacePhoto}}
- Photo of affected area is attached. Analyze it for visual cues.
Photo of affected area: {{media url=affectedPlacePhoto}}
{{/if}}

{{#if doctorReportPhoto}}
- Doctor's report is attached. This is a critical piece of information. Prioritize it in your analysis.
Doctor's report: {{media url=doctorReportPhoto}}
{{/if}}

Please generate a complete JSON object for your analysis based on the schema.
- diseaseInfo: Identify the most likely condition. Provide its name, a common local name, and a clear description.
- whatToDoNow: Provide immediate, step-by-step actions. If it seems like an emergency, give calm, clear, and direct instructions on what to do while waiting for professional help.
- recommendedMedicine: Suggest ONLY over-the-counter medications. For each, give its name, common brand name, dosage, and when to take it. Start this section with a disclaimer that this is not a prescription.
- foodAndNutrition: Give specific advice on diet. Create subsections for foods to eat, hydration, foods to avoid, and lifestyle tips.
- whatNotToDo: List things the user should avoid to prevent worsening their condition.
- recoveryEstimate: Provide a realistic recovery timeframe.
- additionalInfo: Include any other relevant points.

Generate the analysis now.`,
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
