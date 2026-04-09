import { createServiceLogger } from '../../../config/logger';
import type { AIProvider, Message } from '../types';
import { createGeminiProvider } from '../providers/gemini';
import { createAnthropicProvider } from '../providers/anthropic';
import { getEnv } from '../../../config/env';
import { withTimeout, TimeoutError } from '../../gateway/timeout';
import { withRetry, RetryError } from '../../gateway/retry';

const log = createServiceLogger('ai-fallback');

// Fallback chain: Gemini → Claude
const FALLBACK_CHAIN: Array<'gemini' | 'anthropic'> = ['gemini', 'anthropic'];

// Get fallback chain based on provider
// Use both providers in round-robin to handle rate limits
function getFallbackChain(provider: 'gemini' | 'anthropic'): Array<'gemini' | 'anthropic'> {
  // Alternate between providers to distribute load and handle rate limits
  const timestamp = Date.now();
  const useGeminiFirst = timestamp % 2 === 0;
  
  if (provider === 'anthropic') {
    return ['anthropic', 'gemini'];
  }
  
  return useGeminiFirst ? ['gemini', 'anthropic'] : ['anthropic', 'gemini'];
}

// Create provider instance
function createProvider(provider: 'gemini' | 'anthropic'): AIProvider {
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

  throw new Error(`Unknown provider: ${provider}`);
}

// Execute request with fallback chain (with timeout and retry)
export async function executeWithFallback(
  request: {
    prompt: string;
    history?: Message[];
    systemPrompt?: string;
    model?: string;
  },
  modelPriority?: Array<'gemini' | 'anthropic'>
): Promise<{ response: string; provider: string; attempts: number }> {
  let lastError: Error | null = null;
  let attempts = 0;
  const maxAttemptsPerProvider = 2; // 2 attempts per provider before fallback
  
  // Use provided priority or default fallback chain with DEV_MODE consideration
  const priority = modelPriority || FALLBACK_CHAIN;
  const fallbackChain = getFallbackChain(priority[0]);

  for (const provider of fallbackChain) {
    for (let providerAttempt = 1; providerAttempt <= maxAttemptsPerProvider; providerAttempt++) {
      attempts++;
      try {
        log.info({ provider, attempt: attempts, providerAttempt }, `Attempting ${provider} (attempt ${providerAttempt}/${maxAttemptsPerProvider})`);

        const aiProvider = createProvider(provider);

        // Wrap with timeout (8s) and retry (exponential backoff)
        const response = await withRetry(
          async () => {
            return await withTimeout(
              aiProvider.generateResponse(
                request.prompt,
                request.history,
                request.systemPrompt
              ),
              8000 // 8 second timeout
            );
          },
          2 // 2 retry attempts per provider attempt
        );

        log.info({ provider, attempts, providerAttempt, success: true }, 'Request successful');
        return { response, provider, attempts };
      } catch (error) {
        lastError = error as Error;
        const isTimeout = error instanceof TimeoutError;
        const isRetryExhausted = error instanceof RetryError;
        
        log.error({ 
          provider, 
          attempt: attempts, 
          providerAttempt, 
          error: lastError.message,
          isTimeout,
          isRetryExhausted
        }, 'Provider attempt failed');

        // If this is not the last attempt for this provider, retry the same provider
        if (providerAttempt < maxAttemptsPerProvider) {
          log.info({ provider, providerAttempt, maxAttemptsPerProvider }, 'Retrying same provider');
          continue;
        }

        // If this is the last provider in the chain, throw the error
        if (provider === fallbackChain[fallbackChain.length - 1]) {
          log.error({ attempts, totalProviders: fallbackChain.length }, 'All providers failed');
          throw new Error(`All AI providers failed after ${attempts} attempts. Last error: ${lastError.message}`);
        }

        // Continue to next provider in chain
        log.info({ provider, nextProvider: fallbackChain[fallbackChain.indexOf(provider) + 1] }, 'Falling back to next provider');
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error(`Fallback chain exhausted after ${attempts} attempts`);
}

// Execute content generation with fallback (with timeout and retry)
export async function executeContentWithFallback(
  prompt: string,
  options?: { maxTokens?: number; model?: string },
  modelPriority?: Array<'gemini' | 'anthropic'>
): Promise<{ response: string; provider: string; attempts: number }> {
  let lastError: Error | null = null;
  let attempts = 0;
  const maxAttemptsPerProvider = 2; // 2 attempts per provider before fallback
  
  // Use provided priority or default fallback chain with DEV_MODE consideration
  const priority = modelPriority || FALLBACK_CHAIN;
  const fallbackChain = getFallbackChain(priority[0]);

  for (const provider of fallbackChain) {
    for (let providerAttempt = 1; providerAttempt <= maxAttemptsPerProvider; providerAttempt++) {
      attempts++;
      try {
        log.info({ provider, attempt: attempts, providerAttempt }, `Attempting ${provider} for content generation (attempt ${providerAttempt}/${maxAttemptsPerProvider})`);

        const aiProvider = createProvider(provider);

        // Wrap with timeout (8s) and retry (exponential backoff)
        const response = await withRetry(
          async () => {
            return await withTimeout(
              aiProvider.generateContent(prompt, options),
              8000 // 8 second timeout
            );
          },
          2 // 2 retry attempts per provider attempt
        );

        log.info({ provider, attempts, providerAttempt, success: true }, 'Content generation successful');
        return { response, provider, attempts };
      } catch (error) {
        lastError = error as Error;
        const isTimeout = error instanceof TimeoutError;
        const isRetryExhausted = error instanceof RetryError;
        
        log.error({ 
          provider, 
          attempt: attempts, 
          providerAttempt, 
          error: lastError.message,
          isTimeout,
          isRetryExhausted
        }, 'Provider attempt failed for content generation');

        // If this is not the last attempt for this provider, retry the same provider
        if (providerAttempt < maxAttemptsPerProvider) {
          log.info({ provider, providerAttempt, maxAttemptsPerProvider }, 'Retrying same provider for content generation');
          continue;
        }

        // If this is the last provider in the chain, throw the error
        if (provider === fallbackChain[fallbackChain.length - 1]) {
          log.error({ attempts, totalProviders: fallbackChain.length }, 'All providers failed for content generation');
          throw new Error(`All AI providers failed for content generation after ${attempts} attempts. Last error: ${lastError.message}`);
        }

        // Continue to next provider in chain
        log.info({ provider, nextProvider: fallbackChain[fallbackChain.indexOf(provider) + 1] }, 'Falling back to next provider');
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error(`Fallback chain exhausted after ${attempts} attempts`);
}
