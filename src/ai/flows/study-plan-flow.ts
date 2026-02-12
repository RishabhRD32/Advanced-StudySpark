'use server';
/**
 * @fileOverview An AI flow to generate a personalized study plan using Gemini 2.0 Flash.
 */

import { ai, googleAIPlugin } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStudyPlanInputSchema = z.object({
    subjectTitles: z.array(z.string()).describe("The titles of the subjects."),
    weeklyHours: z.number().describe("Total study hours."),
    deadlines: z.string().optional().describe("Deadlines/Exams."),
});
export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const StudySessionSchema = z.object({
    subjectTitle: z.string(),
    day: z.string(),
    time: z.string(),
    topic: z.string(),
    description: z.string(),
});

const GenerateStudyPlanOutputSchema = z.object({
    plan: z.array(StudySessionSchema).describe("Weekly study plan."),
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

export async function generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanOutput> {
    return generateStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateStudyPlanPrompt',
    model: googleAIPlugin.model('gemini-2.0-flash'),
    input: { schema: GenerateStudyPlanInputSchema },
    output: { schema: GenerateStudyPlanOutputSchema },
    prompt: `You are an expert academic advisor. Create a personalized weekly study plan.

    **Student's Information:**
    - Subjects: {{{json subjectTitles}}}
    - Total Weekly Hours: {{{weeklyHours}}}
    - Deadlines: {{{deadlines}}}

    **Your Task:**
    1. Distribute hours intelligently across subjects.
    2. Break down into actionable sessions.
    3. Assign days and realistic times.`,
});

const generateStudyPlanFlow = ai.defineFlow(
    {
        name: 'generateStudyPlanFlow',
        inputSchema: GenerateStudyPlanInputSchema,
        outputSchema: GenerateStudyPlanOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
