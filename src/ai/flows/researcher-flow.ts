'use server';
/**
 * @fileOverview AI Researcher flow for deep-dive information retrieval.
 * Includes automatic 429 fallback and multi-provider bridge support.
 */

import { ai, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const ResearcherInputSchema = z.object({
  topic: z.string().describe('The academic or general topic to research.'),
  depth: z.enum(['concise', 'detailed', 'encyclopedic']).default('detailed'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type ResearcherInput = z.infer<typeof ResearcherInputSchema>;

const SectionSchema = z.object({
  title: z.string().describe('The heading of the research section.'),
  content: z.string().describe('The factual analysis for this section.'),
});

const ResearcherOutputSchema = z.object({
  title: z.string().describe('The final research paper title.'),
  sections: z.array(SectionSchema).describe('Structured information sections.'),
  references: z.array(z.string()).describe('Suggested academic sources or references.'),
});
export type ResearcherOutput = z.infer<typeof ResearcherOutputSchema>;

const prompt = ai.definePrompt({
  name: 'researcherPrompt',
  input: { schema: ResearcherInputSchema },
  output: { schema: ResearcherOutputSchema },
  prompt: `You are an elite academic researcher and encyclopedia editor. 
  Generate a comprehensive research report on the topic: {{{topic}}}.
  
  DEPTH: {{{depth}}}

  INSTRUCTIONS:
  1. Provide a formal Title.
  2. Create structured sections covering: Overview, Historical Context, Core Principles/Key Facts, and Modern Significance.
  3. Use detailed, factual, and neutral academic language.
  4. Include a list of 3-5 high-quality reference types or source suggestions.
  5. Format the content for clarity and readability.`,
});

export async function researchTopic(input: ResearcherInput): Promise<ResearcherOutput> {
  const systemPrompt = "You are an elite academic researcher. Return a JSON object with 'title', 'sections' (array of {title, content}), and 'references' (array).";
  const userPrompt = `Topic: ${input.topic}\nDepth: ${input.depth}\n\nGenerate a structured research report.`;

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
