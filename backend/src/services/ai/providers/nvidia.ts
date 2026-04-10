import axios from 'axios';
import type { AIProvider, Message } from '../types';
import { createServiceLogger } from '../../../config/logger';

const log = createServiceLogger('nvidia-provider');

// Supported NVIDIA models
export const SUPPORTED_NVIDIA_MODELS = [
  'mistralai/mistral-small-3.1-24b-instruct-2503',
  'microsoft/phi-3.5-mini-instruct',
  'google/gemma-2-27b-it',
  'google/gemma-2-2b-it',
  'deepseek-ai/deepseek-r1-distill-qwen-7b',
  'ai21labs/jamba-1.5-mini-instruct'
] as const;

export type SupportedNvidiaModel = typeof SUPPORTED_NVIDIA_MODELS[number];

// Safety guardrail models
export const SAFETY_MODELS = [
  'ibm/granite-guardian-3.0-8b',
  'google/shieldgemma-9b',
  'meta/llama-guard-4-12b'
] as const;

export type SafetyModel = typeof SAFETY_MODELS[number];

export interface NvidiaProviderOptions {
  apiKey: string;
  model?: SupportedNvidiaModel;
}

export function createNvidiaProvider(options: NvidiaProviderOptions): AIProvider {
  const { apiKey, model = 'mistralai/mistral-small-3.1-24b-instruct-2503' } = options;
  const apiBaseURL = 'https://integrate.api.nvidia.com/v1/chat/completions';

  const toOpenAIMessages = (history: Message[]) => {
    const msgs: Array<{ role: string; content: string }> = [];
    for (const m of history || []) {
      if (m.role === 'user') msgs.push({ role: 'user', content: m.content });
      else if (m.role === 'assistant') msgs.push({ role: 'assistant', content: m.content });
      else if (m.role === 'system') msgs.push({ role: 'system', content: m.content });
    }
    return msgs;
  };

  return {
    async generateResponse(prompt: string, history?: Message[], systemPrompt?: string, model?: string): Promise<string> {
      const selectedModel = model && SUPPORTED_NVIDIA_MODELS.includes(model as SupportedNvidiaModel) 
        ? model as SupportedNvidiaModel 
        : (model as SupportedNvidiaModel) || options.model;
      
      const messages: Array<{ role: string; content: string }> = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      messages.push(...toOpenAIMessages(history || []));
      messages.push({ role: 'user', content: prompt });

      try {
        const response = await axios.post(
          apiBaseURL,
          {
            model: selectedModel,
            messages,
            max_tokens: 1024,
            temperature: 0.2,
            top_p: 0.7,
            stream: false,
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return response.data.choices[0]?.message?.content || '';
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
          throw new Error(errorMsg || 'NVIDIA API request failed');
        }
        throw error;
      }
    },

    async generateContent(prompt: string, options?: { maxTokens?: number, model?: string }): Promise<string> {
      const selectedModel = options?.model || model;
      
      log.info({ model: selectedModel, apiBaseURL, apiKeyLength: apiKey.length }, 'NVIDIA API call');
      
      try {
        const response = await axios.post(
          apiBaseURL,
          {
            model: selectedModel,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options?.maxTokens ?? 1024,
            temperature: 0.2,
            top_p: 0.7,
            stream: false,
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        log.info({ status: response.status, hasChoices: !!response.data.choices }, 'NVIDIA API success');
        return response.data.choices[0]?.message?.content || '';
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
          const status = error.response?.status;
          const responseData = error.response?.data;
          log.error({ status, errorMsg, responseData }, 'NVIDIA API error');
          throw new Error(errorMsg || 'NVIDIA API request failed');
        }
        throw error;
      }
    },
  };
}

// Safety guardrail provider
export function createSafetyProvider(apiKey: string, model: SafetyModel): {
  checkSafety(content: string, context?: string): Promise<{ safe: boolean; reason?: string }>;
} {
  const apiBaseURL = 'https://integrate.api.nvidia.com/v1/chat/completions';
  
  return {
    async checkSafety(content: string, context?: string): Promise<{ safe: boolean; reason?: string }> {
      const messages: Array<{ role: string; content: string }> = [
        { role: 'user', content: content }
      ];
      
      if (context) {
        messages.push({ role: 'assistant', content: context });
      }

      const response = await axios.post(
        apiBaseURL,
        {
          model,
          messages,
          max_tokens: 100,
          temperature: 0.1,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data.choices[0]?.message?.content || '';
      
      // Parse safety result (implementation depends on model output format)
      const isSafe = !result.toLowerCase().includes('unsafe') && 
                     !result.toLowerCase().includes('harmful') &&
                     !result.toLowerCase().includes('violent');
      
      return {
        safe: isSafe,
        reason: isSafe ? undefined : result
      };
    },
  };
}
