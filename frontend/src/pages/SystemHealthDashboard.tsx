import React, { useState, useEffect } from 'react';
import { 
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Server,
  Database,
  Shield,
  Zap,
  Monitor,
  Camera,
  MapPin,
  Bell,
  Volume2,
  ChevronDown,
  Download,
  Info
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import { testingService, SystemHealthReport } from '../services/testingService';

interface MetricCard {
  title: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warning' | 'critical';
  icon: any;
  trend?: 'up' | 'down' | 'stable';
}

const SystemHealthDashboard: React.FC = () => {
  const [healthReport, setHealthReport] = useState<SystemHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    runHealthCheck();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        runHealthCheck();
      }, 60000); // Refresh every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      const report = await testingService.runSystemHealthCheck();
      setHealthReport(report);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTestExpansion = (testName: string) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testName)) {
      newExpanded.delete(testName);
    } else {
      newExpanded.add(testName);
    }
    setExpandedTests(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'healthy':
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'fail':
      case 'unhealthy':
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'healthy':
      case 'good':
        return CheckCircle;
      case 'warning':
      case 'degraded':
        return AlertTriangle;
      case 'fail':
      case 'unhealthy':
      case 'critical':
        return XCircle;
      default:
        return Activity;
    }
  };

  const getOverallStatusIcon = () => {
    if (!healthReport) return Activity;
    return getStatusIcon(healthReport.overall);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const exportHealthReport = () => {
    if (!healthReport) return;

    const reportData = {
      ...healthReport,
      timestamp: healthReport.timestamp.toISOString(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const metricCards: MetricCard[] = healthReport ? [
    {
      title: 'Page Load Time',
      value: formatDuration(healthReport.performance.pageLoadTime),
      status: healthReport.performance.pageLoadTime < 3000 ? 'good' : healthReport.performance.pageLoadTime < 5000 ? 'warning' : 'critical',
      icon: Clock,
      trend: 'stable'
    },
    {
      title: 'API Response Time',
      value: formatDuration(healthReport.performance.apiResponseTime),
      status: healthReport.performance.apiResponseTime < 1000 ? 'good' : healthReport.performance.apiResponseTime < 2000 ? 'warning' : 'critical',
      icon: Server,
      trend: 'stable'
    },
    {
      title: 'Memory Usage',
      value: healthReport.performance.memoryUsage.toFixed(1),
      unit: '%',
      status: healthReport.performance.memoryUsage < 70 ? 'good' : healthReport.performance.memoryUsage < 85 ? 'warning' : 'critical',
      icon: Monitor,
      trend: 'stable'
    },
    {
      title: 'Tests Passed',
      value: `${healthReport.tests.filter(t => t.status === 'pass').length}/${healthReport.tests.length}`,
      status: healthReport.overall === 'healthy' ? 'good' : healthReport.overall === 'degraded' ? 'warning' : 'critical',
      icon: CheckCircle,
      trend: 'stable'
    }
  ] : [];

  return (
    <PageContainer gradient>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-6 sm:p-8 shadow-2xl shadow-green-500/20 mb-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.05)_100%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">System</span>
                <Zap className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">System Health Dashboard</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Monitor system performance, API connectivity, and service availability.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </button>
              <button
                onClick={runHealthCheck}
                disabled={isLoading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Checking...' : 'Check Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        {healthReport && (
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${getStatusColor(healthReport.overall)}`}>
                  {React.createElement(getOverallStatusIcon(), { className: "w-6 h-6" })}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                  <p className="text-sm text-gray-500">
                    Overall health: <span className="font-medium capitalize">{healthReport.overall}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Last check: {lastCheck?.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricCards.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200/60">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                      {metric.unit && <span className="text-sm text-gray-500">{metric.unit}</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{metric.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Test Results */}
        {healthReport && (
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
              <button
                onClick={exportHealthReport}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>

            <div className="space-y-3">
              {healthReport.tests.map((test, index) => {
                const StatusIcon = getStatusIcon(test.status);
                const isExpanded = expandedTests.has(test.name);
                
                return (
                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleTestExpansion(test.name)}
                      className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(test.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-gray-900">{test.name}</h3>
                          <p className="text-sm text-gray-600">{test.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{formatDuration(test.duration)}</span>
                        {test.details && (
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </button>
                    
                    {isExpanded && test.details && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Service Status */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Service Availability</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'API Server', icon: Server, test: 'API Connectivity' },
              { name: 'Local Storage', icon: Database, test: 'Local Storage' },
              { name: 'Session Storage', icon: Database, test: 'Session Storage' },
              { name: 'Speech Synthesis', icon: Volume2, test: 'Speech Synthesis' },
              { name: 'Geolocation', icon: MapPin, test: 'Geolocation' },
              { name: 'Camera Access', icon: Camera, test: 'Camera Access' },
              { name: 'Notifications', icon: Bell, test: 'Notification Access' },
              { name: 'Authentication', icon: Shield, test: 'Authentication' }
            ].map((service, index) => {
              const Icon = service.icon;
              const testResult = healthReport?.tests.find(t => t.name === service.test);
              const StatusIcon = testResult ? getStatusIcon(testResult.status) : Activity;
              
              return (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className={`p-2 rounded-lg ${testResult ? getStatusColor(testResult.status) : 'text-gray-600 bg-gray-100'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{service.name}</h3>
                    <p className="text-xs text-gray-500">
                      {testResult ? testResult.message : 'Not tested'}
                    </p>
                  </div>
                  {testResult && React.createElement(StatusIcon, { className: "w-4 h-4 text-gray-400" })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">About System Health Monitoring</h3>
              <p className="text-blue-800 text-sm">
                This dashboard monitors the health and performance of the REPRO PLAN application. 
                Tests run automatically check API connectivity, storage functionality, and browser feature availability. 
                Use this information to diagnose issues and ensure optimal performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SystemHealthDashboard;
