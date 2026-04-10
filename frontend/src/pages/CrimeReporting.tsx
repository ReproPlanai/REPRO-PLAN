import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Upload, 
  UserX, 
  Info,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import apiService from '../services/apiReal';

const crimeTypes = [
  { id: 'rape', label: 'Rape / Sexual Assault', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'gbv', label: 'Gender-Based Violence (GBV)', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'domestic', label: 'Domestic Violence', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'trafficking', label: 'Human Trafficking', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'harassment', label: 'Sexual Harassment', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'other', label: 'Other Crime', color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const CrimeReporting: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [formData, setFormData] = useState({
    crimeType: '',
    description: '',
    location: '',
    date: '',
    contactInfo: '',
    consentToShare: false,
    wantsCallback: false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiService.submitCrimeReport({
        type: formData.crimeType,
        description: formData.description,
        location: formData.location,
        date: formData.date,
        isAnonymous,
        contactInfo: isAnonymous ? '' : formData.contactInfo,
        consentToShare: formData.consentToShare,
        wantsCallback: formData.wantsCallback,
      });
      
      setReportId(response.reportId || 'RP-' + Date.now());
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again or contact emergency services directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (submitted) {
    return (
      <PageContainer gradient>
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted</h2>
            <p className="text-gray-600 mb-4">
              Your report has been received and will be reviewed by our team.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Report ID</p>
              <p className="text-lg font-mono font-semibold text-gray-900">{reportId}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Save this ID to check the status of your report later.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer gradient>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Report a Crime</h1>
              <p className="text-gray-600">Submit an anonymous or identified crime report</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  s <= step ? 'bg-red-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Crime Type */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Select Crime Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {crimeTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, crimeType: type.id }));
                    nextStep();
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.crimeType === type.id
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  } ${type.color}`}
                >
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Incident Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what happened..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Where did it happen?"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Incident
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.description}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Anonymity & Contact */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Identity & Contact</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Your privacy is protected</p>
                <p>All reports are confidential. You can choose to remain completely anonymous or provide contact information for follow-up.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
              />
              <label htmlFor="anonymous" className="flex items-center gap-2 flex-1">
                <UserX className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Remain Anonymous</span>
              </label>
            </div>

            {!isAnonymous && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  placeholder="Phone number or email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                />
              </div>
            )}

            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
              <input
                type="checkbox"
                id="callback"
                name="wantsCallback"
                checked={formData.wantsCallback}
                onChange={handleInputChange}
                className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
              />
              <label htmlFor="callback" className="flex-1 text-gray-900">
                I want to receive updates about this report
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Evidence & Submit */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Evidence & Consent</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Evidence (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Click to upload photos, videos, or documents</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Select Files
                </label>
                {files.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">{files.length} file(s) selected</p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Share with Authorities</p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consentToShare"
                    checked={formData.consentToShare}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="consent">
                    I consent to sharing this report with law enforcement if necessary
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default CrimeReporting;
