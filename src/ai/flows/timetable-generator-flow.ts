'use server';
/**
 * @fileOverview AI Timetable Generator using Gemini 2.0 Flash.
 * 
 * - generateTimetableSuggestion - A function that suggests a weekly schedule.
 */

import { ai, googleAIPlugin } from '@/ai/genkit';
import { z } from 'genkit';

const TimetableInputSchema = z.object({
  subjects: z.array(z.string()).describe('List of subjects to schedule.'),
  hoursPerDay: z.number().min(1).max(12).describe('Total teaching hours available per day.'),
});
export type TimetableInput = z.infer<typeof TimetableInputSchema>;

const TimetableSlotSchema = z.object({
  day: z.string(),
  time: z.string(),
  subject: z.string(),
});

const TimetableOutputSchema = z.object({
  schedule: z.array(TimetableSlotSchema).describe('The suggested weekly schedule.'),
});
export type TimetableOutput = z.infer<typeof TimetableOutputSchema>;

export async function generateTimetableSuggestion(input: TimetableInput): Promise<TimetableOutput> {
  return timetableFlow(input);
}

const prompt = ai.definePrompt({
  name: 'timetablePrompt',
  model: googleAIPlugin.model('gemini-2.0-flash'),
  input: { schema: TimetableInputSchema },
  output: { schema: TimetableOutputSchema },
  prompt: `You are an academic coordinator. Generate a balanced weekly timetable (Monday to Friday) for a teacher.
  Subjects: {{{json subjects}}}
  Available Hours Per Day: {{{hoursPerDay}}}

  Distribute subjects evenly and logically. Ensure there are breaks if possible. 
  Return a structured schedule.`,
});

const timetableFlow = ai.defineFlow(
  {
    name: 'timetableFlow',
    inputSchema: TimetableInputSchema,
    outputSchema: TimetableOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
