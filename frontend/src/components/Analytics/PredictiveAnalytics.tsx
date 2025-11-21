import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Users, 
  MapPin,
  Clock,
  Target,
  Brain,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';
import SecureDataViewer from '../DataVisualization/SecureDataViewer';
import { dataSecurityManager } from '../../utils/dataSecurity';

interface RiskAssessment {
  id: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  probability: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  timeframe: string;
  confidence: number;
}

interface TrendAnalysis {
  metric: string;
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  prediction: number;
  confidence: number;
}

interface PredictiveInsight {
  id: string;
  type: 'risk' | 'opportunity' | 'anomaly' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  actionable: boolean;
}

interface PredictiveAnalyticsProps {
  userRole: string;
  onDataAccess: (data: any) => void;
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  userRole,
  onDataAccess
}) => {
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Generate sample predictive data
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const sampleRiskAssessments: RiskAssessment[] = [
        {
          id: '1',
          location: 'Monrovia Central',
          riskLevel: 'high',
          factors: ['Increased domestic violence reports', 'Economic stress indicators', 'Weather patterns'],
          probability: 78,
          impact: 'high',
          recommendation: 'Increase patrol frequency and deploy additional resources',
          timeframe: 'Next 48 hours',
          confidence: 85
        },
        {
          id: '2',
          location: 'Gbarnga District',
          riskLevel: 'medium',
          factors: ['Youth unemployment spike', 'Social media sentiment analysis'],
          probability: 45,
          impact: 'medium',
          recommendation: 'Community outreach programs and youth engagement',
          timeframe: 'Next 2 weeks',
          confidence: 72
        }
      ];

      const sampleTrendAnalysis: TrendAnalysis[] = [
        {
          metric: 'Emergency Response Time',
          current: 4.2,
          previous: 5.1,
          trend: 'up',
          change: 17.6,
          prediction: 3.8,
          confidence: 88
        },
        {
          metric: 'Case Resolution Rate',
          current: 78,
          previous: 72,
          trend: 'up',
          change: 8.3,
          prediction: 82,
          confidence: 91
        },
        {
          metric: 'Community Trust Score',
          current: 7.2,
          previous: 6.8,
          trend: 'up',
          change: 5.9,
          prediction: 7.6,
          confidence: 76
        }
      ];

      const sampleInsights: PredictiveInsight[] = [
        {
          id: '1',
          type: 'risk',
          title: 'Potential Domestic Violence Spike',
          description: 'AI analysis suggests 23% increase in domestic violence cases based on economic indicators and historical patterns.',
          confidence: 87,
          impact: 'high',
          timeframe: 'Next 2 weeks',
          actionable: true
        },
        {
          id: '2',
          type: 'opportunity',
          title: 'Community Engagement Opportunity',
          description: 'High engagement potential identified in Gbarnga district. Recommended community programs could increase trust by 15%.',
          confidence: 82,
          impact: 'medium',
          timeframe: 'Next month',
          actionable: true
        },
        {
          id: '3',
          type: 'anomaly',
          title: 'Unusual Activity Pattern Detected',
          description: 'Anomalous communication patterns detected in certain areas. Recommend investigation.',
          confidence: 94,
          impact: 'critical',
          timeframe: 'Immediate',
          actionable: true
        }
      ];

      setRiskAssessments(sampleRiskAssessments);
      setTrendAnalysis(sampleTrendAnalysis);
      setInsights(sampleInsights);
      setIsLoading(false);
    }, 2000);
  }, [selectedTimeframe]);

  const getRiskColor = (level: RiskAssessment['riskLevel']) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightIcon = (type: PredictiveInsight['type']) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'opportunity': return <Target className="w-5 h-5 text-green-500" />;
      case 'anomaly': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'pattern': return <Brain className="w-5 h-5 text-blue-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: PredictiveInsight['type']) => {
    switch (type) {
      case 'risk': return 'bg-red-50 border-red-200';
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'anomaly': return 'bg-yellow-50 border-yellow-200';
      case 'pattern': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const handleDataAccess = (data: any) => {
    dataSecurityManager.logDataAccess({
      timestamp: new Date().toISOString(),
      userRole,
      dataType: 'predictive_analytics',
      accessGranted: true
    });
    onDataAccess(data);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-lg font-medium text-gray-600">AI Analysis in Progress...</span>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          Processing data patterns and generating insights
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Predictive Analytics</h2>
              <p className="text-sm text-gray-600">AI-powered insights and risk assessment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-500" />
            <span>AI-Generated Insights</span>
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Impact: {insight.impact}</span>
                      <span>Timeframe: {insight.timeframe}</span>
                      {insight.actionable && (
                        <span className="text-green-600 font-medium">Actionable</span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Target size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-500" />
              <span>Risk Assessment</span>
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {riskAssessments.map((risk) => (
              <div key={risk.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="font-medium text-gray-900">{risk.location}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getRiskColor(risk.riskLevel)}`}>
                    {risk.riskLevel.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Probability</span>
                    <span className="font-medium">{risk.probability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        risk.riskLevel === 'critical' ? 'bg-red-500' :
                        risk.riskLevel === 'high' ? 'bg-orange-500' :
                        risk.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${risk.probability}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">{risk.recommendation}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Timeframe: {risk.timeframe}</span>
                    <span>Confidence: {risk.confidence}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span>Trend Analysis</span>
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {trendAnalysis.map((trend, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{trend.metric}</span>
                  <div className="flex items-center space-x-1">
                    {trend.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : trend.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      trend.trend === 'up' ? 'text-green-600' :
                      trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Current</div>
                    <div className="font-medium">{trend.current}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Previous</div>
                    <div className="font-medium">{trend.previous}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Prediction</div>
                    <div className="font-medium text-blue-600">{trend.prediction}</div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Confidence: {trend.confidence}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Predictive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecureDataViewer
          data={[
            { name: 'Low Risk', value: 45 },
            { name: 'Medium Risk', value: 30 },
            { name: 'High Risk', value: 20 },
            { name: 'Critical Risk', value: 5 }
          ]}
          chartType="pie"
          title="Risk Distribution Prediction"
          description="AI-predicted risk levels for the next 30 days"
          userRole={userRole}
          onDataAccess={handleDataAccess}
        />
        
        <SecureDataViewer
          data={[
            { name: 'Week 1', value: 12 },
            { name: 'Week 2', value: 18 },
            { name: 'Week 3', value: 15 },
            { name: 'Week 4', value: 22 },
            { name: 'Week 5', value: 28 },
            { name: 'Week 6', value: 25 }
          ]}
          chartType="line"
          title="Emergency Prediction Trend"
          description="Predicted emergency incidents over the next 6 weeks"
          userRole={userRole}
          onDataAccess={handleDataAccess}
        />
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
