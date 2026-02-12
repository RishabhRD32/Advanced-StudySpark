
'use server';
/**
 * @fileOverview API Diagnostic flow for testing model connectivity and examining errors.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DiagnosticInputSchema = z.object({
  apiKey: z.string().optional().describe('Optional API key to override system default.'),
  modelName: z.string().describe('The full model identifier to test (e.g. googleai/gemini-1.5-flash).'),
  prompt: z.string().describe('The test prompt to send.'),
});
export type DiagnosticInput = z.infer<typeof DiagnosticInputSchema>;

const DiagnosticOutputSchema = z.object({
  success: z.boolean(),
  response: z.string().optional(),
  errorType: z.string().optional(),
  errorMessage: z.string().optional(),
  rawError: z.any().optional(),
});
export type DiagnosticOutput = z.infer<typeof DiagnosticOutputSchema>;

/**
 * Diagnostic function to test API health.
 * Exclusively optimized for first-party plugins registered in Genkit 1.x.
 */
export async function runApiDiagnostic(input: DiagnosticInput): Promise<DiagnosticOutput> {
  try {
    // In Genkit 1.x, we use ai.model() to get a reference to a registered model.
    // Ensure the modelName matches a registered plugin (e.g. googleai/gemini-1.5-flash)
    const modelReference = ai.model(input.modelName);

    const { text } = await ai.generate({
      model: modelReference,
      prompt: input.prompt,
    });

    return {
      success: true,
      response: text,
    };
  } catch (e: any) {
    console.error("Diagnostic Flow Error:", e);
    
    const errorName = e.name || 'ApiError';
    let message = e.message || 'An unknown error occurred during generation.';
    
    // ROOT CAUSE ANALYSIS: Provide human-readable solutions for common errors
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.includes("quota")) {
      message = "QUOTA EXHAUSTED (429): You have reached the provider tier limit. SOLUTION: 1. Wait 60 seconds. 2. Verify your billing/credits. 3. Switch to a model with higher limits.";
    } else if (message.includes("404") || message.includes("not found") || message.includes("not registered")) {
      message = "MODEL/PLUGIN ERROR (404): The model name is incorrect or the provider plugin is not compatible with Genkit 1.x.";
    } else if (message.includes("403") || message.includes("PERMISSION_DENIED") || message.includes("API key")) {
      message = "INVALID KEY (403): The API key provided is incorrect or doesn't have permission for this model. Verify your .env file.";
    } else if (message.includes("500") || message.includes("Internal Server Error")) {
      message = "SERVER ERROR (500): The AI provider's servers are temporarily overwhelmed.";
    }
    
    return {
      success: false,
      errorType: errorName,
      errorMessage: message,
      rawError: {
        status: e.status || 'UNKNOWN',
        code: e.code || 'NO_CODE',
        details: e.details || 'Check your provider dashboard for more info.',
      }
    };
  }
}
