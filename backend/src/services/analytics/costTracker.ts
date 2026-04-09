import { createServiceLogger } from '../../config/logger';
import { query } from '../../config/db';

const log = createServiceLogger('cost-tracker');

// Cost per million tokens for each model (pinned model strings as per plan)
const MODEL_COSTS: Record<string, { inputCostPerMillion: number; outputCostPerMillion: number }> = {
  'claude-sonnet-4-6': { inputCostPerMillion: 3.0, outputCostPerMillion: 15.0 },
  'gemini-2.5-flash-lite': { inputCostPerMillion: 0.10, outputCostPerMillion: 0.40 },
  'gemini-2.5-pro': { inputCostPerMillion: 2.50, outputCostPerMillion: 10.0 },
  'gemini-2.5-flash': { inputCostPerMillion: 0.075, outputCostPerMillion: 0.30 },
  'gemini-flash-latest': { inputCostPerMillion: 0.075, outputCostPerMillion: 0.30 },
};

// Estimate cost based on tokens and model
function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  const modelCost = MODEL_COSTS[model];
  
  if (!modelCost) {
    log.warn({ model }, 'Unknown model, using default cost estimate');
    // Default conservative estimate
    return (inputTokens * 0.001 + outputTokens * 0.004) / 1000000;
  }
  
  const inputCost = (inputTokens / 1000000) * modelCost.inputCostPerMillion;
  const outputCost = (outputTokens / 1000000) * modelCost.outputCostPerMillion;
  
  return inputCost + outputCost;
}

// Log AI usage to database
export async function logUsage(params: {
  sessionId: string;
  modelUsed: string;
  taskType: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  requestId?: string;
}): Promise<void> {
  try {
    const {
      sessionId,
      modelUsed,
      taskType,
      inputTokens = 0,
      outputTokens = 0,
      latencyMs,
      requestId
    } = params;
    
    const costUsd = estimateCost(inputTokens, outputTokens, modelUsed);
    
    await query(
      `INSERT INTO ai_usage_logs (session_id, model_used, task_type, input_tokens, output_tokens, latency_ms, cost_usd, request_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [sessionId, modelUsed, taskType, inputTokens, outputTokens, latencyMs, costUsd, requestId]
    );
    
    log.info({
      sessionId,
      modelUsed,
      taskType,
      inputTokens,
      outputTokens,
      latencyMs,
      costUsd
    }, 'AI usage logged');
  } catch (error) {
    log.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to log AI usage');
    // Don't throw - logging failures shouldn't break the main flow
  }
}

// Log AI error to database
export async function logError(params: {
  sessionId: string;
  modelUsed: string;
  errorType: string;
  errorMessage: string;
  requestId?: string;
  fallbackAttempted?: boolean;
  fallbackToModel?: string;
}): Promise<void> {
  try {
    const {
      sessionId,
      modelUsed,
      errorType,
      errorMessage,
      requestId,
      fallbackAttempted = false,
      fallbackToModel
    } = params;
    
    await query(
      `INSERT INTO ai_errors (session_id, model_used, error_type, error_message, request_id, fallback_attempted, fallback_to_model)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sessionId, modelUsed, errorType, errorMessage, requestId, fallbackAttempted, fallbackToModel]
    );
    
    log.info({
      sessionId,
      modelUsed,
      errorType,
      fallbackAttempted,
      fallbackToModel
    }, 'AI error logged');
  } catch (error) {
    log.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to log AI error');
    // Don't throw - logging failures shouldn't break the main flow
  }
}

// Get cost estimate for a model without logging
export function getCostEstimate(inputTokens: number, outputTokens: number, model: string): number {
  return estimateCost(inputTokens, outputTokens, model);
}

// Get model cost information
export function getModelCostInfo(model: string): { inputCostPerMillion: number; outputCostPerMillion: number } | null {
  return MODEL_COSTS[model] || null;
}

// Get all supported models with cost info
export function getAllModelCosts(): Record<string, { inputCostPerMillion: number; outputCostPerMillion: number }> {
  return { ...MODEL_COSTS };
}
