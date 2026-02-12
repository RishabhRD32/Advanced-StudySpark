'use server';
/**
 * @fileOverview AI flow to generate presentation outlines with Direct Bridge Support.
 */

import { ai, googleAIPlugin, runWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const SlideSchema = z.object({
  title: z.string().describe('The title of the slide.'),
  content: z.array(z.string()).describe('Bullet points for the slide content.'),
  visualSuggestion: z.string().describe('A suggestion for what image or chart to include.'),
});

const PresentationInputSchema = z.object({
  topic: z.string().describe('The main topic of the presentation.'),
  targetAudience: z.string().describe('Who the presentation is for.'),
  slideCount: z.number().min(3).max(15).describe('How many slides to generate.'),
  provider: z.string().optional(),
  model: z.string().optional(),
});
export type PresentationInput = z.infer<typeof PresentationInputSchema>;

const PresentationOutputSchema = z.object({
  title: z.string().describe('Overall presentation title.'),
  slides: z.array(SlideSchema).describe('The sequence of slides.'),
});
export type PresentationOutput = z.infer<typeof PresentationOutputSchema>;

const prompt = ai.definePrompt({
  name: 'presentationPrompt',
  input: { schema: PresentationInputSchema },
  output: { schema: PresentationOutputSchema },
  prompt: `You are a professional presentation designer. Create a high-impact presentation outline for:

  TOPIC: {{{topic}}}
  AUDIENCE: {{{targetAudience}}}
  SLIDE COUNT: {{{slideCount}}}

  INSTRUCTIONS:
  1. Create a logical flow (Introduction, Key Points, Conclusion).
  2. For each slide, provide a concise title and 3-5 bullet points.
  3. Include visual suggestions.`,
});

export async function generatePresentation(input: PresentationInput): Promise<PresentationOutput> {
  const systemPrompt = "You are a professional presentation designer. Return a JSON object with 'title' and 'slides' (array of {title, content[], visualSuggestion}).";
  const userPrompt = `Topic: ${input.topic}\nAudience: ${input.targetAudience}\nSlide Count: ${input.slideCount}\n\nGenerate slide content.`;

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
