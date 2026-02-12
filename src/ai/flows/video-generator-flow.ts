
'use server';
/**
 * @fileOverview AI video generation flow using Veo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VideoGeneratorInputSchema = z.object({
  promptText: z.string().describe('The topic or description of the educational video to generate.'),
});
export type VideoGeneratorInput = z.infer<typeof VideoGeneratorInputSchema>;

const VideoGeneratorOutputSchema = z.object({
  videoUrl: z.string().describe('The data URI of the generated video.'),
});
export type VideoGeneratorOutput = z.infer<typeof VideoGeneratorOutputSchema>;

export async function generateEducationalVideo(input: VideoGeneratorInput): Promise<VideoGeneratorOutput> {
  return videoFlow(input);
}

const videoFlow = ai.defineFlow(
  {
    name: 'videoFlow',
    inputSchema: VideoGeneratorInputSchema,
    outputSchema: VideoGeneratorOutputSchema,
  },
  async (input) => {
    let { operation } = await ai.generate({
      model: 'googleai/veo-2.0-generate-001',
      prompt: `Create a professional educational video about: ${input.promptText}. Keep it informative and visually clear for students.`,
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Video service unavailable');
    }

    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('Video generation failed: ' + operation.error.message);
    }

    const videoPart = operation.output?.message?.content.find((p) => !!p.media);
    if (!videoPart || !videoPart.media) {
      throw new Error('No video output generated');
    }

    // Since we need to return this to the client as a data URI for simplicity in this prototype
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${videoPart.media.url}&key=${process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY}`);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      videoUrl: `data:video/mp4;base64,${base64}`,
    };
  }
);
