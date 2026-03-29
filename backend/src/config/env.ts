import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8080').transform(Number),
  FRONTEND_URL: z.string().url().default('https://repro-plan.vercel.app'),
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security').optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('REPRO PLAN <info@reproplan.com>'),
  BRAND_LOGO_URL: z.string().url().optional(),
  AI_PROVIDER: z.enum(['gemini', 'openai', 'anthropic', 'grok']).default('gemini'),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }
  return cachedEnv;
}
