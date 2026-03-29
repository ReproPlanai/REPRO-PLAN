import pino from 'pino';
import { getEnv } from './env';

const env = getEnv();
const isDev = env.NODE_ENV === 'development';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport:
    isDev
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  base: { service: 'api' },
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export function createServiceLogger(service: string) {
  return logger.child({ service });
}
