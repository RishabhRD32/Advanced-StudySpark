'use server';
/**
 * @fileOverview AI Audio Notes flow for converting study text to speech using Gemini 2.5 Flash Preview TTS.
 */

import { ai, googleAIPlugin } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const AudioNotesInputSchema = z.object({
  text: z.string().describe('The study material text to convert to audio.'),
});
export type AudioNotesInput = z.infer<typeof AudioNotesInputSchema>;

const AudioNotesOutputSchema = z.object({
  audioUrl: z.string().describe('The data URI of the generated audio (WAV).'),
});
export type AudioNotesOutput = z.infer<typeof AudioNotesOutputSchema>;

export async function generateAudioStudyNotes(input: AudioNotesInput): Promise<AudioNotesOutput> {
  return audioNotesFlow(input);
}

const audioNotesFlow = ai.defineFlow(
  {
    name: 'audioNotesFlow',
    inputSchema: AudioNotesInputSchema,
    outputSchema: AudioNotesOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAIPlugin.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: `Read the following study material clearly for a student: ${input.text}`,
    });

    if (!media) throw new Error('Audio generation failed. Ensure your API key has audio permissions.');

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await new Promise<string>((resolve, reject) => {
      const writer = new wav.Writer({
        channels: 1,
        sampleRate: 24000,
        bitDepth: 16,
      });

      let bufs: any[] = [];
      writer.on('error', reject);
      writer.on('data', (d) => bufs.push(d));
      writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

      writer.write(audioBuffer);
      writer.end();
    });

    return {
      audioUrl: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
