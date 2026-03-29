import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Workflow as WorkflowIcon,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Calendar
} from 'lucide-react';
import { apiService } from '../services/api';

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  trigger_conditions: any;
  actions: any[];
  is_active: boolean;
  run_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

const WorkflowManager: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await apiService.getWorkflows?.();
      if (response?.success) {
        setWorkflows(response.workflows);
      }
    } catch (err) {
      setError('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (id: string, isActive: boolean) => {
    try {
      const response = await apiService.updateWorkflow?.(id, { isActive: !isActive });
      if (response?.success) {
        setWorkflows(workflows.map(w => w.id === id ? response.workflow : w));
      }
    } catch (err) {
      setError('Failed to update workflow');
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      await apiService.deleteWorkflow?.(id);
      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (err) {
      setError('Failed to delete workflow');
    }
  };

  const runWorkflow = async (id: string) => {
    try {
      const response = await apiService.executeWorkflow?.(id);
      if (response?.success) {
        setExecutions([response.execution, ...executions]);
      }
    } catch (err) {
      setError('Failed to execute workflow');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <WorkflowIcon className="w-8 h-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Workflow Manager</h1>
                  <p className="text-sm text-gray-500">Automate tasks and processes</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Workflow
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <WorkflowIcon className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-gray-600">Total Workflows</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {workflows.filter(w => w.is_active).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-600">Executions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {workflows.reduce((acc, w) => acc + w.run_count, 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Last Run</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {executions.length > 0 ? 'Just now' : 'Never'}
            </p>
          </div>
        </div>

        {/* Workflows List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <div className="p-8 flex justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : workflows.length === 0 ? (
            <div className="p-8 text-center">
              <WorkflowIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">No workflows yet</p>
              <p className="text-sm text-gray-400 mb-4">Create your first automation workflow</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Workflow
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${workflow.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {getStatusIcon(workflow.is_active ? 'active' : 'paused')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(workflow.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {workflow.run_count} runs
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {workflow.category}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {workflow.trigger_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => runWorkflow(workflow.id)}
                        className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                        title="Run now"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleWorkflow(workflow.id, workflow.is_active)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={workflow.is_active ? 'Pause' : 'Activate'}
                      >
                        {workflow.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setSelectedWorkflow(workflow)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteWorkflow(workflow.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Executions */}
        {executions.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Executions</h3>
            <div className="space-y-2">
              {executions.slice(0, 5).map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {execution.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {execution.status === 'running' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
                    {execution.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    <span className="text-sm font-medium text-gray-900">{execution.workflow_id.slice(0, 8)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                      execution.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {execution.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(execution.started_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowManager;
