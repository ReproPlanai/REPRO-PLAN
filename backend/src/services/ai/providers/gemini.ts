import { GoogleGenAI } from '@google/genai';
import type { AIProvider, Message } from '../types';

// Supported Gemini models
export const SUPPORTED_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
] as const;

export type SupportedModel = typeof SUPPORTED_MODELS[number];

export function createGeminiProvider(apiKey: string): AIProvider {
  const ai = new GoogleGenAI({});
  const defaultModel: SupportedModel = 'gemini-3-flash-preview';

  return {
    async generateResponse(prompt: string, history?: Message[], systemPrompt?: string, model?: string): Promise<string> {
      const selectedModel = model && SUPPORTED_MODELS.includes(model as SupportedModel) ? model as SupportedModel : defaultModel;
      
      const parts: string[] = [];
      if (systemPrompt) parts.push(`[System: ${systemPrompt}]\n\n`);
      if (history?.length) {
        for (const m of history) {
          parts.push(`${m.role === 'user' ? 'User' : 'ReproBot'}: ${m.content}\n\n`);
        }
      }
      parts.push(`User: ${prompt}\n\nReproBot:`);

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: parts.join(''),
      });
      return response.text ?? '';
    },

    async generateContent(prompt: string, options?: { maxTokens?: number, model?: string }): Promise<string> {
      const selectedModel = options?.model && SUPPORTED_MODELS.includes(options.model as SupportedModel) 
        ? options.model as SupportedModel 
        : defaultModel;

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: options?.maxTokens ? { maxOutputTokens: options.maxTokens } : undefined,
      });
      return response.text ?? '';
    },
  };
}
