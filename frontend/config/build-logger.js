/**
 * BUILD-TIME LOGGER CONFIGURATION
 * Fortune 500 grade build logging for REPRO PLAN frontend
 * 
 * This module provides detailed insights into the build process
 * for debugging deployment issues and performance optimization.
 */

interface BuildLogEntry {
  timestamp: string;
  phase: 'init' | 'compile' | 'optimize' | 'emit' | 'done' | 'error';
  message: string;
  duration?: number;
  memory?: number;
  fileCount?: number;
  errorCount?: number;
  warningCount?: number;
}

class BuildTimeLogger {
  private logs: BuildLogEntry[] = [];
  private startTime: number = Date.now();
  private buildId: string;

  constructor() {
    this.buildId = `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.log('init', 'Build process started', { buildId: this.buildId });
  }

  log(
    phase: BuildLogEntry['phase'],
    message: string,
    metadata?: Partial<BuildLogEntry>
  ): void {
    const entry: BuildLogEntry = {
      timestamp: new Date().toISOString(),
      phase,
      message,
      ...metadata,
    };

    this.logs.push(entry);

    // Console output with Fortune 500 formatting
    const emoji = {
      init: '🚀',
      compile: '⚙️',
      optimize: '✨',
      emit: '📦',
      done: '✅',
      error: '❌',
    }[phase];

    const duration = entry.duration ? `(${entry.duration}ms)` : '';
    console.log(`${emoji} [BUILD ${phase.toUpperCase()}] ${message} ${duration}`);

    if (metadata?.errorCount) {
      console.error(`   ❌ Errors: ${metadata.errorCount}`);
    }
    if (metadata?.warningCount) {
      console.warn(`   ⚠️  Warnings: ${metadata.warningCount}`);
    }
    if (metadata?.memory) {
      console.log(`   💾 Memory: ${(metadata.memory / 1024 / 1024).toFixed(2)} MB`);
    }
    if (metadata?.fileCount) {
      console.log(`   📁 Files: ${metadata.fileCount}`);
    }
  }

  getSummary(): Record<string, unknown> {
    const duration = Date.now() - this.startTime;
    const errors = this.logs.filter(l => l.phase === 'error').length;
    const warnings = this.logs.reduce((sum, l) => sum + (l.warningCount || 0), 0);

    return {
      buildId: this.buildId,
      duration,
      totalLogs: this.logs.length,
      errors,
      warnings,
      completed: this.logs.some(l => l.phase === 'done'),
    };
  }

  exportLogs(): string {
    return JSON.stringify({
      buildId: this.buildId,
      summary: this.getSummary(),
      logs: this.logs,
    }, null, 2);
  }
}

// Global build logger instance
let buildLogger: BuildTimeLogger | null = null;

export function getBuildLogger(): BuildTimeLogger {
  if (!buildLogger) {
    buildLogger = new BuildTimeLogger();
  }
  return buildLogger;
}

// Build-time environment validation
export function validateBuildEnvironment(): void {
  const logger = getBuildLogger();
  const env = process.env;

  const checks = {
    NODE_ENV: env.NODE_ENV || 'development',
    REACT_APP_ENVIRONMENT: env.REACT_APP_ENVIRONMENT || 'development',
    REACT_APP_API_URL: env.REACT_APP_API_URL || 'NOT SET',
    REACT_APP_VERSION: env.REACT_APP_VERSION || 'NOT SET',
    GENERATE_SOURCEMAP: env.GENERATE_SOURCEMAP || 'true',
  };

  logger.log('init', 'Build environment validation', {
    environment: checks,
    nodeVersion: process.version,
    platform: process.platform,
  });

  // Warn about production issues
  if (checks.NODE_ENV === 'production') {
    if (!checks.REACT_APP_API_URL || checks.REACT_APP_API_URL === 'NOT SET') {
      logger.log('error', 'REACT_APP_API_URL not set in production!', {
        errorCount: 1,
      });
    }
    if (checks.GENERATE_SOURCEMAP === 'true') {
      logger.log('warn', 'Source maps enabled in production (increases bundle size)', {
        warningCount: 1,
      });
    }
  }
}

// Webpack plugin for detailed build logging
export class Fortune500BuildPlugin {
  private logger: BuildTimeLogger;

  constructor() {
    this.logger = getBuildLogger();
  }

  apply(compiler: any): void {
    // Log compilation start
    compiler.hooks.compile.tap('Fortune500BuildPlugin', () => {
      this.logger.log('compile', 'Webpack compilation started');
    });

    // Log optimization
    compiler.hooks.optimize.tap('Fortune500BuildPlugin', () => {
      this.logger.log('optimize', 'Asset optimization started');
    });

    // Log emit (file generation)
    compiler.hooks.emit.tap('Fortune500BuildPlugin', (compilation: any) => {
      const stats = compilation.getStats().toJson();
      this.logger.log('emit', 'Assets emitted to output directory', {
        fileCount: Object.keys(compilation.assets).length,
        warningCount: stats.warnings?.length || 0,
        errorCount: stats.errors?.length || 0,
      });
    });

    // Log completion
    compiler.hooks.done.tap('Fortune500BuildPlugin', (stats: any) => {
      const info = stats.toJson();
      const duration = info.time;
      
      this.logger.log('done', 'Build completed successfully', {
        duration,
        fileCount: info.assets?.length,
        warningCount: info.warnings?.length || 0,
        errorCount: info.errors?.length || 0,
        chunks: info.chunks?.length,
        modules: info.modules?.length,
      });

      // Log asset sizes
      if (info.assets) {
        info.assets.forEach((asset: any) => {
          const sizeMB = (asset.size / 1024 / 1024).toFixed(2);
          if (asset.size > 1024 * 1024) {
            this.logger.log('done', `Large asset: ${asset.name} (${sizeMB} MB)`, {
              warningCount: 1,
            });
          }
        });
      }

      // Print final summary
      console.log('\n' + '='.repeat(70));
      console.log('  FORTUNE 500 BUILD SUMMARY');
      console.log('='.repeat(70));
      console.log(this.logger.exportLogs());
      console.log('='.repeat(70) + '\n');
    });

    // Log errors
    compiler.hooks.failed.tap('Fortune500BuildPlugin', (error: Error) => {
      this.logger.log('error', `Build failed: ${error.message}`, {
        errorCount: 1,
      });
    });
  }
}

// Export for use in webpack config
export default Fortune500BuildPlugin;
