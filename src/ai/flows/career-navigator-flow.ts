'use server';
/**
 * @fileOverview AI Career Navigator using Gemini 2.0 Flash with Direct Bridge Support.
 */

import { ai, googleAIPlugin, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const CareerNavigatorInputSchema = z.object({
  subjects: z.array(z.string()).describe('List of subjects the student is currently taking.'),
  interests: z.string().describe('A list of hobbies or things the student enjoys.'),
  goal: z.string().optional().describe('An optional long-term dream or goal.'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type CareerNavigatorInput = z.infer<typeof CareerNavigatorInputSchema>;

const CareerPathSchema = z.object({
  title: z.string().describe('Name of the career path.'),
  description: z.string().describe('What this career entails.'),
  milestones: z.array(z.string()).describe('Key academic or professional steps to reach this career.'),
});

const CareerNavigatorOutputSchema = z.object({
  analysis: z.string().describe('A summary of how the student\'s interests align with their subjects.'),
  suggestedCareers: z.array(CareerPathSchema).describe('The most suitable career paths.'),
});
export type CareerNavigatorOutput = z.infer<typeof CareerNavigatorOutputSchema>;

const prompt = ai.definePrompt({
  name: 'careerNavigatorPrompt',
  input: { schema: CareerNavigatorInputSchema },
  output: { schema: CareerNavigatorOutputSchema },
  prompt: `You are an elite academic and career advisor. Analyze the student's data to map out a professional roadmap.

  SUBJECTS: {{{json subjects}}}
  INTERESTS: {{{interests}}}
  {{#if goal}}GOAL: {{{goal}}}{{/if}}

  INSTRUCTIONS:
  1. Provide a "Strategy Analysis" explaining how their current studies relate to their personal interests.
  2. Suggest 3 high-impact career paths.
  3. For each path, list 4 critical milestones (e.g., Certifications, Degree focus, Internships).`,
});

export async function navigateCareer(input: CareerNavigatorInput): Promise<CareerNavigatorOutput> {
  const systemPrompt = "You are an elite academic and career advisor. Return a valid JSON object matching the requested schema with 'analysis' and 'suggestedCareers' (array of {title, description, milestones[]}).";
  const userPrompt = `Subjects: ${input.subjects.join(', ')}\nInterests: ${input.interests}\nGoal: ${input.goal || 'None'}\n\nAnalyze and suggest career paths.`;

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
