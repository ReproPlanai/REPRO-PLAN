import React, { useState, useEffect } from 'react';
import {
  Heart,
  Plus,
  Calendar,
  RefreshCw,
  AlertTriangle,
  FileText,
  Activity,
  Clock,
  Sparkles,
  Search
} from 'lucide-react';
import { apiService } from '../services/api';
import PageContainer from '../components/Layout/PageContainer';

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
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
        return <Calendar className="w-6 h-6 text-pink-600" />;
      case 'symptom':
        return <Activity className="w-6 h-6 text-orange-600" />;
      case 'appointment':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'medication':
        return <FileText className="w-6 h-6 text-green-600" />;
      default:
        return <FileText className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'cycle':
        return 'from-pink-500 to-rose-500';
      case 'symptom':
        return 'from-orange-500 to-amber-500';
      case 'appointment':
        return 'from-blue-500 to-indigo-500';
      case 'medication':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const filteredRecords = selectedType === 'all'
    ? records.filter(r => 
        r.recordType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.data.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : records.filter(r => 
        r.recordType === selectedType &&
        (r.recordType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.data.notes?.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  const recordTypes = [
    { value: 'all', label: 'All Records' },
    { value: 'cycle', label: 'Cycle Tracking' },
    { value: 'symptom', label: 'Symptoms' },
    { value: 'appointment', label: 'Appointments' },
    { value: 'medication', label: 'Medications' },
    { value: 'note', label: 'Notes' }
  ];

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 p-6 sm:p-8 shadow-2xl shadow-pink-500/20 mb-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.05)_100%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Health</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Health Records</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Track your health and wellness with comprehensive records for cycles, symptoms, appointments, and more.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Calendar, title: records.filter(r => r.recordType === 'cycle').length.toString(), desc: 'Cycles', color: 'from-pink-500 to-rose-500' },
            { icon: Activity, title: records.filter(r => r.recordType === 'symptom').length.toString(), desc: 'Symptoms', color: 'from-orange-500 to-amber-500' },
            { icon: Clock, title: records.filter(r => r.recordType === 'appointment').length.toString(), desc: 'Appointments', color: 'from-blue-500 to-indigo-500' },
            { icon: FileText, title: records.filter(r => r.recordType === 'medication').length.toString(), desc: 'Medications', color: 'from-green-500 to-emerald-500' }
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={desc} className="flex items-center gap-3 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {recordTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>
        </div>

        {/* Records Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-pink-600" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No health records found</p>
            <p className="text-sm text-gray-400 mb-4">Start tracking your health journey</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              Add First Record
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className={`bg-gradient-to-r ${getRecordColor(record.recordType)} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {getRecordIcon(record.recordType)}
                    </div>
                    <span className="text-xs text-white/90">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-base mb-2 capitalize">
                    {record.recordType} Record
                  </h3>
                  
                  {record.recordType === 'cycle' && record.data.cycleStart && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Cycle:</span> {record.data.cycleStart} to {record.data.cycleEnd}
                      </p>
                      {record.data.symptoms && (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Symptoms:</span> {record.data.symptoms.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {record.recordType === 'symptom' && record.data.severity && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Severity:</span> {record.data.severity}/10
                      </p>
                      {record.data.notes && (
                        <p className="text-sm text-gray-500 mt-1">{record.data.notes}</p>
                      )}
                    </div>
                  )}
                  
                  {record.recordType === 'medication' && record.data.medication && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{record.data.medication}</span>
                      </p>
                      {record.data.dosage && (
                        <p className="text-sm text-gray-500 mt-1">{record.data.dosage}</p>
                      )}
                    </div>
                  )}
                  
                  {record.recordType === 'appointment' && record.data.appointmentType && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{record.data.appointmentType}</span>
                      </p>
                      {record.data.provider && (
                        <p className="text-sm text-gray-500 mt-1">with {record.data.provider}</p>
                      )}
                    </div>
                  )}
                  
                  {record.data.notes && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{record.data.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Record Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Add Health Record</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                      <option value="cycle">Cycle Tracking</option>
                      <option value="symptom">Symptom</option>
                      <option value="appointment">Appointment</option>
                      <option value="medication">Medication</option>
                      <option value="note">Note</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Add any additional details..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      Save Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageContainer>
  );
};

export default HealthRecords;
