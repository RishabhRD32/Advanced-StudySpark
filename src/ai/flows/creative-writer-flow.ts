'use server';
/**
 * @fileOverview AI Creative Writer flow with multi-provider bridge support.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const CreativeWriterInputSchema = z.object({
  type: z.enum(['Essay', 'Poem', 'Story', 'Letter', 'Article', 'Report', 'Speech']).describe('The type of content to generate.'),
  topic: z.string().describe('The subject or theme of the writing.'),
  tone: z.enum(['Academic', 'Creative', 'Professional', 'Casual']).default('Academic'),
  additionalDetails: z.string().optional().describe('Any specific points or requirements to include.'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type CreativeWriterInput = z.infer<typeof CreativeWriterInputSchema>;

const CreativeWriterOutputSchema = z.object({
  title: z.string().describe('A suitable title for the generated content.'),
  content: z.string().describe('The full generated text.'),
});
export type CreativeWriterOutput = z.infer<typeof CreativeWriterOutputSchema>;

const prompt = ai.definePrompt({
  name: 'creativeWriterPrompt',
  input: { schema: CreativeWriterInputSchema },
  output: { schema: CreativeWriterOutputSchema },
  prompt: `You are a master writer skilled in various formats. Generate a high-quality {{{type}}} based on the following parameters:

  TOPIC: {{{topic}}}
  TONE: {{{tone}}}
  {{#if additionalDetails}}DETAILS: {{{additionalDetails}}}{{/if}}

  INSTRUCTIONS:
  1. Provide a catchy and relevant Title.
  2. Write the content in a way that matches the requested format.
  3. Ensure the vocabulary and style match the selected Tone.`,
});

export async function generateCreativeContent(input: CreativeWriterInput): Promise<CreativeWriterOutput> {
  const systemPrompt = "You are a master writer. Return a JSON object with 'title' and 'content' fields.";
  const userPrompt = `Type: ${input.type}\nTopic: ${input.topic}\nTone: ${input.tone}\n\nGenerate high-quality content based on the above.`;

  return runWithFallback(
    async (i, opts) => await prompt(i, { model: opts?.model }),
    input,
    {
      provider: input.provider,
      model: input.model,
      systemPrompt,
      userPrompt
    }
  );
}
