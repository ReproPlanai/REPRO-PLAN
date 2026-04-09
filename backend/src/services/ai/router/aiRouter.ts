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
export function selectModel(options: ModelSelectionOptions): 'gemini' | 'anthropic' {
  const env = getEnv();
  const { taskType, content = '' } = options;

  // DEV_MODE: Route all calls to Gemini to preserve Claude free tier
  if (env.DEV_MODE) {
    log.info({ taskType, reason: 'DEV_MODE' }, 'Routing to Gemini');
    return 'gemini';
  }

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

  // Quiz, game, explain: Use Gemini (cost-optimized)
  if (taskType === 'quiz' || taskType === 'game' || taskType === 'explain') {
    log.info({ taskType, reason: 'cost-optimized' }, 'Routing to Gemini');
    return 'gemini';
  }

  // Default to Gemini
  log.warn({ taskType }, 'Unknown task type, defaulting to Gemini');
  return 'gemini';
}

// Get the specific model string based on provider and task
export function getModelString(provider: 'gemini' | 'anthropic', taskType: TaskType): string {
  const env = getEnv();

  if (provider === 'gemini') {
    // Use configured Gemini model or task-specific default
    if (env.GEMINI_MODEL) {
      return env.GEMINI_MODEL;
    }
    
    // Task-specific defaults
    switch (taskType) {
      case 'quiz':
      case 'game':
      case 'explain':
        return 'gemini-2.5-flash-lite'; // Most cost-effective
      case 'chat':
        return 'gemini-2.5-flash'; // Better quality for chat
      default:
        return 'gemini-2.5-flash-lite';
    }
  }

  if (provider === 'anthropic') {
    // Claude Sonnet 4.6 for all tasks
    return 'claude-sonnet-4-6';
  }

  return 'gemini-2.5-flash-lite';
}
