'use server';
/**
 * @fileOverview AI Code Mentor flow with multi-provider bridge support.
 * 
 * - mentorCode: Main function to analyze and optimize code snippets.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const CodeMentorInputSchema = z.object({
  codeSnippet: z.string().describe('The code to analyze or debug.'),
  language: z.string().describe('The programming language used.'),
  query: z.string().describe('What the student needs help with regarding this code.'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type CodeMentorInput = z.infer<typeof CodeMentorInputSchema>;

const CodeMentorOutputSchema = z.object({
  explanation: z.string().describe('Logic explanation of what the code does or the fix.'),
  optimizedCode: z.string().describe('The improved or fixed code snippet.'),
  tips: z.array(z.string()).describe('Pro-tips for better coding in this language.'),
});
export type CodeMentorOutput = z.infer<typeof CodeMentorOutputSchema>;

const prompt = ai.definePrompt({
  name: 'codeMentorPrompt',
  input: { schema: CodeMentorInputSchema },
  output: { schema: CodeMentorOutputSchema },
  prompt: `You are a Senior Software Engineer and Mentor. A student is struggling with the following code in {{{language}}}.

  STUDENT QUERY: {{{query}}}
  CODE SNIPPET:
  \`\`\`{{{language}}}
  {{{codeSnippet}}}
  \`\`\`

  TASK:
  1. Explain the logic or identify the bug clearly.
  2. Provide a clean, optimized, and commented version of the code.
  3. Suggest 3 pro-level tips related to this specific coding pattern.`,
});

/**
 * Mentors a code snippet using the primary provider with automatic fallback.
 */
export async function mentorCode(input: CodeMentorInput): Promise<CodeMentorOutput> {
  const systemPrompt = "You are a Senior Software Engineer and Mentor. Provide a detailed logic explanation, optimized code, and 3 pro-tips. Return a valid JSON object matching the requested schema.";
  const userPrompt = `Mentor this ${input.language} code.\n\nQuery: ${input.query}\n\nSnippet:\n${input.codeSnippet}`;

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
