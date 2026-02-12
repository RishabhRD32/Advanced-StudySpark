'use server';
/**
 * @fileOverview A professional lesson planning AI agent with Direct Bridge Support.
 */

import {ai, runWithFallback} from '@/ai/genkit';
import {z} from 'genkit';

const LessonPlanInputSchema = z.object({
  topic: z.string().describe('The subject or topic of the lesson.'),
  gradeLevel: z.string().describe('The grade level or age group of the students.'),
  duration: z.number().min(15).max(180).describe('The duration of the lesson in minutes.'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type LessonPlanInput = z.infer<typeof LessonPlanInputSchema>;

const LessonPlanOutputSchema = z.object({
  title: z.string().describe('Catchy title for the lesson.'),
  objectives: z.array(z.string()).describe('List of learning goals.'),
  materialsNeeded: z.array(z.string()).describe('Resources required.'),
  schedule: z.array(z.object({
    time: z.string().describe('Time slot, e.g., "0-10 mins"'),
    activity: z.string().describe('Name of the activity.'),
    description: z.string().describe('Detailed instruction for the activity.')
  })).describe('Step-by-step breakdown of the lesson.'),
  assessment: z.string().describe('How to evaluate student understanding.'),
});
export type LessonPlanOutput = z.infer<typeof LessonPlanOutputSchema>;

const prompt = ai.definePrompt({
  name: 'lessonPlanPrompt',
  input: {schema: LessonPlanInputSchema},
  output: {schema: LessonPlanOutputSchema},
  prompt: `You are an elite academic curriculum designer. Your goal is to create a high-impact, engaging lesson plan based on the following parameters:

  TOPIC: {{{topic}}}
  GRADE LEVEL: {{{gradeLevel}}}
  DURATION: {{{duration}}} minutes

  INSTRUCTIONS:
  1. Define 3-5 clear, measurable learning objectives.
  2. Provide a list of necessary materials.
  3. Create a timed schedule that maximizes student engagement.
  4. Include a robust assessment strategy.
  5. Use professional, encouraging, and clear pedagogical language.`,
});

export async function generateLessonPlan(input: LessonPlanInput): Promise<LessonPlanOutput> {
  const systemPrompt = "You are an elite academic curriculum designer. Return a JSON object with 'title', 'objectives' (array), 'materialsNeeded' (array), 'schedule' (array of {time, activity, description}), and 'assessment' (string).";
  const userPrompt = `Topic: ${input.topic}\nGrade: ${input.gradeLevel}\nDuration: ${input.duration} mins\n\nGenerate lesson plan.`;

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
