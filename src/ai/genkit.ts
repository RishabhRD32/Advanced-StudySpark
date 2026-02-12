import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Initialize the Google AI plugin instance.
 */
export const googleAIPlugin = googleAI();

/**
 * Global Genkit instance.
 */
export const ai = genkit({
  plugins: [googleAIPlugin],
});

/**
 * Provider Endpoints for Direct API Access.
 */
const PROVIDER_URLS: Record<string, string> = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  cerebras: 'https://api.cerebras.ai/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
};

/**
 * Utility to clean markdown-wrapped JSON from LLM responses.
 */
function cleanJson(text: string): string {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

/**
 * Direct fetch call to OpenAI-compatible providers.
 */
async function callDirectAi(provider: string, model: string, systemPrompt: string, userPrompt: string) {
  const url = PROVIDER_URLS[provider];
  if (!url) throw new Error(`Unknown provider: ${provider}`);

  const keyName = `${provider.toUpperCase()}_API_KEY`;
  const key = process.env[keyName];

  if (!key) {
    throw new Error(`API Key for ${provider} (${keyName}) is missing. Check your .env file.`);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    let message = `API call to ${provider} failed (${response.status}).`;
    try {
      const errData = await response.json();
      message = errData.error?.message || message;
    } catch (e) {}
    throw new Error(message);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Resilient wrapper to handle "429 Too Many Requests" and Provider Switching.
 */
export async function runWithFallback<I, O>(
  action: (input: I, options?: any) => Promise<{ output: O | null }>,
  input: I,
  options: { 
    provider?: string; 
    model?: string; 
    systemPrompt?: string; 
    userPrompt?: string;
  } = {}
): Promise<O> {
  const selectedProvider = options.provider || 'google';
  const selectedModel = options.model || 'gemini-1.5-flash';

  try {
    if (selectedProvider === 'google') {
      // Use standard namespaced model string for Genkit 1.x
      const modelId = selectedModel.includes('/') ? selectedModel : `googleai/${selectedModel}`;
      const response = await action(input, { model: modelId });
      if (!response.output) throw new Error('Provider returned empty output.');
      return response.output;
    }

    if (options.systemPrompt && options.userPrompt) {
      const directText = await callDirectAi(selectedProvider, selectedModel, options.systemPrompt, options.userPrompt);
      
      // Try to parse structured output
      try {
        const cleaned = cleanJson(directText);
        if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
          return JSON.parse(cleaned) as O;
        }
      } catch (e) {}

      // UNIVERSAL FALLBACK: Ensure all possible array/string keys exist to prevent UI crashes
      return { 
        answer: directText, 
        summary: directText, 
        humanizedText: directText,
        mnemonic: directText,
        explanation: 'Logic processed via direct bridge.',
        content: directText,
        title: 'AI Generated Response',
        analysis: directText,
        solution: directText,
        professionalSummary: directText,
        definition: directText,
        translation: 'AI Translation',
        // Structured array fallbacks (prevent .map() on undefined)
        coreSkills: [],
        academicHighlights: [],
        projectShowcase: [],
        sections: [{ title: "Overview", content: directText }],
        references: ["Academic Study"],
        suggestedCareers: [{ title: "Strategic Path", description: directText, milestones: ["Research"] }],
        cards: [{ front: "Inquiry", back: directText }],
        questions: [{ questionText: "Contextual check", options: ["A","B","C","D"], correctAnswerIndex: 0, explanation: directText }],
        slides: [{ title: "Key Concepts", content: [directText], visualSuggestion: "Relevant diagram" }],
        steps: [directText],
        keyConcepts: ["Science", "Logic"],
        objectives: ["Analyze core concepts"],
        materialsNeeded: ["Notes"],
        schedule: [{ time: "0-10m", activity: "Introduction", description: directText }],
        assessment: "Reflective discussion",
        examples: [],
        synonyms: [],
        antonyms: [],
        wordForms: []
      } as unknown as O;
    }

    throw new Error(`Provider ${selectedProvider} requires prompt parameters for direct bridge.`);

  } catch (error: any) {
    const errorMessage = error?.message || '';
    const isRateLimit = errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('503');

    if (isRateLimit && selectedProvider === 'google') {
      try {
        if (options.systemPrompt && options.userPrompt) {
          // Emergency rescue via high-speed secondary bridge
          const rescueText = await callDirectAi('groq', 'llama-3.3-70b-versatile', options.systemPrompt, options.userPrompt);
          
          try {
            const cleaned = cleanJson(rescueText);
            if (cleaned.startsWith('{')) return JSON.parse(cleaned) as O;
          } catch (e) {}

          return { 
            answer: rescueText, 
            summary: rescueText, 
            humanizedText: rescueText,
            mnemonic: rescueText,
            content: rescueText,
            analysis: rescueText,
            solution: rescueText,
            definition: rescueText,
            sections: [{ title: "Summary", content: rescueText }],
            references: ["Rescue Link"],
            suggestedCareers: [],
            cards: [],
            questions: [],
            slides: [],
            steps: [],
            keyConcepts: [],
            objectives: ["Analyze concepts"],
            materialsNeeded: ["Textbook"],
            schedule: [{ time: "0-10m", activity: "Overview", description: rescueText }],
            assessment: "Evaluation"
          } as unknown as O;
        }
      } catch (rescueError) {}
    }
    throw error;
  }
}

/**
 * Helper to retrieve a model reference string for Genkit.
 */
export function getCloudModel(provider: string = 'google', modelId: string = 'gemini-1.5-flash') {
  if (provider === 'google') return `googleai/${modelId}`;
  return `googleai/gemini-1.5-flash`;
}
