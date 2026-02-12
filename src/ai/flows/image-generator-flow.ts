
'use server';
/**
 * @fileOverview AI Image helper generation flow for visual aids.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImageGeneratorInputSchema = z.object({
  prompt: z.string().describe('The description of the educational diagram or visual aid to create.'),
});
export type ImageGeneratorInput = z.infer<typeof ImageGeneratorInputSchema>;

const ImageGeneratorOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type ImageGeneratorOutput = z.infer<typeof ImageGeneratorOutputSchema>;

export async function generateVisualAid(input: ImageGeneratorInput): Promise<ImageGeneratorOutput> {
  return imageAidFlow(input);
}

const imageAidFlow = ai.defineFlow(
  {
    name: 'imageAidFlow',
    inputSchema: ImageGeneratorInputSchema,
    outputSchema: ImageGeneratorOutputSchema,
  },
  async (input) => {
    // Generate the image using Imagen 3 (more widely available than Imagen 4)
    const { media } = await ai.generate({
      model: 'googleai/imagen-3.0-generate-001',
      prompt: `Create a high-quality educational illustration or diagram showing: ${input.prompt}. Ensure the style is professional, clear, and suitable for a student's study material or presentation. Use a clean background.`,
    });

    if (!media || !media.url) {
      throw new Error('No media output returned. Your API key might not have permission for image generation.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
