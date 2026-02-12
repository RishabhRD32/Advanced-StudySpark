'use server';
/**
 * @fileOverview AI Humanizer flow with multi-provider bridge support.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const HumanizerInputSchema = z.object({
  text: z.string().describe('The text to humanize.'),
  tone: z.enum(['friendly', 'professional', 'inspiring']).default('professional'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type HumanizerInput = z.infer<typeof HumanizerInputSchema>;

const HumanizerOutputSchema = z.object({
  humanizedText: z.string().describe('The rephrased, more natural text.'),
});
export type HumanizerOutput = z.infer<typeof HumanizerOutputSchema>;

const prompt = ai.definePrompt({
  name: 'humanizerPrompt',
  input: { schema: HumanizerInputSchema },
  output: { schema: HumanizerOutputSchema },
  prompt: `You are an expert editor. Rewrite the following text to make it sound more natural, human, and engaging. 
  Avoid common AI patterns like overly formal structures or repetitive lists. 
  Keep the tone: {{{tone}}}.

  Original Text:
  {{{text}}}`,
});

export async function humanizeContent(input: HumanizerInput): Promise<HumanizerOutput> {
  const systemPrompt = "You are an expert editor who makes AI content sound natural and human.";
  const userPrompt = `Tone: ${input.tone}\n\nText: ${input.text}\n\nRewrite the text above to sound more human and engaging.`;

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
