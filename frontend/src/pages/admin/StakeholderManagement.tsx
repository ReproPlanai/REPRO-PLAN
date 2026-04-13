import React, { useState, useEffect } from 'react';
import { Search, Filter, Phone, Mail, UserPlus, X } from 'lucide-react';
import { apiService } from '../../services/api';
import PageContainer from '../../components/Layout/PageContainer';
import { AdminCard, AdminButton, AdminInput, AdminBadge } from '../../components/Admin';

interface Stakeholder {
  id: number;
  role: string;
  phoneNumber: string;
  name?: string;
  organization?: string;
  email?: string;
  surveyLink?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

const ROLES = ['POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO'];

const StakeholderManagement: React.FC = () => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [filteredStakeholders, setFilteredStakeholders] = useState<Stakeholder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchStakeholders();
  }, []);

  useEffect(() => {
    let filtered = [...stakeholders];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.phoneNumber.toLowerCase().includes(q) ||
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.organization?.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q)
      );
    }
    if (filterRole !== 'all') {
      filtered = filtered.filter((s) => s.role === filterRole);
    }
    setFilteredStakeholders(filtered);
  }, [stakeholders, searchQuery, filterRole]);

  const fetchStakeholders = async () => {
    setLoading(true);
    try {
      const res = await apiService.getStakeholders() as { success: boolean; stakeholders?: Stakeholder[] };
      if (res.success && res.stakeholders) {
        setStakeholders(res.stakeholders);
      } else {
        setStakeholders([]);
      }
    } catch (error) {
      console.error('Failed to fetch stakeholders:', error);
      setStakeholders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Stakeholder Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage portal stakeholders by role</p>
        </div>
        <AdminButton
          onClick={() => setShowAddModal(true)}
          icon={<UserPlus size={18} />}
        >
          Add Stakeholder
        </AdminButton>
      </div>

      <AdminCard padding="md" shadow="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput
            type="text"
            placeholder="Search by phone, name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
            fullWidth
          />
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              <option value="all">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard hover padding="md" shadow="lg">
          <p className="text-sm text-gray-600">Total Stakeholders</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stakeholders.length}</p>
        </AdminCard>
        {ROLES.map((role) => (
          <AdminCard key={role} hover padding="md" shadow="lg">
            <p className="text-sm text-gray-600">{role}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stakeholders.filter((s) => s.role === role).length}
            </p>
          </AdminCard>
        ))}
      </div>

      <AdminCard padding="md" shadow="lg">
        <div className="block sm:hidden p-3 space-y-3">
          {loading ? (
            <div className="text-center text-gray-500 py-6">Loading...</div>
          ) : filteredStakeholders.length === 0 ? (
            <div className="text-center text-gray-500 py-6">No stakeholders found</div>
          ) : (
            filteredStakeholders.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedStakeholder(s)}
                className="bg-gray-50 rounded-lg p-3 space-y-2 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">{s.name || s.role}</span>
                  <AdminBadge variant="default">{s.role}</AdminBadge>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{s.phoneNumber}</span>
                </div>
                {s.email && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Mail size={14} />
                    <span>{s.email}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredStakeholders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No stakeholders found
                  </td>
                </tr>
              ) : (
                filteredStakeholders.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStakeholder(s)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">#{s.id}</td>
                    <td className="px-4 py-3 text-sm">
                      <AdminBadge variant="default">{s.role}</AdminBadge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{s.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.phoneNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.organization || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {selectedStakeholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Stakeholder Details</h3>
              <button onClick={() => setSelectedStakeholder(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-medium text-gray-900">#{selectedStakeholder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-900">{selectedStakeholder.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{selectedStakeholder.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{selectedStakeholder.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{selectedStakeholder.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Organization</p>
                <p className="font-medium text-gray-900">{selectedStakeholder.organization || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedStakeholder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddStakeholderModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchStakeholders();
          }}
        />
      )}
      </div>
    </PageContainer>
  );
};

const AddStakeholderModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [role, setRole] = useState('NGO');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiService.registerStakeholder({
        role,
        phoneNumber: phoneNumber.trim(),
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        organization: organization.trim() || undefined
      }) as { success: boolean };
      if (res.success) {
        onSuccess();
      } else {
        setError('Failed to add stakeholder');
      }
    } catch (err) {
      setError('Failed to add stakeholder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Stakeholder</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone Number *</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+233-24-XXX-XXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Organization</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Organization name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Stakeholder'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StakeholderManagement;
