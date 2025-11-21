import React, { useState } from 'react';
import { Target, Users, Calendar, DollarSign, TrendingUp, MapPin, FileText, Edit } from 'lucide-react';

interface Program {
  id: number;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  beneficiaries: number;
  budget: string;
  status: string;
  progress: number;
  objectives: string[];
  activities: string[];
}

const ProgramDetails: React.FC<{ programId?: number }> = ({ programId }) => {
  const [program] = useState<Program>({
    id: programId || 1,
    name: 'SRHR Education Initiative',
    description: 'Comprehensive sexual and reproductive health education program for youth in schools and communities',
    location: 'Accra, Kumasi, Tamale',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    beneficiaries: 450,
    budget: '$25,000',
    status: 'Active',
    progress: 65,
    objectives: [
      'Increase SRHR knowledge among 500+ youth',
      'Reduce teenage pregnancy rates by 20%',
      'Improve access to contraceptives',
      'Build capacity of 50 peer educators'
    ],
    activities: [
      'School workshops and seminars',
      'Community outreach programs',
      'Peer educator training',
      'Resource distribution',
      'Follow-up counseling sessions'
    ]
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{program.name}</h2>
          <p className="text-sm text-gray-600 mt-1">Program details and management</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Edit size={16} />
          <span>Edit Program</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Beneficiaries</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{program.beneficiaries}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Budget</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{program.budget}</p>
            </div>
            <DollarSign className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{program.progress}%</p>
            </div>
            <TrendingUp className="text-purple-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{program.status}</p>
            </div>
            <Target className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Program Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Information</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Description</p>
            <p className="text-base text-gray-900">{program.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin size={18} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-base font-medium text-gray-900">{program.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Objectives</h3>
        <ul className="space-y-2">
          {program.objectives.map((objective, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span className="text-base text-gray-900">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {program.activities.map((activity, idx) => (
            <div key={idx} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <FileText size={16} className="text-gray-400" />
              <span className="text-sm text-gray-900">{activity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Program Progress</h3>
          <span className="text-sm font-medium text-gray-600">{program.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${program.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetails;

