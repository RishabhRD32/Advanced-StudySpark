'use server';
/**
 * @fileOverview AI Portfolio Builder flow with multi-provider bridge support.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const AchievementSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const PortfolioInputSchema = z.object({
  subjects: z.array(z.string()).describe('List of subjects taken.'),
  achievements: z.array(AchievementSchema).describe('Completed assignments or projects.'),
  targetRole: z.string().optional().describe('Internship or role being applied for.'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type PortfolioInput = z.infer<typeof PortfolioInputSchema>;

const PortfolioOutputSchema = z.object({
  professionalSummary: z.string().describe('A 2-3 sentence hook for an application.'),
  coreSkills: z.array(z.string()).describe('Extracted technical and soft skills.'),
  academicHighlights: z.array(z.object({
    subject: z.string(),
    impact: z.string().describe('How this subject adds value to a portfolio.'),
  })),
  projectShowcase: z.array(z.object({
    name: z.string(),
    skillsUsed: z.string(),
    summary: z.string(),
  })),
});
export type PortfolioOutput = z.infer<typeof PortfolioOutputSchema>;

const prompt = ai.definePrompt({
  name: 'portfolioPrompt',
  input: { schema: PortfolioInputSchema },
  output: { schema: PortfolioOutputSchema },
  prompt: `You are a professional career coach. A student wants to build a portfolio for: {{#if targetRole}}{{{targetRole}}}{{else}}Internship Applications{{/if}}.

  DATA:
  - Subjects: {{{json subjects}}}
  - Academic Achievements: {{{json achievements}}}

  TASK:
  1. Write a high-impact Professional Summary.
  2. Extract core skills.
  3. Link subjects to professional value.
  4. Transform achievements into "Project Showcase" entries.`,
});

export async function buildPortfolio(input: PortfolioInput): Promise<PortfolioOutput> {
  const systemPrompt = "You are a professional career coach. Return ONLY a valid JSON object matching the requested schema.";
  const userPrompt = `Build a portfolio for role: ${input.targetRole || 'General'}. 
  Subjects: ${input.subjects.join(', ')}. 
  Achievements: ${JSON.stringify(input.achievements)}`;

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
