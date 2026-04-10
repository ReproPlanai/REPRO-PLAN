import { getEnv } from '../../../config/env';
import { createServiceLogger } from '../../../config/logger';

const log = createServiceLogger('ai-router');

// Task types for AI routing
export type TaskType = 'chat' | 'quiz' | 'game' | 'therapy' | 'health' | 'explain';

// Model selection options
export interface ModelSelectionOptions {
  taskType: TaskType;
  content?: string;
  sessionId?: string;
}

// Sensitive keywords for SRHR content - conservative detection
const SENSITIVE_KEYWORDS = [
  'abortion', 'miscarriage', 'pregnancy termination',
  'sti', 'std', 'hiv', 'aids', 'syphilis', 'gonorrhea', 'chlamydia',
  'sexual abuse', 'rape', 'assault', 'harassment', 'coercion',
  'contraception', 'birth control', 'condom', 'iud',
  'menstruation', 'period', 'menstrual',
  'pelvic pain', 'vaginal bleeding', 'discharge',
  'sexual health', 'reproductive health',
  'emergency contraception', 'plan b',
  'pap smear', 'hpv', 'cervical cancer',
  'breast cancer', 'mammogram',
  'uterus', 'ovary', 'cervix', 'vagina',
  'testicle', 'prostate', 'erection', 'ejaculation'
];

// Detect if content contains sensitive SRHR topics
function detectSensitiveContent(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return SENSITIVE_KEYWORDS.some(keyword => lowerContent.includes(keyword));
}

// Select the appropriate model based on task type and content
export function selectModel(options: ModelSelectionOptions): 'gemini' | 'anthropic' | 'nvidia-mistral' | 'nvidia-phi' | 'nvidia-gemma27b' | 'nvidia-qwen' | 'nvidia-jamba' {
  const env = getEnv();
  const { taskType, content = '' } = options;

  // DEV_MODE: Route all calls to Gemini to preserve Claude free tier
  if (env.DEV_MODE) {
    log.info({ taskType, reason: 'DEV_MODE' }, 'Routing to Gemini');
    return 'gemini';
  }

  // Check if NVIDIA is configured
  const hasNvidia = !!(env.NVIDIA_MISTRAL_API_KEY || env.NVIDIA_PHI_API_KEY || env.NVIDIA_GEMMA_27B_API_KEY);

  // Therapy/health: Claude only (no exceptions)
  if (taskType === 'therapy' || taskType === 'health') {
    log.info({ taskType, reason: 'health-sensitive' }, 'Routing to Claude');
    return 'anthropic';
  }

  // Chat: Check for sensitive content
  if (taskType === 'chat') {
    if (detectSensitiveContent(content)) {
      log.info({ taskType, reason: 'sensitive-content-detected' }, 'Routing to Claude');
      return 'anthropic';
    }
    // Default to Gemini for general chat
    log.info({ taskType, reason: 'general-chat' }, 'Routing to Gemini');
    return 'gemini';
  }

  // Quiz, game: Use NVIDIA for load balancing (if configured)
  if (taskType === 'quiz' || taskType === 'game') {
    if (env.NVIDIA_MISTRAL_API_KEY) {
      log.info({ taskType, reason: 'nvidia-load-balancing' }, 'Routing to NVIDIA Mistral');
      return 'nvidia-mistral';
    }
    if (env.NVIDIA_PHI_API_KEY) {
      log.info({ taskType, reason: 'nvidia-load-balancing' }, 'Routing to NVIDIA Phi');
      return 'nvidia-phi';
    }
    if (env.NVIDIA_GEMMA_27B_API_KEY) {
      log.info({ taskType, reason: 'nvidia-load-balancing' }, 'Routing to NVIDIA Gemma 27B');
      return 'nvidia-gemma27b';
    }
    log.info({ taskType, reason: 'cost-optimized' }, 'Routing to Gemini');
    return 'gemini';
  }

  // Explain: Use Gemini (cost-optimized)
  if (taskType === 'explain') {
    log.info({ taskType, reason: 'cost-optimized' }, 'Routing to Gemini');
    return 'gemini';
  }

  // Default to Gemini
  log.warn({ taskType }, 'Unknown task type, defaulting to Gemini');
  return 'gemini';
}

// Get the specific model string based on provider and task
export function getModelString(provider: 'gemini' | 'anthropic' | 'nvidia-mistral' | 'nvidia-phi' | 'nvidia-gemma27b' | 'nvidia-qwen' | 'nvidia-jamba', taskType: TaskType): string {
  const env = getEnv();

  if (provider === 'gemini') {
    // Use configured Gemini model or task-specific default
    if (env.GEMINI_MODEL) {
      return env.GEMINI_MODEL;
    }
    
    // Task-specific defaults
    switch (taskType) {
      case 'quiz':
        return 'gemini-2.5-flash-lite'; // Most cost-effective
      case 'chat':
        return 'gemini-3-flash-preview'; // Better quality for chat
      default:
        return 'gemini-3-flash-preview';
    }
  }

  if (provider === 'anthropic') {
    // Claude Sonnet 4.6 for all tasks
    return 'claude-sonnet-4-6';
  }

  if (provider === 'nvidia-mistral') {
    return 'mistralai/mistral-small-3.1-24b-instruct-2503';
  }

  if (provider === 'nvidia-phi') {
    return 'microsoft/phi-3.5-mini-instruct';
  }

  if (provider === 'nvidia-gemma27b') {
    return 'google/gemma-2-27b-it';
  }

  if (provider === 'nvidia-qwen') {
    return 'deepseek-ai/deepseek-r1-distill-qwen-7b';
  }

  if (provider === 'nvidia-jamba') {
    return 'ai21labs/jamba-1.5-mini-instruct';
  }

  return 'gemini-3-flash-preview';
}
