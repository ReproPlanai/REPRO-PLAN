import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, Plus, Phone, X, Copy, Check } from 'lucide-react';
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

const EditUserForm: React.FC<{
  user: User;
  onSave: (updates: Partial<User>) => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ user, onSave, onCancel, loading }) => {
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [isVerified, setIsVerified] = useState(user.isVerified);
  const [surveyLink, setSurveyLink] = useState(user.surveyLink || '');
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+233-24-XXX-XXXX"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Survey Link</label>
        <input
          type="url"
          value={surveyLink}
          onChange={(e) => setSurveyLink(e.target.value)}
          placeholder="https://reproplanai.com/survey/..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isVerified}
          onChange={(e) => setIsVerified(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Verified</span>
      </label>
      <div className="flex gap-3">
        <button
          onClick={() => onSave({ phoneNumber: phoneNumber || undefined, surveyLink: surveyLink || undefined, isVerified })}
          disabled={loading}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'unused'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [addSuccess, setAddSuccess] = useState<{ secretCode: string; surveyLink: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleAddUser = async () => {
    setLoading(true);
    try {
      const response = await apiService.registerUser() as { success: boolean; secretCode?: string; surveyLink?: string };
      if (response.success && response.secretCode && response.surveyLink) {
        setAddSuccess({ secretCode: response.secretCode, surveyLink: response.surveyLink });
        await fetchUsers();
      }
    } catch (error) {
      console.error('Failed to add user:', error);
      alert('Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (updates: Partial<User>) => {
    if (!editingUser) return;
    setLoading(true);
    try {
      const response = await apiService.updateUser(editingUser.id.toString(), updates as any) as { success: boolean };
      if (response.success) {
        setEditingUser(null);
        await fetchUsers();
      } else {
        alert('Failed to update user.');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setLoading(true);
    try {
      const response = await apiService.deleteUser(userToDelete.id.toString()) as { success: boolean };
      if (response.success) {
        setUserToDelete(null);
        setSelectedUser(null);
        await fetchUsers();
      } else {
        alert('Failed to delete user.');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and monitor all platform users</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
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
        {/* Mobile Card View */}
        <div className="block sm:hidden">
          <div className="p-3 space-y-3">
            {loading ? (
              <div className="text-center text-gray-500 py-6">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-gray-500 py-6">No users found</div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">#{user.id}</p>
                      <p className="text-xs font-mono text-gray-600">{user.secretCode}</p>
                    </div>
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
                        onClick={() => setSelectedUser(user)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} />
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
          <table className="w-full min-w-[960px]">
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
                          onClick={() => setEditingUser(user)}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{addSuccess ? 'User Created' : 'Add User'}</h3>
              <button
                onClick={() => { setShowAddModal(false); setAddSuccess(null); }}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            {addSuccess ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Save this information securely. The secret code and recovery link cannot be shown again.</p>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Secret Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg font-mono text-sm">{addSuccess.secretCode}</code>
                    <button
                      onClick={() => copyToClipboard(addSuccess.secretCode, 'code')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="Copy"
                    >
                      {copiedField === 'code' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Recovery Link</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-xs break-all">{addSuccess.surveyLink}</code>
                    <button
                      onClick={() => copyToClipboard(addSuccess.surveyLink, 'link')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded flex-shrink-0"
                      title="Copy"
                    >
                      {copiedField === 'link' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => { setShowAddModal(false); setAddSuccess(null); }}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Create a new user account. A secret code and recovery link will be generated.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddUser}
                    disabled={loading}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Generate User'}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit User #{editingUser.id}</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <EditUserForm
              user={editingUser}
              onSave={(updates) => handleEditUser(updates)}
              onCancel={() => setEditingUser(null)}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
            <p className="text-sm text-gray-600 mb-4">
              Delete user #{userToDelete.id}? This cannot be undone. The user will lose access to their account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setUserToDelete(null)}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && !editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
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

