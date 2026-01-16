import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, LogIn, UserPlus, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface PortalLoginProps {
  role: string;
  onLoginSuccess: (role: string, userData: any) => void;
  onBack: () => void;
}

const PortalLogin: React.FC<PortalLoginProps> = ({ role, onLoginSuccess, onBack }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [surveyLink, setSurveyLink] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [currentStep, setCurrentStep] = useState<'login' | 'signup' | 'otp' | 'forgot-details'>('login');
  const [forgotSent, setForgotSent] = useState(false);

  // Role-specific configurations
  const roleConfig = {
    'ADMIN': {
      title: 'Administrator Portal',
      description: 'System administration and management',
      icon: '👨‍💼',
      color: 'from-red-500 to-pink-500'
    },
    'POLICE': {
      title: 'Police Portal',
      description: 'Emergency response and case management',
      icon: '👮‍♂️',
      color: 'from-blue-500 to-indigo-500'
    },
    'SAFEHOUSE': {
      title: 'Safe House Portal',
      description: 'Resident management and security',
      icon: '🏠',
      color: 'from-green-500 to-emerald-500'
    },
    'MEDICAL': {
      title: 'Medical Portal',
      description: 'Patient care and medical services',
      icon: '👩‍⚕️',
      color: 'from-purple-500 to-violet-500'
    },
    'NGO': {
      title: 'NGO Portal',
      description: 'Community programs and outreach',
      icon: '🤝',
      color: 'from-orange-500 to-yellow-500'
    }
  };

  const currentRole = roleConfig[role as keyof typeof roleConfig];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSendingOtp(true);

    try {
      // Stakeholders authenticate with role + phone/email during testing
      // In production, you'd verify the stakeholder before sending OTP
      if (phoneNumber) {
        setCurrentStep('otp');
      } else {
        setError('Please provide your phone number.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to verify account. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleForgotDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSendingOtp(true);

    try {
      if (!phoneNumber.trim() && !email.trim()) {
        setError('Please provide a phone number or email address.');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      setForgotSent(true);
    } catch (error: any) {
      setError(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSendingOtp(true);

    try {
      // Register new stakeholder with backend
      const response = await apiService.registerStakeholder({
        role,
        phoneNumber,
        email,
        surveyLink: surveyLink.trim() || undefined, // Optional for anonymity
        name: email.split('@')[0] // Use email prefix as name
      }) as { success: boolean; message?: string; stakeholder?: { id: number | string; role: string; name?: string; organization?: string; permissions?: any } };

      if (response.success) {
        if (response.stakeholder) {
          sessionStorage.setItem('stakeholder_id', response.stakeholder.id.toString());
        }
        setIsNewUser(true);
        setCurrentStep('otp');
      } else {
        setError(response.message || 'Failed to create account. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifyingOtp(true);

    try {
      // In production, you would verify OTP here
      // For now, we'll accept any 6-digit code and proceed to login
      if (otpCode.length === 6) {
      // Login stakeholder with backend
        const response = await apiService.loginStakeholder(undefined, phoneNumber, role) as { success: boolean; message?: string; stakeholder?: { id: number | string; role: string; name?: string; organization?: string; permissions?: any } };
        
        if (response.success && response.stakeholder) {
          const userData = {
            id: response.stakeholder.id,
            role: response.stakeholder.role,
            name: response.stakeholder.name,
            organization: response.stakeholder.organization,
            phoneNumber,
            email,
            isNewUser,
            loginTime: new Date().toISOString(),
            permissions: response.stakeholder.permissions
          };
          
          // Store user data in session
          sessionStorage.setItem('stakeholder_data', JSON.stringify(userData));
          onLoginSuccess(role, userData);
        } else {
          setError(response.message || 'Invalid credentials. Please try again.');
          setIsVerifyingOtp(false);
        }
      } else {
        setError('Invalid OTP. Please enter a 6-digit code.');
        setIsVerifyingOtp(false);
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
      setIsVerifyingOtp(false);
    }
  };

  // Reserved for future use
  // const getRolePermissions = (role: string) => {
  //   const permissions: { [key: string]: string[] } = {
  //     'ADMIN': ['system_access', 'user_management', 'analytics', 'content_management'],
  //     'POLICE': ['emergency_alerts', 'case_management', 'location_access', 'reports'],
  //     'SAFEHOUSE': ['resident_management', 'access_control', 'security_alerts', 'resources'],
  //     'MEDICAL': ['patient_records', 'appointments', 'medical_resources', 'health_analytics'],
  //     'NGO': ['program_management', 'community_outreach', 'resource_distribution', 'impact_tracking']
  //   };
  //   return permissions[role] || [];
  // };

  const resendOtp = async () => {
    setIsSendingOtp(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSendingOtp(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 text-sm sm:text-base"
        >
          <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm">Back to Access Portal</span>
        </button>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className={`mx-auto flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${currentRole.color} rounded-full mb-3 sm:mb-4`}>
            <span className="text-lg sm:text-2xl">{currentRole.icon}</span>
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
            {currentRole.title}
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 px-2">
            {currentRole.description}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Login/Signup Options */}
        {currentStep === 'login' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Sign In to Your Account</h2>
              <p className="text-xs sm:text-sm text-gray-600">Enter your credentials to access your dashboard</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Phone Number
              </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  required
                  disabled={isSendingOtp}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  required
                  disabled={isSendingOtp}
                />
            </div>

            <button
              type="submit"
                disabled={!phoneNumber.trim() || !email.trim() || isSendingOtp}
              className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {isSendingOtp ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                    <span className="text-xs sm:text-sm">Signing In...</span>
                </>
              ) : (
                <>
                    <LogIn size={16} className="sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">Sign In</span>
                </>
              )}
            </button>
          </form>

            <div className="text-center space-y-2">
              <button
                onClick={() => {
                  setForgotSent(false);
                  setCurrentStep('forgot-details');
                }}
                className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm"
              >
                Forgot access details?
              </button>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Don't have an account?</p>
              <button
                onClick={() => setCurrentStep('signup')}
                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
              >
                Create New Account
              </button>
              </div>
            </div>
          </div>
        )}

        {/* Forgot Details Form */}
        {currentStep === 'forgot-details' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Recover Access</h2>
              <p className="text-sm text-gray-600">
                Provide your phone number or email and we will send recovery instructions.
              </p>
            </div>

            {forgotSent ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700">
                  Recovery instructions sent. Please check your phone or email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotDetailsSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgotPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="forgotPhone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    disabled={isSendingOtp}
                  />
                </div>

                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="forgotEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    disabled={isSendingOtp}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  {isSendingOtp ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>Send Recovery Info</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center">
              <button
                onClick={() => setCurrentStep('login')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}

        {/* Sign Up Form */}
        {currentStep === 'signup' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Create New Account</h2>
              <p className="text-sm text-gray-600">Set up your {currentRole.title} account</p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  required
                  disabled={isSendingOtp}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  required
                  disabled={isSendingOtp}
                />
              </div>

              <div>
                <label htmlFor="surveyLink" className="block text-sm font-medium text-gray-700 mb-2">
                  Survey Link (Optional)
                </label>
                <input
                  type="url"
                  id="surveyLink"
                  value={surveyLink}
                  onChange={(e) => setSurveyLink(e.target.value)}
                  placeholder="https://example.com/survey/... (optional)"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  disabled={isSendingOtp}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Provide a survey link for follow-up context. Leave blank to stay fully anonymous.
                </p>
              </div>

              <button
                type="submit"
                disabled={!phoneNumber.trim() || !email.trim() || isSendingOtp}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isSendingOtp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Already have an account?</p>
              <button
                onClick={() => setCurrentStep('login')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Sign In Instead
              </button>
            </div>
          </div>
        )}


        {/* OTP Verification */}
        {currentStep === 'otp' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Verify Your Account</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {isNewUser ? 'We sent a verification code to your phone' : 'Enter the OTP sent to your phone'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                OTP sent to {phoneNumber}
              </p>
            </div>

          <form onSubmit={handleOtpSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="otpCode" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Verification Code
              </label>
              <input
                type="text"
                id="otpCode"
                value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center text-base sm:text-lg tracking-widest"
                maxLength={6}
                required
                disabled={isVerifyingOtp}
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={resendOtp}
                disabled={isSendingOtp}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors text-xs sm:text-sm"
              >
                {isSendingOtp ? 'Sending...' : 'Resend OTP'}
              </button>
              
              <button
                type="submit"
                disabled={otpCode.length !== 6 || isVerifyingOtp}
                className="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isVerifyingOtp ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                    <span className="text-xs sm:text-sm">Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">Verify</span>
                  </>
                )}
              </button>
            </div>
          </form>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-4 sm:mt-6 p-2 sm:p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            🔒 Secure OTP authentication required for {currentRole.title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;
