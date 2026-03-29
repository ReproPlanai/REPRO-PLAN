import React, { useEffect, useRef } from 'react';
import { Fortune500Logger, useLogger, LogLevel, LogEntry } from '../services/logger';

interface LogViewerProps {
  maxEntries?: number;
  filterLevel?: LogLevel;
  showTimestamp?: boolean;
  showMetadata?: boolean;
  className?: string;
}

/**
 * Fortune 500 Log Viewer Component
 * Displays real-time application logs in a structured format
 */
export const LogViewer: React.FC<LogViewerProps> = ({
  maxEntries = 100,
  filterLevel = 'debug',
  showTimestamp = true,
  showMetadata = true,
  className = '',
}) => {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentFilterLevel, setCurrentFilterLevel] = React.useState<LogLevel>(filterLevel);
  const logEndRef = useRef<HTMLDivElement>(null);
  const logger = useLogger('LogViewer');

  useEffect(() => {
    // Capture all log entries
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    const captureLog = (level: LogLevel, args: any[]) => {
      const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        levelValue: level === 'error' ? 50 : level === 'warn' ? 40 : 30,
        message,
        service: 'repro-plan-frontend',
        version: '3.0.0',
        environment: process.env.NODE_ENV || 'development',
      };

      setLogs(prev => [...prev.slice(-maxEntries), entry]);
    };

    // Override console methods to capture logs
    console.log = (...args) => {
      originalConsoleLog(...args);
      captureLog('info', args);
    };
    console.error = (...args) => {
      originalConsoleError(...args);
      captureLog('error', args);
    };
    console.warn = (...args) => {
      originalConsoleWarn(...args);
      captureLog('warn', args);
    };

    logger.info('LogViewer initialized', { maxEntries, filterLevel: currentFilterLevel });

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [maxEntries, currentFilterLevel, logger]);

  // Auto-scroll to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(log => {
    const levelMatch = log.levelValue >= getLevelValue(currentFilterLevel);
    const searchMatch = !searchTerm || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.component?.toLowerCase().includes(searchTerm.toLowerCase());
    return levelMatch && searchMatch;
  });

  const getLevelValue = (level: LogLevel): number => {
    const values: Record<LogLevel, number> = {
      fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10
    };
    return values[level] || 30;
  };

  const getLevelColor = (level: LogLevel): string => {
    const colors: Record<LogLevel, string> = {
      fatal: 'bg-red-900 text-white',
      error: 'bg-red-100 text-red-800',
      warn: 'bg-amber-100 text-amber-800',
      info: 'bg-blue-100 text-blue-800',
      debug: 'bg-gray-100 text-gray-600',
      trace: 'bg-gray-50 text-gray-400',
    };
    return colors[level];
  };

  const getLevelIcon = (level: LogLevel): string => {
    const icons: Record<LogLevel, string> = {
      fatal: '💀', error: '❌', warn: '⚠️', info: 'ℹ️', debug: '🔍', trace: '🔬',
    };
    return icons[level];
  };

  const exportLogs = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repro-plan-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logger.info('Logs exported', { count: filteredLogs.length });
  };

  const clearLogs = () => {
    setLogs([]);
    logger.info('Logs cleared');
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors z-50"
      >
        📝 Logs ({logs.length})
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 max-h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white rounded-t-xl">
        <h3 className="font-semibold text-sm">📊 Fortune 500 Log Viewer</h3>
        <div className="flex items-center gap-2">
          <button onClick={exportLogs} className="text-xs hover:text-blue-300" title="Export">
            💾
          </button>
          <button onClick={clearLogs} className="text-xs hover:text-red-300" title="Clear">
            🗑️
          </button>
          <button onClick={() => setIsExpanded(false)} className="text-lg hover:text-gray-300">
            ×
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-gray-100 space-y-2">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <select
            value={currentFilterLevel}
            onChange={(e) => setCurrentFilterLevel(e.target.value as LogLevel)}
            className="border border-gray-200 rounded px-2 py-1"
          >
            <option value="trace">Trace</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
          <span>{filteredLogs.length} / {logs.length} entries</span>
        </div>
      </div>

      {/* Log entries */}
      <div className="overflow-y-auto max-h-80 p-2 space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`text-xs p-2 rounded-lg ${getLevelColor(log.level)} border`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs">{getLevelIcon(log.level)}</span>
                <div className="flex-1 min-w-0">
                  {showTimestamp && (
                    <div className="text-[10px] opacity-70">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                  <div className="font-medium break-words">{log.message}</div>
                  {showMetadata && log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="text-[10px] opacity-70 mt-1 font-mono">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 rounded-b-xl border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>Session: {logs[0]?.sessionId?.slice(0, 8) || 'N/A'}</span>
        <span>v{logs[0]?.version || '3.0.0'}</span>
      </div>
    </div>
  );
};

export default LogViewer;
