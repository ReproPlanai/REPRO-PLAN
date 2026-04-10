import { getEnv } from '../../../config/env';
import { createServiceLogger } from '../../../config/logger';
import { createSafetyProvider, SafetyModel } from '../providers/nvidia';
import { getCached, setCached } from '../../cache';

const log = createServiceLogger('safety');

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  model?: string;
}

export interface SafetyCheckOptions {
  skipCache?: boolean;
}

const SAFETY_CACHE_TTL = 300; // 5 minutes

// Initialize safety providers
let guardianProvider: ReturnType<typeof createSafetyProvider> | null = null;
let shieldGemmaProvider: ReturnType<typeof createSafetyProvider> | null = null;
let llamaGuardProvider: ReturnType<typeof createSafetyProvider> | null = null;

function initializeSafetyProviders() {
  const env = getEnv();
  
  if (!guardianProvider && env.NVIDIA_GUARDIAN_API_KEY) {
    guardianProvider = createSafetyProvider(
      env.NVIDIA_GUARDIAN_API_KEY,
      'ibm/granite-guardian-3.0-8b' as SafetyModel
    );
  }
  
  if (!shieldGemmaProvider && env.NVIDIA_SHIELDGEMMA_API_KEY) {
    shieldGemmaProvider = createSafetyProvider(
      env.NVIDIA_SHIELDGEMMA_API_KEY,
      'google/shieldgemma-9b' as SafetyModel
    );
  }
  
  if (!llamaGuardProvider && env.NVIDIA_LLAMAGUARD_API_KEY) {
    llamaGuardProvider = createSafetyProvider(
      env.NVIDIA_LLAMAGUARD_API_KEY,
      'meta/llama-guard-4-12b' as SafetyModel
    );
  }
}

/**
 * Check if content is safe using multiple guardrail models
 * Uses voting mechanism: 2/3 consensus required to mark as unsafe
 */
export async function checkSafety(
  content: string,
  context?: string,
  options: SafetyCheckOptions = {}
): Promise<SafetyCheckResult> {
  initializeSafetyProviders();
  
  const providers = [
    { name: 'Granite Guardian', provider: guardianProvider },
    { name: 'ShieldGemma', provider: shieldGemmaProvider },
    { name: 'Llama Guard', provider: llamaGuardProvider }
  ].filter(p => p.provider !== null);
  
  if (providers.length === 0) {
    log.warn('No safety providers configured, allowing content by default');
    return { safe: true, reason: 'No safety providers configured' };
  }
  
  // Check cache first
  if (!options.skipCache) {
    const cacheKey = `safety:${Buffer.from(content).toString('base64').slice(0, 64)}`;
    const cached = await getCached<SafetyCheckResult>(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  // Run safety checks in parallel
  const results = await Promise.allSettled(
    providers.map(async ({ name, provider }) => {
      try {
        const result = await provider!.checkSafety(content, context);
        return { name, ...result };
      } catch (error) {
        log.error({ error, model: name }, 'Safety check failed');
        return { name, safe: true, reason: 'Check failed' };
      }
    })
  );
  
  // Count unsafe votes
  const unsafeVotes = results.filter(
    r => r.status === 'fulfilled' && !r.value.safe
  ).length;
  
  const totalVotes = results.filter(r => r.status === 'fulfilled').length;
  const isSafe = unsafeVotes < Math.ceil(totalVotes / 2); // 2/3 consensus
  
  const reasons = results
    .filter((r): r is PromiseFulfilledResult<{ safe: boolean; reason?: string; name: string }> => r.status === 'fulfilled' && !r.value.safe)
    .map(r => r.value.reason)
    .filter(Boolean);
  
  const result: SafetyCheckResult = {
    safe: isSafe,
    reason: isSafe ? undefined : reasons.join('; '),
    model: providers.map(p => p.name).join(', ')
  };
  
  // Cache the result
  if (!options.skipCache) {
    const cacheKey = `safety:${Buffer.from(content).toString('base64').slice(0, 64)}`;
    await setCached(cacheKey, result, SAFETY_CACHE_TTL);
  }
  
  log.info({ safe: isSafe, unsafeVotes, totalVotes }, 'Safety check completed');
  
  return result;
}

/**
 * Pre-processor: Check user input for harmful content before sending to AI
 */
export async function preProcessInput(
  input: string,
  context?: string
): Promise<{ safe: boolean; sanitizedInput?: string; reason?: string }> {
  const result = await checkSafety(input, context);
  
  if (!result.safe) {
    log.warn({ reason: result.reason }, 'Input blocked by safety layer');
    return { safe: false, reason: result.reason };
  }
  
  return { safe: true, sanitizedInput: input };
}

/**
 * Post-processor: Validate AI output before returning to user
 */
export async function postProcessOutput(
  output: string,
  context?: string
): Promise<{ safe: boolean; sanitizedOutput?: string; reason?: string }> {
  const result = await checkSafety(output, context);
  
  if (!result.safe) {
    log.warn({ reason: result.reason }, 'Output blocked by safety layer');
    return { safe: false, reason: result.reason };
  }
  
  return { safe: true, sanitizedOutput: output };
}

/**
 * Check if safety layer is configured
 */
export function isSafetyConfigured(): boolean {
  initializeSafetyProviders();
  return !!(guardianProvider || shieldGemmaProvider || llamaGuardProvider);
}
