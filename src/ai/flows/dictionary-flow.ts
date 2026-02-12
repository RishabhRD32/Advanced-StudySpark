'use server';
/**
 * @fileOverview AI Multilingual Dictionary flow using Gemini 1.5 Flash.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const WordFormSchema = z.object({
  form: z.string().describe('The variation of the word (e.g., past tense, plural, etc.).'),
  meaning: z.string().describe('The specific meaning of this form.'),
});

const DictionaryInputSchema = z.object({
  word: z.string().describe('The word or phrase to look up.'),
  targetLanguage: z.string().describe('Language to translate to.'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type DictionaryInput = z.infer<typeof DictionaryInputSchema>;

const DictionaryOutputSchema = z.object({
  originalWord: z.string(),
  translation: z.string(),
  pronunciation: z.string().optional(),
  definition: z.string(),
  partOfSpeech: z.string(),
  examples: z.array(z.string()).describe('3 Sentence examples in target language.'),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()).describe('3-5 Words with opposite meanings.'),
  wordForms: z.array(WordFormSchema).describe('Different forms of the word like tenses or plurals.'),
});
export type DictionaryOutput = z.infer<typeof DictionaryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'dictionaryPrompt',
  input: { schema: DictionaryInputSchema },
  output: { schema: DictionaryOutputSchema },
  prompt: `You are a master lexicographer. Provide a detailed dictionary entry for:
  WORD: {{{word}}}
  TARGET LANGUAGE: {{{targetLanguage}}}

  Instructions:
  1. Provide translation and a clear definition in the target language.
  2. Include part of speech, pronunciation, and 3 usage examples.
  3. List 3-5 synonyms and 3-5 antonyms.
  4. Provide common word forms.
  5. For Indian languages, ensure the script is correct.`,
});

export async function lookupWord(input: DictionaryInput): Promise<DictionaryOutput> {
  const systemPrompt = "You are a master lexicographer. Provide accurate, structured dictionary entries.";
  const userPrompt = `Define "${input.word}" in ${input.targetLanguage}. Provide pronunciation, part of speech, definition, 3 examples, synonyms, antonyms, and word forms.`;

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
