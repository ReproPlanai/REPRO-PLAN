import { createServiceLogger } from '../../config/logger';
import type { Message } from '../ai/types';

const log = createServiceLogger('context-manager');

// Trim conversation history to max messages (default: 10)
export function trimHistory(history: Message[], maxMessages: number = 10): Message[] {
  if (!history || history.length <= maxMessages) {
    return history || [];
  }

  // Keep the most recent messages
  const trimmed = history.slice(-maxMessages);
  log.info({ originalLength: history.length, trimmedLength: trimmed.length, maxMessages }, 'Conversation history trimmed');
  
  return trimmed;
}

// Estimate token count (rough approximation: ~4 characters per token)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Build context with message, history, and system prompt
export function buildContext(
  message: string,
  history?: Message[],
  systemPrompt?: string,
  maxMessages: number = 10
): { context: string; trimmedHistory: Message[]; estimatedTokens: number } {
  const trimmedHistory = trimHistory(history || [], maxMessages);
  
  let context = '';
  
  // Add system prompt if provided
  if (systemPrompt) {
    context += `[System: ${systemPrompt}]\n\n`;
  }
  
  // Add conversation history
  if (trimmedHistory.length > 0) {
    for (const msg of trimmedHistory) {
      const role = msg.role === 'user' ? 'User' : 'ReproBot';
      context += `${role}: ${msg.content}\n\n`;
    }
  }
  
  // Add current message
  context += `User: ${message}\n\nReproBot:`;
  
  const estimatedTokens = estimateTokens(context);
  
  log.info({
    historyLength: history?.length || 0,
    trimmedLength: trimmedHistory.length,
    estimatedTokens
  }, 'Context built');
  
  return { context, trimmedHistory, estimatedTokens };
}

// Build messages array for Claude API format
export function buildMessagesForClaude(
  message: string,
  history?: Message[],
  maxMessages: number = 10
): { messages: Array<{ role: 'user' | 'assistant'; content: string }>; trimmedHistory: Message[] } {
  const trimmedHistory = trimHistory(history || [], maxMessages);
  
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  
  // Add conversation history
  if (trimmedHistory.length > 0) {
    for (const msg of trimmedHistory) {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    }
  }
  
  // Add current message
  messages.push({ role: 'user', content: message });
  
  log.info({
    historyLength: history?.length || 0,
    trimmedLength: trimmedHistory.length,
    messagesCount: messages.length
  }, 'Messages built for Claude');
  
  return { messages, trimmedHistory };
}
