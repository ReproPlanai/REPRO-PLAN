import { createServiceLogger } from '../../../config/logger';
import type { AIProvider, Message } from '../types';
import { createGeminiProvider } from '../providers/gemini';
import { createAnthropicProvider } from '../providers/anthropic';
import { createNvidiaProvider, SUPPORTED_NVIDIA_MODELS } from '../providers/nvidia';
import { getEnv } from '../../../config/env';
import { withTimeout, TimeoutError } from '../../gateway/timeout';
import { withRetry, RetryError } from '../../gateway/retry';

const log = createServiceLogger('ai-fallback');

// Fallback chain: All 7 providers - try all until one succeeds (Halloween cookie knock knock model)
const FALLBACK_CHAIN: Array<'gemini' | 'anthropic' | 'nvidia-mistral' | 'nvidia-phi' | 'nvidia-gemma27b' | 'nvidia-qwen' | 'nvidia-jamba'> = ['gemini', 'anthropic', 'nvidia-mistral', 'nvidia-phi', 'nvidia-gemma27b', 'nvidia-qwen', 'nvidia-jamba'];

// Get fallback chain based on provider
// Halloween cookie knock knock model: try all doors until one gives candy
function getFallbackChain(provider: 'gemini' | 'anthropic' | 'nvidia-mistral' | 'nvidia-phi' | 'nvidia-gemma27b' | 'nvidia-qwen' | 'nvidia-jamba'): Array<'gemini' | 'anthropic' | 'nvidia-mistral' | 'nvidia-phi' | 'nvidia-gemma27b' | 'nvidia-qwen' | 'nvidia-jamba'> {
  const env = getEnv();
  
  // Build list of available providers
  const availableProviders: Array<'gemini' | 'anthropic' | 'nvidia-mistral' | 'nvidia-phi' | 'nvidia-gemma27b' | 'nvidia-qwen' | 'nvidia-jamba'> = [];
  
  if (env.GEMINI_API_KEY) availableProviders.push('gemini');
  if (env.ANTHROPIC_API_KEY) availableProviders.push('anthropic');
  if (env.NVIDIA_MISTRAL_API_KEY) availableProviders.push('nvidia-mistral');
  if (env.NVIDIA_PHI_API_KEY) availableProviders.push('nvidia-phi');
  if (env.NVIDIA_GEMMA_27B_API_KEY) availableProviders.push('nvidia-gemma27b');
  if (env.NVIDIA_QWEN_API_KEY) availableProviders.push('nvidia-qwen');
  if (env.NVIDIA_JAMBA_API_KEY) availableProviders.push('nvidia-jamba');
  
  // Start with the requested provider if available, then try all others
  if (availableProviders.includes(provider)) {
    const chain = [provider, ...availableProviders.filter(p => p !== provider)];
    return chain;
  }
  
  return availableProviders;
}

// Create provider instance
function createProvider(provider: 'gemini' | 'anthropic' | 'nvidia-mistral' | 'nvidia-phi' | 'nvidia-gemma27b' | 'nvidia-qwen' | 'nvidia-jamba'): AIProvider {
  const env = getEnv();

  if (provider === 'gemini') {
    if (!env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }
    return createGeminiProvider(env.GEMINI_API_KEY);
  }

  if (provider === 'anthropic') {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }
    return createAnthropicProvider(env.ANTHROPIC_API_KEY);
  }

  if (provider === 'nvidia-mistral') {
    if (!env.NVIDIA_MISTRAL_API_KEY) {
      throw new Error('NVIDIA Mistral API key not configured');
    }
    return createNvidiaProvider({ apiKey: env.NVIDIA_MISTRAL_API_KEY, model: 'mistralai/mistral-small-3.1-24b-instruct-2503' });
  }

  if (provider === 'nvidia-phi') {
    if (!env.NVIDIA_PHI_API_KEY) {
      throw new Error('NVIDIA Phi API key not configured');
    }
    return createNvidiaProvider({ apiKey: env.NVIDIA_PHI_API_KEY, model: 'microsoft/phi-3.5-mini-instruct' });
  }

  if (provider === 'nvidia-gemma27b') {
    if (!env.NVIDIA_GEMMA_27B_API_KEY) {
      throw new Error('NVIDIA Gemma 27B API key not configured');
    }
    return createNvidiaProvider({ apiKey: env.NVIDIA_GEMMA_27B_API_KEY, model: 'google/gemma-2-27b-it' });
  }

  if (provider === 'nvidia-qwen') {
    if (!env.NVIDIA_QWEN_API_KEY) {
      throw new Error('NVIDIA Qwen API key not configured');
    }
    return createNvidiaProvider({ apiKey: env.NVIDIA_QWEN_API_KEY, model: 'deepseek-ai/deepseek-r1-distill-qwen-7b' });
  }

  if (provider === 'nvidia-jamba') {
    if (!env.NVIDIA_JAMBA_API_KEY) {
      throw new Error('NVIDIA Jamba API key not configured');
    }
    return createNvidiaProvider({ apiKey: env.NVIDIA_JAMBA_API_KEY, model: 'ai21labs/jamba-1.5-mini-instruct' });
  }

  throw new Error(`Unknown provider: ${provider}`);
}

// Execute request with fallback chain (with timeout and retry)
// Halloween cookie knock knock model: try all doors until one gives candy
export async function executeWithFallback(
  request: {
    prompt: string;
    history?: Message[];
    systemPrompt?: string;
    model?: string;
  },
  modelPriority?: Array<'gemini' | 'anthropic' | 'nvidia-mistral' | 'nvidia-phi' | 'nvidia-gemma27b' | 'nvidia-qwen' | 'nvidia-jamba'>
): Promise<{ response: string; provider: string; attempts: number }> {
  let lastError: Error | null = null;
  let attempts = 0;
  
  // Use provided priority or default fallback chain with DEV_MODE consideration
  const priority = modelPriority || FALLBACK_CHAIN;
  const fallbackChain = getFallbackChain(priority[0]);

  // Halloween cookie knock knock: try all doors until one gives candy
  for (const provider of fallbackChain) {
    attempts++;
    try {
      log.info({ provider, attempt: attempts, totalDoors: fallbackChain.length }, `Knocking on door: ${provider}`);

      const aiProvider = createProvider(provider);

      // Wrap with timeout (10s) - no retry, just move to next door
      const response = await withTimeout(
        aiProvider.generateResponse(
          request.prompt,
          request.history,
          request.systemPrompt
        ),
        10000 // 10 second timeout
      );

      log.info({ provider, attempts, success: true }, 'Door opened - got candy!');
      return { response, provider, attempts };
    } catch (error) {
      lastError = error as Error;
      const isTimeout = error instanceof TimeoutError;
      
      log.error({ 
        provider, 
        attempt: attempts,
        error: lastError.message,
        isTimeout
      }, 'Door closed - no candy, trying next door');

      // If this is the last provider in the chain, throw the error
      if (provider === fallbackChain[fallbackChain.length - 1]) {
        log.error({ attempts, totalDoors: fallbackChain.length }, 'All doors closed - no candy anywhere');
        throw new Error(`All AI providers failed after ${attempts} attempts. Last error: ${lastError.message}`);
      }

      // Continue to next provider (next door)
      continue;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error(`Fallback chain exhausted after ${attempts} attempts`);
}

// Execute content generation with fallback (with timeout and retry)
// Halloween cookie knock knock model: try all doors until one gives candy
export async function executeContentWithFallback(
  prompt: string,
  options?: { maxTokens?: number; model?: string; getModelString?: (provider: string) => string },
  modelPriority?: Array<'gemini' | 'anthropic' | 'nvidia-mistral' | 'nvidia-phi' | 'nvidia-gemma27b' | 'nvidia-qwen' | 'nvidia-jamba'>
): Promise<{ response: string; provider: string; attempts: number }> {
  let lastError: Error | null = null;
  let attempts = 0;
  
  // Use provided priority or default fallback chain with DEV_MODE consideration
  const priority = modelPriority || FALLBACK_CHAIN;
  const fallbackChain = getFallbackChain(priority[0]);

  // Halloween cookie knock knock: try all doors until one gives candy
  for (const provider of fallbackChain) {
    attempts++;
    try {
      log.info({ provider, attempt: attempts, totalDoors: fallbackChain.length }, `Knocking on door for content: ${provider}`);

      const aiProvider = createProvider(provider);

      // Get correct model string for this provider
      const providerModel = options?.getModelString?.(provider) || options?.model;

      // Wrap with timeout (10s) - no retry, just move to next door
      const response = await withTimeout(
        aiProvider.generateContent(prompt, { maxTokens: options?.maxTokens, model: providerModel }),
        10000 // 10 second timeout
      );

      log.info({ provider, attempts, success: true }, 'Door opened - got candy!');
      return { response, provider, attempts };
    } catch (error) {
      lastError = error as Error;
      const isTimeout = error instanceof TimeoutError;
      
      log.error({ 
        provider, 
        attempt: attempts,
        error: lastError.message,
        isTimeout
      }, 'Door closed - no candy, trying next door');

      // If this is the last provider in the chain, throw the error
      if (provider === fallbackChain[fallbackChain.length - 1]) {
        log.error({ attempts, totalDoors: fallbackChain.length }, 'All doors closed - no candy anywhere');
        throw new Error(`All AI providers failed for content generation after ${attempts} attempts. Last error: ${lastError.message}`);
      }

      // Continue to next provider (next door)
      continue;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error(`Fallback chain exhausted after ${attempts} attempts`);
}
