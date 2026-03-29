import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, Message } from '../types';
import { REHANA_SYSTEM_PROMPT } from '../types';

export function createAnthropicProvider(apiKey: string): AIProvider {
  const client = new Anthropic({ apiKey });

  const toAnthropicMessages = (history: Message[], systemPrompt?: string): Anthropic.MessageParam[] => {
    const msgs: Anthropic.MessageParam[] = [];
    for (const m of history || []) {
      if (m.role === 'user') msgs.push({ role: 'user', content: m.content });
      else if (m.role === 'assistant') msgs.push({ role: 'assistant', content: m.content });
    }
    return msgs;
  };

  return {
    async generateResponse(prompt: string, history?: Message[], systemPrompt?: string): Promise<string> {
      const messages = toAnthropicMessages(history || [], systemPrompt);
      messages.push({ role: 'user', content: prompt });

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt || REHANA_SYSTEM_PROMPT,
        messages,
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      return textBlock && 'text' in textBlock ? textBlock.text : '';
    },

    async generateContent(prompt: string, options?: { maxTokens?: number }): Promise<string> {
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens ?? 1024,
        messages: [{ role: 'user', content: prompt }],
      });
      const textBlock = response.content.find((b) => b.type === 'text');
      return textBlock && 'text' in textBlock ? textBlock.text : '';
    },
  };
}
