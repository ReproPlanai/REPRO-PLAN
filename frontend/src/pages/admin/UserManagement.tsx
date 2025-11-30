import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download, Eye, Edit, Trash2, Plus, Mail, Phone } from 'lucide-react';
import { apiService } from '../../services/api';

interface User {
  id: number;
  secretCode: string;
  surveyLink: string;
  phoneNumber?: string;
  isVerified: boolean;
  isUsed: boolean;
  lastLogin?: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'unused'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use API service (now uses mock data for prototype)
      const { apiService } = await import('../../services/api');
      // Mock: Return empty array for user list (prototype mode)
      setUsers([]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Use empty array for demo
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.secretCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.surveyLink.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(user => user.isVerified && user.isUsed);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(user => !user.isVerified || !user.isUsed);
    } else if (filterStatus === 'unused') {
      filtered = filtered.filter(user => !user.isUsed);
    }

    setFilteredUsers(filtered);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Secret Code', 'Survey Link', 'Phone', 'Verified', 'Used', 'Last Login', 'Created'],
      ...filteredUsers.map(user => [
        user.id,
        user.secretCode,
        user.surveyLink,
        user.phoneNumber || '',
        user.isVerified ? 'Yes' : 'No',
        user.isUsed ? 'Yes' : 'No',
        user.lastLogin || '',
        user.createdAt
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and monitor all platform users</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by code, survey link, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="unused">Unused Codes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">
            {users.filter(u => u.isVerified && u.isUsed).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Unused Codes</p>
          <p className="text-2xl font-semibold text-yellow-600 mt-1">
            {users.filter(u => !u.isUsed).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Verified</p>
          <p className="text-2xl font-semibold text-blue-600 mt-1">
            {users.filter(u => u.isVerified).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Secret Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Survey Link</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">#{user.id}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{user.secretCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">{user.surveyLink}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.phoneNumber ? (
                        <div className="flex items-center space-x-1">
                          <Phone size={14} />
                          <span>{user.phoneNumber}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        {user.isVerified && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verified</span>
                        )}
                        {user.isUsed ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Used</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Unused</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="text-base font-medium text-gray-900">#{selectedUser.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Secret Code</p>
                <p className="text-base font-mono text-gray-900">{selectedUser.secretCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Survey Link</p>
                <p className="text-base text-gray-900 break-all">{selectedUser.surveyLink}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="text-base text-gray-900">{selectedUser.phoneNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  {selectedUser.isVerified && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verified</span>
                  )}
                  {selectedUser.isUsed ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Used</span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Unused</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-base text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </p>
              </div>
              {selectedUser.lastLogin && (
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="text-base text-gray-900">
                    {new Date(selectedUser.lastLogin).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

