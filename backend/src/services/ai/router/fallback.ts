import { createServiceLogger } from '../../../config/logger';
import type { AIProvider, Message } from '../types';
import { createGeminiProvider } from '../providers/gemini';
import { createAnthropicProvider } from '../providers/anthropic';
import { getEnv } from '../../../config/env';
import type { SupportedModel } from '../providers/gemini';
import { withTimeout } from '../../gateway/timeout';
import { withRetry } from '../../gateway/retry';

const log = createServiceLogger('ai-fallback');

// Fallback chain: Gemini → Claude
const FALLBACK_CHAIN: Array<'gemini' | 'anthropic'> = ['gemini', 'anthropic'];

// Create provider instance
function createProvider(provider: 'gemini' | 'anthropic'): AIProvider {
  const env = getEnv();

  if (provider === 'gemini') {
    if (!env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }
    const defaultModel: SupportedModel = (env.GEMINI_MODEL && env.GEMINI_MODEL.includes('gemini'))
      ? env.GEMINI_MODEL as SupportedModel
      : 'gemini-2.5-flash-lite';
    return createGeminiProvider(env.GEMINI_API_KEY, defaultModel);
  }

  if (provider === 'anthropic') {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }
    return createAnthropicProvider(env.ANTHROPIC_API_KEY);
  }

  throw new Error(`Unknown provider: ${provider}`);
}

// Execute request with fallback chain
export async function executeWithFallback(
  request: {
    prompt: string;
    history?: Message[];
    systemPrompt?: string;
    model?: string;
  },
  modelPriority: Array<'gemini' | 'anthropic'> = FALLBACK_CHAIN
): Promise<{ response: string; provider: string; attempts: number }> {
  let lastError: Error | null = null;
  let attempts = 0;
  const maxAttemptsPerProvider = 2; // 2 attempts per provider before fallback

  for (const provider of modelPriority) {
    for (let providerAttempt = 1; providerAttempt <= maxAttemptsPerProvider; providerAttempt++) {
      attempts++;
      try {
        log.info({ provider, attempt: attempts, providerAttempt }, `Attempting ${provider} (attempt ${providerAttempt}/${maxAttemptsPerProvider})`);

        const aiProvider = createProvider(provider);

        // Wrap with retry (exponential backoff) and timeout
        const response = await withRetry(async () => {
          return withTimeout(
            aiProvider.generateResponse(
              request.prompt,
              request.history,
              request.systemPrompt,
              request.model
            ),
            8000 // 8 second timeout as per plan
          );
        }, 1); // Retry once (2 total attempts per provider handled by outer loop)

        log.info({ provider, attempts, providerAttempt, success: true }, 'Request successful');
        return { response, provider, attempts };
      } catch (error) {
        lastError = error as Error;
        log.error({ provider, attempt: attempts, providerAttempt, error: lastError.message }, 'Provider attempt failed');

        // If this is not the last attempt for this provider, retry the same provider
        if (providerAttempt < maxAttemptsPerProvider) {
          log.info({ provider, providerAttempt, maxAttemptsPerProvider }, 'Retrying same provider');
          continue;
        }

        // If this is the last provider in the chain, throw the error
        if (provider === modelPriority[modelPriority.length - 1]) {
          log.error({ attempts, totalProviders: modelPriority.length }, 'All providers failed');
          throw new Error(`All AI providers failed after ${attempts} attempts. Last error: ${lastError.message}`);
        }

        // Continue to next provider in chain
        log.info({ provider, nextProvider: modelPriority[modelPriority.indexOf(provider) + 1] }, 'Falling back to next provider');
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error(`Fallback chain exhausted after ${attempts} attempts`);
}

// Execute content generation with fallback
export async function executeContentWithFallback(
  prompt: string,
  options?: { maxTokens?: number; model?: string },
  modelPriority: Array<'gemini' | 'anthropic'> = FALLBACK_CHAIN
): Promise<{ response: string; provider: string; attempts: number }> {
  let lastError: Error | null = null;
  let attempts = 0;
  const maxAttemptsPerProvider = 2; // 2 attempts per provider before fallback

  for (const provider of modelPriority) {
    for (let providerAttempt = 1; providerAttempt <= maxAttemptsPerProvider; providerAttempt++) {
      attempts++;
      try {
        log.info({ provider, attempt: attempts, providerAttempt }, `Attempting ${provider} for content generation (attempt ${providerAttempt}/${maxAttemptsPerProvider})`);

        const aiProvider = createProvider(provider);

        // Wrap with retry (exponential backoff) and timeout
        const response = await withRetry(async () => {
          return withTimeout(
            aiProvider.generateContent(prompt, options),
            8000 // 8 second timeout as per plan
          );
        }, 1); // Retry once (2 total attempts per provider handled by outer loop)

        log.info({ provider, attempts, providerAttempt, success: true }, 'Content generation successful');
        return { response, provider, attempts };
      } catch (error) {
        lastError = error as Error;
        log.error({ provider, attempt: attempts, providerAttempt, error: lastError.message }, 'Provider attempt failed for content generation');

        // If this is not the last attempt for this provider, retry the same provider
        if (providerAttempt < maxAttemptsPerProvider) {
          log.info({ provider, providerAttempt, maxAttemptsPerProvider }, 'Retrying same provider for content generation');
          continue;
        }

        // If this is the last provider in the chain, throw the error
        if (provider === modelPriority[modelPriority.length - 1]) {
          log.error({ attempts, totalProviders: modelPriority.length }, 'All providers failed for content generation');
          throw new Error(`All AI providers failed for content generation after ${attempts} attempts. Last error: ${lastError.message}`);
        }

        // Continue to next provider in chain
        log.info({ provider, nextProvider: modelPriority[modelPriority.indexOf(provider) + 1] }, 'Falling back to next provider');
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error(`Fallback chain exhausted after ${attempts} attempts`);
}
