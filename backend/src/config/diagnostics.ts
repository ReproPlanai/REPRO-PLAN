import { getEnv } from './env';
import { logger } from './logger';
import { checkConnection } from './db';

export interface ServiceStatus {
  name: string;
  status: 'configured' | 'not_configured' | 'partial' | 'error';
  message: string;
  details?: Record<string, any>;
}

export interface SystemDiagnostics {
  timestamp: string;
  environment: string;
  port: number;
  services: ServiceStatus[];
  summary: {
    total: number;
    configured: number;
    notConfigured: number;
    partial: number;
    errors: number;
  };
}

/**
 * Fortune 500 Server Diagnostics
 * Comprehensive configuration and health validation
 */
export class ServerDiagnostics {
  private env = getEnv();

  /**
   * Run complete system diagnostics
   */
  async runDiagnostics(): Promise<SystemDiagnostics> {
    const dbStatus = await this.checkDatabase();
    
    const services: ServiceStatus[] = [
      dbStatus,
      this.checkEmail(),
      this.checkAI(),
      this.checkFrontend(),
      this.checkSecurity(),
    ];

    const summary = {
      total: services.length,
      configured: services.filter(s => s.status === 'configured').length,
      notConfigured: services.filter(s => s.status === 'not_configured').length,
      partial: services.filter(s => s.status === 'partial').length,
      errors: services.filter(s => s.status === 'error').length,
    };

    return {
      timestamp: new Date().toISOString(),
      environment: this.env.NODE_ENV,
      port: this.env.PORT,
      services,
      summary,
    };
  }

  /**
   * Check Database configuration
   */
  private async checkDatabase(): Promise<ServiceStatus> {
    const hasDbUrl = !!this.env.DATABASE_URL;
    
    if (!hasDbUrl) {
      return {
        name: 'Database (PostgreSQL)',
        status: 'not_configured',
        message: 'DATABASE_URL not set. Application will run in mock/offline mode.',
        details: { mode: 'mock/offline' },
      };
    }

    try {
      // Try to actually connect to the database
      const isConnected = await checkConnection();
      
      if (!isConnected) {
        logger.error({
          type: 'database_connection',
          message: 'DATABASE_URL set but connection failed',
          details: { mode: 'connection_error' },
        }, 'DATABASE CONNECTION ERROR');
        return {
          name: 'Database (PostgreSQL)',
          status: 'error',
          message: 'DATABASE_URL set but connection failed',
          details: { mode: 'connection_error' },
        };
      }
      
      const url = new URL(this.env.DATABASE_URL!);
      return {
        name: 'Database (PostgreSQL)',
        status: 'configured',
        message: 'PostgreSQL connected and operational',
        details: {
          host: url.hostname,
          port: url.port || '5432',
          database: url.pathname.slice(1),
          ssl: url.searchParams.get('sslmode') || 'default',
          connected: true,
        },
      };
    } catch {
      logger.error({
        type: 'database_url',
        message: 'Invalid DATABASE_URL format',
        details: { error: 'URL parse failed' },
      }, 'INVALID DATABASE URL');
      return {
        name: 'Database (PostgreSQL)',
        status: 'error',
        message: 'Invalid DATABASE_URL format',
        details: { error: 'URL parse failed' },
      };
    }
  }

  /**
   * Check Email service configuration
   */
  private checkEmail(): ServiceStatus {
    const hasResendKey = !!this.env.RESEND_API_KEY;
    
    if (!hasResendKey) {
      return {
        name: 'Email (Resend)',
        status: 'not_configured',
        message: 'RESEND_API_KEY not set. Email features disabled.',
        details: { mode: 'disabled' },
      };
    }

    const isValidFormat = this.env.RESEND_API_KEY?.startsWith('re_');
    
    return {
      name: 'Email (Resend)',
      status: isValidFormat ? 'configured' : 'partial',
      message: isValidFormat 
        ? 'Resend API configured'
        : 'Resend API key format looks invalid (should start with "re_")',
      details: {
        from: this.env.EMAIL_FROM,
        keyPrefix: this.env.RESEND_API_KEY?.substring(0, 6) + '...',
        logoConfigured: !!this.env.BRAND_LOGO_URL,
      },
    };
  }

  /**
   * Check AI service configuration
   */
  private checkAI(): ServiceStatus {
    const aiProvider = this.env.AI_PROVIDER;
    const providerKeys: Record<string, string | undefined> = {
      gemini: this.env.GEMINI_API_KEY,
      anthropic: this.env.ANTHROPIC_API_KEY,
    };

    const currentKey = providerKeys[aiProvider];
    const hasKey = !!currentKey;

    if (!hasKey) {
      const configuredProviders = Object.entries(providerKeys)
        .filter(([, key]) => !!key)
        .map(([name]) => name);

      return {
        name: `AI (${aiProvider})`,
        status: configuredProviders.length > 0 ? 'partial' : 'not_configured',
        message: configuredProviders.length > 0
          ? `${aiProvider} not configured, but ${configuredProviders.join(', ')} available`
          : 'No AI API keys set. AI features (ReproBot chatbot) disabled.',
        details: {
          activeProvider: aiProvider,
          availableProviders: configuredProviders,
          mode: configuredProviders.length > 0 ? 'fallback' : 'disabled',
        },
      };
    }

    return {
      name: `AI (${aiProvider})`,
      status: 'configured',
      message: `${aiProvider} AI configured and ready`,
      details: {
        provider: aiProvider,
        keyPrefix: currentKey?.substring(0, 10) + '...',
      },
    };
  }

  /**
   * Check Frontend URL configuration
   */
  private checkFrontend(): ServiceStatus {
    const isDefault = this.env.FRONTEND_URL === 'https://repro-plan.vercel.app';
    
    return {
      name: 'Frontend (CORS)',
      status: 'configured',
      message: `CORS configured for ${this.env.FRONTEND_URL}`,
      details: {
        url: this.env.FRONTEND_URL,
        isProduction: !isDefault || this.env.NODE_ENV === 'production',
        environment: this.env.NODE_ENV,
      },
    };
  }

  /**
   * Check Security configuration
   */
  private checkSecurity(): ServiceStatus {
    const checks = {
      helmet: true, // Always enabled in index.ts
      cors: !!this.env.FRONTEND_URL,
      productionMode: this.env.NODE_ENV === 'production',
    };

    const allSecure = Object.values(checks).every(Boolean);

    return {
      name: 'Security Stack',
      status: allSecure ? 'configured' : 'partial',
      message: allSecure 
        ? 'Security middleware fully configured'
        : 'Security partially configured - review recommended',
      details: {
        helmetEnabled: checks.helmet,
        corsConfigured: checks.cors,
        productionMode: checks.productionMode,
        port: this.env.PORT,
      },
    };
  }

  /**
   * Log startup diagnostics to structured logger only (production-safe)
   */
  logStartup(diagnostics: SystemDiagnostics): void {
    const { summary, services } = diagnostics;
    
    // Log structured diagnostics to production logger
    logger.info({ 
      diagnostics: {
        summary,
        services: services.map(s => ({
          name: s.name,
          status: s.status,
          message: s.message,
        })),
      },
      environment: diagnostics.environment,
      port: diagnostics.port,
      timestamp: diagnostics.timestamp,
    }, 'REPRO PLAN SERVER - Fortune 500 Diagnostic Report');
  }
}

export const serverDiagnostics = new ServerDiagnostics();
