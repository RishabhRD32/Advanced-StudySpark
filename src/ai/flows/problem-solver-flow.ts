'use server';
/**
 * @fileOverview A multimodal AI Problem Solver with multi-provider bridge support.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const ProblemSolverInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the problem, as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The textual description or transcription of the problem.'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type ProblemSolverInput = z.infer<typeof ProblemSolverInputSchema>;

const ProblemSolverOutputSchema = z.object({
  solution: z.string().describe('The final answer or result.'),
  steps: z.array(z.string()).describe('Step-by-step breakdown of the logic.'),
  keyConcepts: z.array(z.string()).describe('Academic concepts utilized in the solution.'),
});
export type ProblemSolverOutput = z.infer<typeof ProblemSolverOutputSchema>;

const prompt = ai.definePrompt({
  name: 'problemSolverPrompt',
  input: { schema: ProblemSolverInputSchema },
  output: { schema: ProblemSolverOutputSchema },
  prompt: `You are an elite academic problem solver. Your goal is to provide a high-precision solution to the following problem.

  INSTRUCTIONS:
  1. Analyze the problem carefully. 
  2. If an image is provided, use it as the primary source of context.
  3. Break down the solution into logical, tactical steps.
  4. Identify the core academic concepts involved.

  Problem Description: {{{description}}}
  {{#if photoDataUri}}Problem Image: {{media url=photoDataUri}}{{/if}}`,
});

export async function solveProblem(input: ProblemSolverInput): Promise<ProblemSolverOutput> {
  const systemPrompt = "You are an elite academic problem solver. Return a JSON object with 'solution', 'steps' (array), and 'keyConcepts' (array).";
  const userPrompt = `Solve this problem: ${input.description}`;

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
