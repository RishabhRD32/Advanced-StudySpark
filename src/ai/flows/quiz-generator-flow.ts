'use server';
/**
 * @fileOverview An AI flow to generate a quiz with multi-provider bridge support.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
    questionText: z.string().describe("The text of the quiz question."),
    options: z.array(z.string()).length(4).describe("An array of exactly four possible answers."),
    correctAnswerIndex: z.number().min(0).max(3).describe("The index (0-3) of the correct answer."),
    explanation: z.string().describe("Brief explanation.")
});

const GenerateQuizInputSchema = z.object({
    sourceText: z.string().describe("The source material."),
    numQuestions: z.number().min(1).max(10).describe("The number of questions."),
    provider: z.string().optional(),
    model: z.string().optional(),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
    questions: z.array(QuestionSchema).describe("The array of generated quiz questions."),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

const prompt = ai.definePrompt({
    name: 'generateQuizPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `You are a helpful assistant that creates educational quizzes. Based on the provided source text, generate a multiple-choice quiz.

    **Instructions:**
    1. Create exactly {{{numQuestions}}} questions.
    2. Each question must have exactly four options.
    3. Provide the correct index (0-3) and a brief explanation.

    **Source Text:**
    ---
    {{{sourceText}}}
    ---
    `,
});

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
    const systemPrompt = "You are an educational quiz generator. Return ONLY a valid JSON object matching the requested schema.";
    const userPrompt = `Generate a ${input.numQuestions}-question multiple choice quiz based on this text: ${input.sourceText}`;

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
