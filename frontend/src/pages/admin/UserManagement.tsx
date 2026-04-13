import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Plus, Phone } from 'lucide-react';
import { apiService } from '../../services/api';
import PageContainer from '../../components/Layout/PageContainer';
import { AdminCard, AdminButton, AdminInput, AdminBadge } from '../../components/Admin';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchQuery, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUsers() as { success: boolean; users?: any[] };

      if (response.success && response.users) {
        setUsers(response.users);
      } else {
      setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
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

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage user accounts and access codes</p>
          </div>
          <AdminButton
            icon={<Plus size={18} />}
            loading={loading}
          >
          </AdminButton>
        </div>

        {/* Filters */}
        <AdminCard padding="md" shadow="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <AdminInput
                type="text"
                placeholder="Search by code, survey link, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={18} />}
                fullWidth
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="unused">Unused Codes</option>
              </select>
            </div>
          </div>
        </AdminCard>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AdminCard hover padding="md" shadow="lg">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{users.length}</p>
          </AdminCard>
          <AdminCard hover padding="md" shadow="lg">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">
              {users.filter(u => u.isVerified && u.isUsed).length}
            </p>
          </AdminCard>
          <AdminCard hover padding="md" shadow="lg">
            <p className="text-sm text-gray-600">Unused Codes</p>
            <p className="text-2xl font-semibold text-yellow-600 mt-1">
              {users.filter(u => !u.isUsed).length}
            </p>
          </AdminCard>
          <AdminCard hover padding="md" shadow="lg">
            <p className="text-sm text-gray-600">Verified</p>
            <p className="text-2xl font-semibold text-blue-600 mt-1">
              {users.filter(u => u.isVerified).length}
            </p>
          </AdminCard>
        </div>

        {/* Users Table/Card View */}
        <AdminCard padding="md" shadow="lg">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="p-3 space-y-3">
              {loading ? (
                <div className="text-center text-gray-500 py-6">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-6">No users found</div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 space-y-2 hover:bg-gray-100/80 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">#{user.id}</p>
                        <p className="text-xs font-mono text-gray-600">{user.secretCode}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.isVerified && (
                          <AdminBadge variant="success">Verified</AdminBadge>
                        )}
                        {user.isUsed ? (
                          <AdminBadge variant="default">Used</AdminBadge>
                        ) : (
                          <AdminBadge variant="warning">Unused</AdminBadge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 truncate">{user.surveyLink}</div>
                    <div className="text-xs text-gray-500">
                      {user.phoneNumber ? (
                        <span className="inline-flex items-center space-x-1">
                          <Phone size={12} />
                          <span>{user.phoneNumber}</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-gray-500">
                        Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
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
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Secret Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Survey Link</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">#{user.id}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{user.secretCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">{user.surveyLink}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.phoneNumber || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {user.isVerified && <AdminBadge variant="success">Verified</AdminBadge>}
                          {user.isUsed ? <AdminBadge variant="default">Used</AdminBadge> : <AdminBadge variant="warning">Unused</AdminBadge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
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
        </AdminCard>
      </div>
    </PageContainer>
  );
};

export default UserManagement;
