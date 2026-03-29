import { GoogleGenAI } from '@google/genai';
import type { AIProvider, Message } from '../types';

export function createGeminiProvider(apiKey: string): AIProvider {
  const ai = new GoogleGenAI({ apiKey });

  return {
    async generateResponse(prompt: string, history?: Message[], systemPrompt?: string): Promise<string> {
      const parts: string[] = [];
      if (systemPrompt) parts.push(`[System: ${systemPrompt}]\n\n`);
      if (history?.length) {
        for (const m of history) {
          parts.push(`${m.role === 'user' ? 'User' : 'Rehana'}: ${m.content}\n\n`);
        }
      }
      parts.push(`User: ${prompt}\n\nRehana:`);

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: parts.join(''),
      });
      return response.text ?? '';
    },

    async generateContent(prompt: string, options?: { maxTokens?: number }): Promise<string> {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: options?.maxTokens ? { maxOutputTokens: options.maxTokens } : undefined,
      });
      return response.text ?? '';
    },
  };
}
