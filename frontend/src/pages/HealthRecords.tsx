import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Plus,
  Calendar,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  FileText,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import { apiService } from '../services/api';

interface HealthRecord {
  id: string;
  userId: string;
  recordType: 'cycle' | 'symptom' | 'appointment' | 'medication' | 'note';
  date: string;
  data: {
    cycleStart?: string;
    cycleEnd?: string;
    symptoms?: string[];
    severity?: number;
    notes?: string;
    medication?: string;
    dosage?: string;
    appointmentType?: string;
    provider?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const HealthRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await apiService.getHealthRecords?.(userId);
      if (response?.success) {
        setRecords(response.records);
      }
    } catch (err) {
      setError('Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'cycle':
        return <Calendar className="w-5 h-5 text-pink-600" />;
      case 'symptom':
        return <Activity className="w-5 h-5 text-orange-600" />;
      case 'appointment':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'medication':
        return <FileText className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredRecords = selectedType === 'all' 
    ? records 
    : records.filter(r => r.recordType === selectedType);

  const recordTypes = ['all', 'cycle', 'symptom', 'appointment', 'medication', 'note'];

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
                <Heart className="w-8 h-8 text-pink-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
                  <p className="text-sm text-gray-500">Track your health and wellness</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Record
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

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {recordTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedType === type
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Records List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <div className="p-8 flex justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-pink-600" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">No health records yet</p>
              <p className="text-sm text-gray-400 mb-4">Start tracking your health journey</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Add First Record
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredRecords.map((record) => (
                <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      {getRecordIcon(record.recordType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {record.recordType} Record
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {record.recordType === 'cycle' && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Cycle: {record.data.cycleStart} to {record.data.cycleEnd}</p>
                          {record.data.symptoms && (
                            <p className="mt-1">Symptoms: {record.data.symptoms.join(', ')}</p>
                          )}
                        </div>
                      )}
                      
                      {record.recordType === 'symptom' && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Severity: {record.data.severity}/10</p>
                          {record.data.notes && <p className="mt-1">{record.data.notes}</p>}
                        </div>
                      )}
                      
                      {record.recordType === 'medication' && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>{record.data.medication} - {record.data.dosage}</p>
                        </div>
                      )}
                      
                      {record.recordType === 'appointment' && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>{record.data.appointmentType} with {record.data.provider}</p>
                        </div>
                      )}
                      
                      {record.data.notes && (
                        <p className="mt-2 text-sm text-gray-500">{record.data.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        {records.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-pink-600" />
                <span className="text-sm text-gray-600">Cycle Tracking</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {records.filter(r => r.recordType === 'cycle').length}
              </p>
              <p className="text-sm text-gray-500">Cycles logged</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">Symptoms</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {records.filter(r => r.recordType === 'symptom').length}
              </p>
              <p className="text-sm text-gray-500">Symptoms recorded</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">This Month</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {records.filter(r => {
                  const recordDate = new Date(r.date);
                  const now = new Date();
                  return recordDate.getMonth() === now.getMonth() && 
                         recordDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
              <p className="text-sm text-gray-500">Records added</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthRecords;
