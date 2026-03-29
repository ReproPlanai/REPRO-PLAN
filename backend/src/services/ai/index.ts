import { getEnv } from '../../config/env';
import { createServiceLogger } from '../../config/logger';
import { getCached, setCached } from '../cache';
import type { AIProvider, Message } from './types';
import { REHANA_SYSTEM_PROMPT } from './types';
import { createGeminiProvider } from './providers/gemini';
import { createOpenAIProvider } from './providers/openai';
import { createAnthropicProvider } from './providers/anthropic';
import { createGrokProvider } from './providers/grok';

const log = createServiceLogger('rehana');

let cachedProvider: AIProvider | null = null;

function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const env = getEnv();
  const provider = env.AI_PROVIDER;

  if (provider === 'gemini' && env.GEMINI_API_KEY) {
    cachedProvider = createGeminiProvider(env.GEMINI_API_KEY);
    log.info('Rehana using Gemini');
  } else if (provider === 'openai' && env.OPENAI_API_KEY) {
    cachedProvider = createOpenAIProvider(env.OPENAI_API_KEY);
    log.info('Rehana using OpenAI');
  } else if (provider === 'anthropic' && env.ANTHROPIC_API_KEY) {
    cachedProvider = createAnthropicProvider(env.ANTHROPIC_API_KEY);
    log.info('Rehana using Anthropic');
  } else if (provider === 'grok' && env.XAI_API_KEY) {
    cachedProvider = createGrokProvider(env.XAI_API_KEY);
    log.info('Rehana using Grok');
  } else if (env.GEMINI_API_KEY) {
    cachedProvider = createGeminiProvider(env.GEMINI_API_KEY);
    log.info('Rehana using Gemini (fallback)');
  } else {
    throw new Error('No AI provider configured. Set AI_PROVIDER and corresponding API key (e.g. GEMINI_API_KEY).');
  }

  return cachedProvider;
}

function cacheKey(prompt: string, history?: Message[]): string {
  const h = history?.map((m) => `${m.role}:${m.content}`).join('|') || '';
  return `rehana:${Buffer.from(prompt + h).toString('base64').slice(0, 64)}`;
}

export async function rehanaRespond(
  message: string,
  history?: Message[],
  options?: { useCache?: boolean }
): Promise<string> {
  const useCache = options?.useCache ?? true;

  if (useCache) {
    const cached = await getCached<string>(cacheKey(message, history));
    if (cached) {
      log.info('Rehana cache hit');
      return cached;
    }
  }

  const start = Date.now();
  const provider = getAIProvider();

  try {
    const response = await provider.generateResponse(message, history, REHANA_SYSTEM_PROMPT);
    const duration = Date.now() - start;
    log.info({ duration, provider: getEnv().AI_PROVIDER }, 'Rehana response');

    if (useCache && response) {
      await setCached(cacheKey(message, history), response, 3600);
    }

    return response;
  } catch (err) {
    log.error({ err }, 'Rehana error');
    throw err;
  }
}

export async function generateContent(prompt: string, options?: { maxTokens?: number }): Promise<string> {
  const provider = getAIProvider();
  return provider.generateContent(prompt, options);
}

export function isAIConfigured(): boolean {
  try {
    getAIProvider();
    return true;
  } catch {
    return false;
  }
}
