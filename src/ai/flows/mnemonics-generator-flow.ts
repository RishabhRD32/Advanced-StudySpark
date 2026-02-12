'use server';
/**
 * @fileOverview AI Mnemonics Generator flow with multi-provider bridge support.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const MnemonicsInputSchema = z.object({
  terms: z.string().describe('The list of terms or formula to memorize.'),
  style: z.enum(['Acronym', 'Story', 'Rhyme', 'Sentence']).default('Acronym'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type MnemonicsInput = z.infer<typeof MnemonicsInputSchema>;

const MnemonicsOutputSchema = z.object({
  mnemonic: z.string().describe('The catchy mnemonic device.'),
  explanation: z.string().describe('Explanation of how the mnemonic maps to the original terms.'),
});
export type MnemonicsOutput = z.infer<typeof MnemonicsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'mnemonicsPrompt',
  input: { schema: MnemonicsInputSchema },
  output: { schema: MnemonicsOutputSchema },
  prompt: `You are an expert memory coach and learning specialist. Create a catchy and effective mnemonic to help a student memorize the following information:

  TERMS/FORMULA: {{{terms}}}
  STYLE: {{{style}}}

  INSTRUCTIONS:
  1. If STYLE is "Acronym", create a word or phrase where each letter corresponds to the first letter of the terms.
  2. If STYLE is "Story", create a very short, vivid, and funny story that links all terms together.
  3. If STYLE is "Rhyme", create a short poem or rhyme.
  4. If STYLE is "Sentence", create a silly but memorable sentence where the first letter of each word matches the terms.
  5. Provide a clear "mnemonic" output and a detailed "explanation" showing the mapping.`,
});

export async function generateMnemonic(input: MnemonicsInput): Promise<MnemonicsOutput> {
  const systemPrompt = "You are a memory coach. Return a JSON object with 'mnemonic' and 'explanation' fields.";
  const userPrompt = `Style: ${input.style}\nTerms: ${input.terms}\n\nCreate a catchy mnemonic.`;

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
