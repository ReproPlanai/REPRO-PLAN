import React, { useState } from 'react';
import { Plus, Search, Eye, MapPin, Clock } from 'lucide-react';
import { useStakeholderAPI } from '../../hooks/useStakeholderAPI';

interface IncidentReport {
  id: number;
  caseNumber: string;
  type: string;
  location: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: string;
  priority: string;
  assignedTo?: string;
}

const IncidentReports: React.FC<{ userData: any }> = ({ userData }) => {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showNewReport, setShowNewReport] = useState(false); // Reserved for future modal implementation
  const stakeholderAPI = useStakeholderAPI({ role: 'POLICE', stakeholderId: userData?.id });

  // Convert cases to incident reports
  React.useEffect(() => {
    const incidentReports: IncidentReport[] = stakeholderAPI.cases.map(caseRecord => ({
      id: caseRecord.id,
      caseNumber: caseRecord.caseNumber,
      type: caseRecord.caseType,
      location: `${caseRecord.location?.address || 'Unknown'}, ${caseRecord.location?.city || 'Ghana'}`,
      description: caseRecord.description,
      reportedBy: 'Anonymous',
      reportedAt: caseRecord.createdAt,
      status: caseRecord.status,
      priority: caseRecord.priority,
      assignedTo: caseRecord.assignedRole
    }));
    setReports(incidentReports);
  }, [stakeholderAPI.cases]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Incident Reports</h2>
          <p className="text-sm text-gray-600 mt-1">View and manage all incident reports</p>
        </div>
        <button
          onClick={() => setShowNewReport(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>New Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{report.caseNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{report.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span className="truncate max-w-xs">{report.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{new Date(report.reportedAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      report.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncidentReports;

