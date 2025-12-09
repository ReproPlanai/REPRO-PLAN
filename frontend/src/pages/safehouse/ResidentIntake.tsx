import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface IntakeForm {
  name: string;
  age: number;
  gender: string;
  arrivalDate: string;
  arrivalTime: string;
  reason: string;
  emergencyContact: string;
  medicalNeeds: string;
  immediateNeeds: string[];
  notes: string;
}

const ResidentIntake: React.FC = () => {
  const [formData, setFormData] = useState<IntakeForm>({
    name: '',
    age: 0,
    gender: '',
    arrivalDate: '',
    arrivalTime: '',
    reason: '',
    emergencyContact: '',
    medicalNeeds: '',
    immediateNeeds: [],
    notes: ''
  });

  const [saving, setSaving] = useState(false);

  const immediateNeedsOptions = [
    'Medical attention',
    'Counseling',
    'Legal assistance',
    'Food',
    'Clothing',
    'Hygiene products',
    'Safe accommodation'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: Save to backend API endpoint
      // const { apiService } = await import('../../../services/api');
      // await apiService.createResidentIntake(formData);

      console.log('Resident intake data:', formData);
      alert('Resident intake recorded successfully!');
      // Reset form
      setFormData({
        name: '',
        age: 0,
        gender: '',
        arrivalDate: '',
        arrivalTime: '',
        reason: '',
        emergencyContact: '',
        medicalNeeds: '',
        immediateNeeds: [],
        notes: ''
      });
    } catch (error) {
      alert('Failed to submit form. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleImmediateNeed = (need: string) => {
    setFormData(prev => ({
      ...prev,
      immediateNeeds: prev.immediateNeeds.includes(need)
        ? prev.immediateNeeds.filter(n => n !== need)
        : [...prev.immediateNeeds, need]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Resident Intake Form</h2>
        <p className="text-sm text-gray-600 mt-1">Register a new resident to the safe house</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Anonymous)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Anonymous Resident"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="+233-XX-XXX-XXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Arrival Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Arrival Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
                <input
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                <input
                  type="time"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Reason for Arrival */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Arrival</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              placeholder="Brief description of why the resident is seeking safe house services..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Immediate Needs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Immediate Needs</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {immediateNeedsOptions.map((need) => (
                <label key={need} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.immediateNeeds.includes(need)}
                    onChange={() => toggleImmediateNeed(need)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{need}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Medical Needs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medical Needs</label>
            <textarea
              value={formData.medicalNeeds}
              onChange={(e) => setFormData({ ...formData, medicalNeeds: e.target.value })}
              rows={2}
              placeholder="Any medical conditions, medications, or health concerns..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any additional information or observations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Intake Form'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ResidentIntake;

