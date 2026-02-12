'use server';

/**
 * @fileOverview An AI tutor assistance flow that answers questions about course material.
 * Includes automatic 429 fallback and multi-provider bridge support.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const AiTutorAssistanceInputSchema = z.object({
  question: z.string().describe('The question about the course material.'),
  courseMaterial: z.string().optional().describe('Optional course material to provide context for the answer.'),
  provider: z.string().optional().describe('The AI provider to use.'),
  model: z.string().optional().describe('The model to use for generation.'),
});
export type AiTutorAssistanceInput = z.infer<typeof AiTutorAssistanceInputSchema>;

const AiTutorAssistanceOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AiTutorAssistanceOutput = z.infer<typeof AiTutorAssistanceOutputSchema>;

const tutorPrompt = ai.definePrompt({
  name: 'tutorPrompt',
  input: { schema: AiTutorAssistanceInputSchema },
  output: { schema: AiTutorAssistanceOutputSchema },
  prompt: `You are an elite AI Tutor. Your goal is to provide a comprehensive and accurate answer to the student's question.

    {{#if courseMaterial}}
    PRIMARY CONTEXT (User Notes):
    {{{courseMaterial}}}
    ---
    INSTRUCTIONS: Use the notes above as your primary anchor.
    {{/if}}

    Question: {{{question}}}`,
});

export async function aiTutorAssistance(input: AiTutorAssistanceInput): Promise<AiTutorAssistanceOutput> {
  const systemPrompt = "You are an elite AI Tutor. Provide accurate, helpful, and deeply reasoned academic explanations.";
  const userPrompt = input.courseMaterial 
    ? `Context: ${input.courseMaterial}\n\nQuestion: ${input.question}` 
    : `Question: ${input.question}`;

  return runWithFallback(
    async (i, opts) => await tutorPrompt(i, { model: opts?.model }),
    input,
    {
      provider: input.provider,
      model: input.model,
      systemPrompt,
      userPrompt
    }
  );
}
