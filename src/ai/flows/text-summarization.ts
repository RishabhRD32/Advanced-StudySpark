'use server';

/**
 * @fileOverview A text summarization AI agent with multi-provider bridge support.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeTextInputSchema = z.object({
  text: z.string().describe('The text to summarize.'),
  provider: z.string().optional().describe('The AI provider to use.'),
  model: z.string().optional().describe('The model to use for generation.'),
});
export type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

const SummarizeTextOutputSchema = z.object({
  summary: z.string().describe('The summarized text.'),
});
export type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

const summarizerPrompt = ai.definePrompt({
  name: 'summarizerPrompt',
  input: { schema: SummarizeTextInputSchema },
  output: { schema: SummarizeTextOutputSchema },
  prompt: `Summarize the following text briefly and clearly for a student. Remove fluff while preserving critical academic facts:

    {{{text}}}`,
});

export async function summarizeText(input: SummarizeTextInput): Promise<SummarizeTextOutput> {
  const systemPrompt = "You are an expert academic summarizer. Distill the following text into key takeaways.";
  const userPrompt = `Summarize this text: ${input.text}`;

  return runWithFallback(
    async (i, opts) => await summarizerPrompt(i, { model: opts?.model }),
    input,
    {
      provider: input.provider,
      model: input.model,
      systemPrompt,
      userPrompt
    }
  );
}
