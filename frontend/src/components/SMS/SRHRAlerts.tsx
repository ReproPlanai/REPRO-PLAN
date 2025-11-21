import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Heart, 
  Shield, 
  Clock, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { smsIntegration } from '../../utils/smsIntegration';
import { offlineStorage } from '../../utils/offlineStorage';

interface SRHRAlert {
  id: string;
  type: 'contraception' | 'sti_testing' | 'clinic_visit' | 'period_reminder' | 'vaccination';
  title: string;
  message: string;
  phoneNumber: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number;
  nextReminder: string;
  isActive: boolean;
  lastSent?: string;
  timesSent: number;
}

const SRHRAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SRHRAlert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<SRHRAlert | null>(null);
  const [newAlert, setNewAlert] = useState<Partial<SRHRAlert>>({
    type: 'contraception',
    frequency: 'weekly',
    isActive: true,
    timesSent: 0
  });

  const alertTypes = [
    {
      value: 'contraception',
      label: 'Contraception Reminder',
      icon: Heart,
      color: 'bg-pink-100 text-pink-600',
      description: 'Reminders for birth control pills, injections, or other methods'
    },
    {
      value: 'sti_testing',
      label: 'STI Testing',
      icon: Shield,
      color: 'bg-blue-100 text-blue-600',
      description: 'Regular STI testing reminders'
    },
    {
      value: 'clinic_visit',
      label: 'Clinic Visit',
      icon: Calendar,
      color: 'bg-green-100 text-green-600',
      description: 'Appointment and check-up reminders'
    },
    {
      value: 'period_reminder',
      label: 'Period Reminder',
      icon: Clock,
      color: 'bg-purple-100 text-purple-600',
      description: 'Menstrual cycle tracking reminders'
    },
    {
      value: 'vaccination',
      label: 'Vaccination',
      icon: Shield,
      color: 'bg-yellow-100 text-yellow-600',
      description: 'HPV and other vaccination reminders'
    }
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom Days' }
  ];

  const loadAlerts = async () => {
    try {
      const storedAlerts = await offlineStorage.getData('srhr_alerts');
      if (storedAlerts) {
        setAlerts(storedAlerts);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const saveAlerts = async (alertsToSave: SRHRAlert[]) => {
    try {
      await offlineStorage.storeData('srhr_alerts', alertsToSave);
      setAlerts(alertsToSave);
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  };

  const generateAlertMessage = (type: string, customMessage?: string): string => {
    if (customMessage) return customMessage;

    const messages = {
      contraception: "Hi! This is your contraception reminder. Don't forget to take your birth control or schedule your next injection. Stay healthy! 💊",
      sti_testing: "Time for your regular STI testing! Early detection saves lives. Visit your nearest clinic for confidential testing. 🛡️",
      clinic_visit: "Don't forget your upcoming clinic appointment! Regular check-ups keep you healthy. Call if you need to reschedule. 🏥",
      period_reminder: "Your period is coming soon! Make sure you have supplies ready. Track your cycle for better health awareness. 📅",
      vaccination: "Time for your vaccination! Protect yourself and others. Contact your clinic to schedule your appointment. 💉"
    };

    return messages[type as keyof typeof messages] || "This is your SRHR health reminder. Stay healthy! 💚";
  };

  const calculateNextReminder = (frequency: string, customDays?: number): string => {
    const now = new Date();
    let nextDate = new Date(now);

    switch (frequency) {
      case 'daily':
        nextDate.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(now.getMonth() + 1);
        break;
      case 'custom':
        nextDate.setDate(now.getDate() + (customDays || 7));
        break;
    }

    return nextDate.toISOString();
  };

  const handleCreateAlert = async () => {
    if (!newAlert.title || !newAlert.phoneNumber) {
      alert('Please fill in all required fields');
      return;
    }

    const newSRHRAlert: SRHRAlert = {
      id: Date.now().toString(),
      type: newAlert.type || 'contraception',
      title: newAlert.title,
      message: generateAlertMessage(newAlert.type || 'contraception', newAlert.message),
      phoneNumber: newAlert.phoneNumber,
      frequency: newAlert.frequency || 'weekly',
      customDays: newAlert.customDays,
      nextReminder: calculateNextReminder(newAlert.frequency || 'weekly', newAlert.customDays),
      isActive: newAlert.isActive || true,
      timesSent: 0
    };

    const updatedAlerts = [...alerts, newSRHRAlert];
    await saveAlerts(updatedAlerts);
    setShowCreateForm(false);
    setNewAlert({
      type: 'contraception',
      frequency: 'weekly',
      isActive: true,
      timesSent: 0
    });
  };

  const handleEditAlert = async (alertItem: SRHRAlert) => {
    const updatedAlerts = alerts.map(a => 
      a.id === alertItem.id ? { ...alertItem, nextReminder: calculateNextReminder(alertItem.frequency, alertItem.customDays) } : a
    );
    await saveAlerts(updatedAlerts);
    setEditingAlert(null);
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      const updatedAlerts = alerts.filter(a => a.id !== alertId);
      await saveAlerts(updatedAlerts);
    }
  };

  const handleToggleAlert = async (alertId: string) => {
    const updatedAlerts = alerts.map(a => 
      a.id === alertId ? { ...a, isActive: !a.isActive } : a
    );
    await saveAlerts(updatedAlerts);
  };

  const handleSendTestAlert = async (alertItem: SRHRAlert) => {
    try {
      const success = await smsIntegration.sendSMS(alertItem.phoneNumber, alertItem.message);
      if (success) {
        const updatedAlerts = alerts.map(a => 
          a.id === alertItem.id 
            ? { ...a, lastSent: new Date().toISOString(), timesSent: a.timesSent + 1 }
            : a
        );
        await saveAlerts(updatedAlerts);
        alert('Test alert sent successfully!');
      } else {
        alert('Failed to send test alert. Please check your phone number and try again.');
      }
    } catch (error) {
      console.error('Failed to send test alert:', error);
      alert('Failed to send test alert. Please try again.');
    }
  };

  const getAlertTypeInfo = (type: string) => {
    return alertTypes.find(t => t.value === type) || alertTypes[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">SRHR Alerts</h1>
              <p className="text-gray-600">SMS reminders for your sexual and reproductive health</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>New Alert</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Total Alerts</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{alerts.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Active Alerts</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.isActive).length}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Messages Sent</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {alerts.reduce((sum, a) => sum + a.timesSent, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts set up</h3>
            <p className="text-gray-500 mb-4">Create your first SRHR reminder to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Alert
            </button>
          </div>
        ) : (
          alerts.map((alert) => {
            const typeInfo = getAlertTypeInfo(alert.type);
            const TypeIcon = typeInfo.icon;
            
            return (
              <div key={alert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${typeInfo.color}`}>
                      <TypeIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{alert.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{typeInfo.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📱 {alert.phoneNumber}</span>
                        <span>🔄 {frequencyOptions.find(f => f.value === alert.frequency)?.label}</span>
                        <span>📅 Next: {formatDate(alert.nextReminder)}</span>
                        {alert.lastSent && (
                          <span>✅ Last sent: {formatDate(alert.lastSent)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSendTestAlert(alert)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Send test alert"
                    >
                      <Smartphone size={16} />
                    </button>
                    <button
                      onClick={() => setEditingAlert(alert)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      title="Edit alert"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete alert"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Message Preview:</h4>
                  <p className="text-sm text-gray-600 italic">"{alert.message}"</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAlert(alert.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        alert.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <span className="text-sm text-gray-500">
                      Sent {alert.timesSent} times
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Alert Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New Alert</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Type
                  </label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as any })}
                    className="input-field"
                  >
                    {alertTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Title *
                  </label>
                  <input
                    type="text"
                    value={newAlert.title || ''}
                    onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                    placeholder="e.g., Birth Control Reminder"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newAlert.phoneNumber || ''}
                    onChange={(e) => setNewAlert({ ...newAlert, phoneNumber: e.target.value })}
                    placeholder="+231-555-0123"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={newAlert.frequency}
                    onChange={(e) => setNewAlert({ ...newAlert, frequency: e.target.value as any })}
                    className="input-field"
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {newAlert.frequency === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Days
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={newAlert.customDays || 7}
                      onChange={(e) => setNewAlert({ ...newAlert, customDays: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    value={newAlert.message || ''}
                    onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                    placeholder="Leave empty to use default message"
                    className="input-field"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAlert}
                    className="flex-1 btn-primary"
                  >
                    Create Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Alert Modal */}
      {editingAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Alert</h3>
                <button
                  onClick={() => setEditingAlert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Title *
                  </label>
                  <input
                    type="text"
                    value={editingAlert.title}
                    onChange={(e) => setEditingAlert({ ...editingAlert, title: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={editingAlert.phoneNumber}
                    onChange={(e) => setEditingAlert({ ...editingAlert, phoneNumber: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={editingAlert.frequency}
                    onChange={(e) => setEditingAlert({ ...editingAlert, frequency: e.target.value as any })}
                    className="input-field"
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {editingAlert.frequency === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Days
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={editingAlert.customDays || 7}
                      onChange={(e) => setEditingAlert({ ...editingAlert, customDays: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={editingAlert.message}
                    onChange={(e) => setEditingAlert({ ...editingAlert, message: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setEditingAlert(null)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditAlert(editingAlert)}
                    className="flex-1 btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default SRHRAlerts;
