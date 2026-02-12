'use server';
/**
 * @fileOverview AI Flashcard generation flow with multi-provider bridge support.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const FlashcardSchema = z.object({
  front: z.string().describe('The question or term on the front of the card.'),
  back: z.string().describe('The answer or definition on the back of the card.'),
});

const FlashcardGeneratorInputSchema = z.object({
  text: z.string().describe('The source text to generate flashcards from.'),
  count: z.number().min(1).max(10).describe('Number of flashcards to create.'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type FlashcardGeneratorInput = z.infer<typeof FlashcardGeneratorInputSchema>;

const FlashcardGeneratorOutputSchema = z.object({
  cards: z.array(FlashcardSchema).describe('The generated flashcards.'),
});
export type FlashcardGeneratorOutput = z.infer<typeof FlashcardGeneratorOutputSchema>;

const prompt = ai.definePrompt({
  name: 'flashcardPrompt',
  input: { schema: FlashcardGeneratorInputSchema },
  output: { schema: FlashcardGeneratorOutputSchema },
  prompt: `You are an expert study assistant. Create {{{count}}} effective study flashcards from the following text. 
  Ensure questions are clear and answers are concise but comprehensive.

  Source Material:
  {{{text}}}`,
});

export async function generateFlashcards(input: FlashcardGeneratorInput): Promise<FlashcardGeneratorOutput> {
  const systemPrompt = "You are a professional study assistant. Generate effective study flashcards. Return a valid JSON object with a 'cards' array containing objects with 'front' and 'back' fields.";
  const userPrompt = `Create ${input.count} flashcards from this text: ${input.text}`;

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
