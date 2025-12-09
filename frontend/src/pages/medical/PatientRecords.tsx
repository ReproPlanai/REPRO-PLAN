import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Calendar, Heart, Pill } from 'lucide-react';
import { apiService } from '../../services/api';
import { secretCodeManager } from '../../utils/secretCode';

interface PatientRecord {
  id: number;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  visitDate: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  nextAppointment?: string;
}

const PatientRecords: React.FC = () => {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      const userId = secretCodeManager.getUserId();
      const numericUserId = typeof userId === 'string' ? Number(userId) : userId;

      if (!numericUserId || Number.isNaN(numericUserId)) {
        console.warn('No user ID available for health records');
        return;
      }

      const response = await apiService.getHealthRecords(numericUserId) as { success: boolean; records?: any[] };
      if (response.success && response.records) {
        // Transform API data to match component interface
        const transformedRecords = response.records.map((record: any, index: number) => ({
          id: record.id || index + 1,
          patientId: `PAT-${String(numericUserId).padStart(3, '0')}`,
          name: 'Anonymous Patient', // Maintain privacy
          age: 25, // Default age since API may not provide
          gender: 'Not specified', // Maintain privacy
          condition: record.recordType || 'Health Record',
          visitDate: new Date(record.createdAt).toLocaleDateString(),
          diagnosis: record.data?.diagnosis || 'Record available',
          treatment: record.data?.treatment || 'Treatment provided',
          medications: record.data?.medications || [],
          nextAppointment: record.data?.nextAppointment
        }));
        setRecords(transformedRecords);
      }
    } catch (error) {
      console.error('Failed to fetch health records:', error);
      // Set empty array instead of sample data
      setRecords([]);
    }
  };

  const filteredRecords = records.filter(record =>
    record.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Patient Records</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and view patient medical records</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus size={16} />
          <span>New Record</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by patient ID, name, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Records List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedRecord(record)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{record.name}</h3>
                <p className="text-sm text-gray-600">{record.patientId}</p>
              </div>
              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                <Eye size={16} />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-600">{record.visitDate}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Heart size={14} className="text-gray-400" />
                <span className="text-gray-600">{record.condition}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Pill size={14} className="text-gray-400" />
                <span className="text-gray-600">{record.medications.length} medications</span>
              </div>
            </div>
            {record.nextAppointment && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">Next Appointment</p>
                <p className="text-sm font-medium text-blue-600">{record.nextAppointment}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Record Details</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Patient ID</p>
                  <p className="text-base font-medium text-gray-900">{selectedRecord.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-base font-medium text-gray-900">{selectedRecord.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="text-base font-medium text-gray-900">{selectedRecord.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="text-base font-medium text-gray-900">{selectedRecord.gender}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Condition</p>
                <p className="text-base font-medium text-gray-900">{selectedRecord.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Visit Date</p>
                <p className="text-base font-medium text-gray-900">{selectedRecord.visitDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Diagnosis</p>
                <p className="text-base text-gray-900">{selectedRecord.diagnosis}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Treatment</p>
                <p className="text-base text-gray-900">{selectedRecord.treatment}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Medications</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.medications.map((med, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {med}
                    </span>
                  ))}
                </div>
              </div>
              {selectedRecord.nextAppointment && (
                <div>
                  <p className="text-sm text-gray-600">Next Appointment</p>
                  <p className="text-base font-medium text-blue-600">{selectedRecord.nextAppointment}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;

