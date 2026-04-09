import { getEnv } from '../../config/env';
import { createServiceLogger } from '../../config/logger';
import { getCached, setCached } from '../cache';
import type { Message } from './types';
import { REPROBOT_SYSTEM_PROMPT } from './types';
import { selectModel, getModelString, type TaskType } from './router/aiRouter';
import { executeWithFallback, executeContentWithFallback } from './router/fallback';
import { buildContext } from '../gateway/contextManager';
import { logUsage, logError } from '../analytics/costTracker';
import { randomUUID } from 'crypto';

const log = createServiceLogger('reprobot');

function cacheKey(prompt: string, history?: Message[]): string {
  const h = history?.map((m) => `${m.role}:${m.content}`).join('|') || '';
  return `reprobot:${Buffer.from(prompt + h).toString('base64').slice(0, 64)}`;
}

export async function reprobotRespond(
  message: string,
  history?: Message[],
  options?: { useCache?: boolean, model?: string, taskType?: TaskType, sessionId?: string, systemPrompt?: string }
): Promise<string> {
  const useCache = options?.useCache ?? true;
  const taskType = options?.taskType || 'chat';
  const sessionId = options?.sessionId || randomUUID();
  const requestId = randomUUID();
  const start = Date.now();

  // Use AI router to select model
  const provider = selectModel({ taskType, content: message, sessionId });
  const modelString = getModelString(provider, taskType);

  // Use custom system prompt if provided, otherwise use default
  const systemPrompt = options?.systemPrompt || REPROBOT_SYSTEM_PROMPT;

  // Trim conversation history to 10 messages
  const { trimmedHistory, estimatedTokens } = buildContext(message, history, systemPrompt);

  if (useCache) {
    const cached = await getCached<string>(cacheKey(message, trimmedHistory));
    if (cached) {
      log.info('ReproBot cache hit');
      return cached;
    }
  }

  try {
    // Use fallback chain directly (retry logic embedded in fallback service)
    // If router selected Claude, use only Claude (no fallback needed for sensitive content)
    // If router selected Gemini, use Gemini → Claude fallback
    const fallbackChain: Array<'gemini' | 'anthropic'> = provider === 'anthropic' ? ['anthropic'] : ['gemini', 'anthropic'];
    const { response, provider: actualProvider, attempts } = await executeWithFallback({
      prompt: message,
      history: trimmedHistory,
      systemPrompt,
      model: options?.model || modelString
    }, fallbackChain);

    const duration = Date.now() - start;
    
    // Log usage analytics
    await logUsage({
      sessionId,
      modelUsed: modelString,
      taskType,
      inputTokens: estimatedTokens,
      outputTokens: estimatedTokens, // Approximation
      latencyMs: duration,
      requestId
    });

    log.info({ duration, provider: actualProvider, model: modelString, attempts }, 'ReproBot response');

    if (useCache && response) {
      await setCached(cacheKey(message, trimmedHistory), response, 3600);
    }

    return response;
  } catch (err) {
    const duration = Date.now() - start;
    const error = err as Error;
    
    // Log error analytics
    await logError({
      sessionId,
      modelUsed: modelString,
      errorType: error.name || 'unknown',
      errorMessage: error.message,
      requestId,
      fallbackAttempted: true
    });

    log.error({ err, duration }, 'ReproBot error');
    throw err;
  }
}

export async function generateContent(
  prompt: string, 
  options?: { maxTokens?: number, model?: string, taskType?: TaskType, sessionId?: string }
): Promise<string> {
  const taskType = options?.taskType || 'explain';
  const sessionId = options?.sessionId || randomUUID();
  const requestId = randomUUID();
  const start = Date.now();

  // Use AI router to select model
  const provider = selectModel({ taskType, content: prompt, sessionId });
  const modelString = getModelString(provider, taskType);

  try {
    // Use fallback chain directly (retry logic embedded in fallback service)
    const { response, provider: actualProvider, attempts } = await executeContentWithFallback(
      prompt,
      { maxTokens: options?.maxTokens, model: options?.model || modelString },
      [provider, 'anthropic']
    );

    const duration = Date.now() - start;
    
    // Log usage analytics
    await logUsage({
      sessionId,
      modelUsed: modelString,
      taskType,
      inputTokens: Math.ceil(prompt.length / 4), // Rough estimate
      outputTokens: Math.ceil(response.length / 4), // Rough estimate
      latencyMs: duration,
      requestId
    });

    log.info({ duration, provider: actualProvider, model: modelString, attempts }, 'Content generated');

    return response;
  } catch (err) {
    const duration = Date.now() - start;
    const error = err as Error;
    
    // Log error analytics
    await logError({
      sessionId,
      modelUsed: modelString,
      errorType: error.name || 'unknown',
      errorMessage: error.message,
      requestId,
      fallbackAttempted: true
    });

    log.error({ err, duration }, 'Content generation error');
    throw err;
  }
}

export function isAIConfigured(): boolean {
  const env = getEnv();
  // AI is configured if at least one provider has an API key
  return !!(env.GEMINI_API_KEY || env.ANTHROPIC_API_KEY);
}

export function getSupportedModels(): string[] {
  return [
    'gemini-3-flash-preview',
    'gemini-3-pro-preview',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-pro'
  ];
}

// Export new gateway services for direct use if needed
export { selectModel, getModelString } from './router/aiRouter';
export { executeWithFallback, executeContentWithFallback } from './router/fallback';
export { buildContext, trimHistory, estimateTokens } from '../gateway/contextManager';
export { logUsage, logError, getCostEstimate } from '../analytics/costTracker';
