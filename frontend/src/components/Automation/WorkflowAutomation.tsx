import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Play, 
  Pause, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Mail, 
  Phone, 
  MessageCircle, 
  FileText, 
  Calendar, 
  Bell, 
  ArrowRight, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  RotateCcw,
  Activity,
  TrendingUp,
  Target,
  Shield,
  Database,
  X
} from 'lucide-react';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'event' | 'schedule' | 'condition' | 'manual';
    condition: string;
    frequency?: string;
  };
  actions: Array<{
    type: 'notification' | 'email' | 'sms' | 'call' | 'assign' | 'escalate' | 'log';
    target: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  isActive: boolean;
  lastExecuted: string;
  executionCount: number;
  successRate: number;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: string;
  endTime?: string;
  duration?: number;
  actionsExecuted: number;
  actionsTotal: number;
  errorMessage?: string;
}

interface WorkflowAutomationProps {
  userRole: string;
  onWorkflowExecuted: (execution: WorkflowExecution) => void;
  onWorkflowCreated: (workflow: WorkflowRule) => void;
  onWorkflowUpdated: (workflow: WorkflowRule) => void;
}

const WorkflowAutomation: React.FC<WorkflowAutomationProps> = ({
  userRole,
  onWorkflowExecuted,
  onWorkflowCreated,
  onWorkflowUpdated
}) => {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Initialize sample workflows
  useEffect(() => {
    const sampleWorkflows: WorkflowRule[] = [
      {
        id: '1',
        name: 'Emergency Response Automation',
        description: 'Automatically notify emergency contacts when panic button is activated',
        trigger: {
          type: 'event',
          condition: 'panic_button_activated'
        },
        actions: [
          {
            type: 'notification',
            target: 'police_team',
            message: 'Emergency alert: Panic button activated in Monrovia Central',
            priority: 'critical'
          },
          {
            type: 'sms',
            target: 'emergency_contacts',
            message: 'URGENT: Emergency assistance needed at current location',
            priority: 'critical'
          },
          {
            type: 'assign',
            target: 'nearest_officer',
            message: 'Assign to Officer Johnson - Priority: Critical',
            priority: 'high'
          }
        ],
        isActive: true,
        lastExecuted: new Date(Date.now() - 1800000).toISOString(),
        executionCount: 23,
        successRate: 95.7
      },
      {
        id: '2',
        name: 'Case Escalation',
        description: 'Automatically escalate cases that have been pending for more than 48 hours',
        trigger: {
          type: 'condition',
          condition: 'case_pending > 48_hours'
        },
        actions: [
          {
            type: 'email',
            target: 'supervisor',
            message: 'Case escalation required: Case has been pending for 48+ hours',
            priority: 'high'
          },
          {
            type: 'notification',
            target: 'case_owner',
            message: 'Your case has been escalated due to extended pending time',
            priority: 'medium'
          }
        ],
        isActive: true,
        lastExecuted: new Date(Date.now() - 3600000).toISOString(),
        executionCount: 8,
        successRate: 100
      },
      {
        id: '3',
        name: 'Daily Report Generation',
        description: 'Generate and send daily activity reports to stakeholders',
        trigger: {
          type: 'schedule',
          condition: 'daily',
          frequency: '18:00'
        },
        actions: [
          {
            type: 'email',
            target: 'stakeholders',
            message: 'Daily activity report is ready for review',
            priority: 'low'
          },
          {
            type: 'log',
            target: 'system',
            message: 'Daily report generated and distributed',
            priority: 'low'
          }
        ],
        isActive: true,
        lastExecuted: new Date(Date.now() - 7200000).toISOString(),
        executionCount: 156,
        successRate: 98.1
      }
    ];

    setWorkflows(sampleWorkflows);
  }, []);

  // Initialize sample executions
  useEffect(() => {
    const sampleExecutions: WorkflowExecution[] = [
      {
        id: '1',
        workflowId: '1',
        workflowName: 'Emergency Response Automation',
        status: 'completed',
        startTime: new Date(Date.now() - 1800000).toISOString(),
        endTime: new Date(Date.now() - 1790000).toISOString(),
        duration: 10,
        actionsExecuted: 3,
        actionsTotal: 3
      },
      {
        id: '2',
        workflowId: '2',
        workflowName: 'Case Escalation',
        status: 'running',
        startTime: new Date(Date.now() - 300000).toISOString(),
        actionsExecuted: 1,
        actionsTotal: 2
      },
      {
        id: '3',
        workflowId: '3',
        workflowName: 'Daily Report Generation',
        status: 'completed',
        startTime: new Date(Date.now() - 7200000).toISOString(),
        endTime: new Date(Date.now() - 7195000).toISOString(),
        duration: 5,
        actionsExecuted: 2,
        actionsTotal: 2
      }
    ];

    setExecutions(sampleExecutions);
  }, []);

  const executeWorkflow = async (workflowId: string) => {
    setIsExecuting(true);
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const execution: WorkflowExecution = {
      id: Date.now().toString(),
      workflowId,
      workflowName: workflow.name,
      status: 'running',
      startTime: new Date().toISOString(),
      actionsExecuted: 0,
      actionsTotal: workflow.actions.length
    };

    setExecutions(prev => [execution, ...prev]);

    // Simulate workflow execution
    for (let i = 0; i < workflow.actions.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setExecutions(prev => prev.map(exec => 
        exec.id === execution.id 
          ? { ...exec, actionsExecuted: i + 1 }
          : exec
      ));
    }

    // Complete execution
    const completedExecution: WorkflowExecution = {
      ...execution,
      status: 'completed',
      endTime: new Date().toISOString(),
      duration: workflow.actions.length
    };

    setExecutions(prev => prev.map(exec => 
      exec.id === execution.id ? completedExecution : exec
    ));

    // Update workflow stats
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { 
            ...w, 
            lastExecuted: new Date().toISOString(),
            executionCount: w.executionCount + 1
          }
        : w
    ));

    onWorkflowExecuted(completedExecution);
    setIsExecuting(false);
  };

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const getStatusColor = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <Activity className="w-4 h-4 animate-pulse" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActionIcon = (type: WorkflowRule['actions'][0]['type']) => {
    switch (type) {
      case 'notification': return <Bell className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageCircle className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'assign': return <Users className="w-4 h-4" />;
      case 'escalate': return <TrendingUp className="w-4 h-4" />;
      case 'log': return <FileText className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Workflow Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>Workflow Automation</span>
          </h3>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workflow</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {workflows.filter(w => w.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active Workflows</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {executions.filter(e => e.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed Executions</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Rules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Workflow Rules</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      workflow.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Trigger: {workflow.trigger.type}</span>
                    <span>•</span>
                    <span>Executions: {workflow.executionCount}</span>
                    <span>•</span>
                    <span>Success: {workflow.successRate}%</span>
                    <span>•</span>
                    <span>Last run: {formatTimeAgo(workflow.lastExecuted)}</span>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Actions:</div>
                    <div className="flex flex-wrap gap-2">
                      {workflow.actions.map((action, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs"
                        >
                          {getActionIcon(action.type)}
                          <span>{action.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => executeWorkflow(workflow.id)}
                    disabled={isExecuting || !workflow.isActive}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                    title="Execute Workflow"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWorkflow(workflow.id)}
                    className={`p-2 rounded-lg ${
                      workflow.isActive 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={workflow.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="Copy">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Executions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Executions</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {executions.slice(0, 5).map((execution) => (
            <div key={execution.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{execution.workflowName}</div>
                    <div className="text-sm text-gray-600">
                      {execution.actionsExecuted}/{execution.actionsTotal} actions completed
                    </div>
                    <div className="text-xs text-gray-500">
                      Started: {formatTimeAgo(execution.startTime)}
                      {execution.duration && ` • Duration: ${execution.duration}s`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(execution.status)}`}>
                    {getStatusIcon(execution.status)}
                    <span className="ml-1 capitalize">{execution.status}</span>
                  </span>
                  
                  {execution.status === 'running' && (
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(execution.actionsExecuted / execution.actionsTotal) * 100}%` 
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Workflow Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Create New Workflow</h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Workflow Builder</h4>
                <p className="text-gray-600 mb-6">
                  Create automated workflows to streamline your emergency response processes.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Start Building
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowAutomation;
