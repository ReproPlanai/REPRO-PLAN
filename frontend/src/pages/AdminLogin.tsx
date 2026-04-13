import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';
import PageContainer from '../components/Layout/PageContainer';
import { LogoCircular } from '../assets';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('reproplanllc@gmail.com');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailSentModal, setShowEmailSentModal] = useState(false);
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.requestAdminOTP(email);
      if (response.success) {
        setShowEmailSentModal(true);
        setStep('otp');
        setTimeout(() => setShowEmailSentModal(false), 5000);
      } else {
        setError(response.message || 'Failed to send login code');
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        if (err.response.data.error.includes('Access denied')) {
          setShowAccessDeniedModal(true);
          setTimeout(() => {
            setShowAccessDeniedModal(false);
            navigate('/');
          }, 5000);
        } else {
          setError(err.response.data.error);
        }
      } else {
        setError('Failed to send login code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.verifyAdminOTP(email, otp);
      if (response.success) {
        // Store admin session and redirect to admin dashboard
        sessionStorage.setItem('admin_token', response.token);
        navigate('/admin');
      } else {
        setError(response.message || 'Invalid login code');
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMainLogin = () => {
    navigate('/');
  };

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full max-w-md mx-auto relative z-10">
          {/* Email Sent Modal */}
          {showEmailSentModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl shadow-black/10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 border border-gray-200/60">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Email Sent!</h3>
                <p className="text-gray-600 mb-6">Check your email for the 6-digit login code. It expires in 3 minutes.</p>
                <button
                  onClick={() => setShowEmailSentModal(false)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:opacity-90 transition-all font-medium shadow-lg shadow-green-500/20"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Access Denied Modal */}
          {showAccessDeniedModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl shadow-black/10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 border border-gray-200/60">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h3>
                <p className="text-gray-600 mb-4">This login is for administrators only. If you're an admin, please use reproplanllc@gmail.com</p>
                <p className="text-sm text-gray-500 mb-6">Redirecting to main login in 5 seconds...</p>
                <button
                  onClick={handleBackToMainLogin}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl hover:opacity-90 transition-all font-medium shadow-lg shadow-red-500/20"
                >
                  Go to Main Login
                </button>
              </div>
            </div>
          )}

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/60 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-2xl rotate-3 animate-[spin_8s_linear_infinite] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-2xl -rotate-3 animate-[spin_12s_linear_infinite_reverse] opacity-20" />
                <div className="relative w-full h-full bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <img 
                    src={LogoCircular} 
                    alt="REPRO PLAN Logo" 
                    className="w-12 h-12 object-cover"
                  />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                Admin Login
              </h1>
              <p className="text-base text-gray-600">Secure access for REPRO PLAN administrators</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/80 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            )}

            {/* Email Step */}
            {step === 'email' && (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Admin Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter admin email"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all text-sm font-medium"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Only reproplanllc@gmail.com is allowed</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Request Login Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToMainLogin}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-3 transition-colors"
                >
                  ← Back to Main Login
                </button>
              </form>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                    Enter 6-Digit Code
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all text-center text-3xl font-mono tracking-[0.5em] font-semibold"
                      maxLength={6}
                      required
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Code expires in 3 minutes</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-3 transition-colors"
                >
                  ← Request New Code
                </button>
              </form>
            )}

            {/* Privacy Notice */}
            <div className="mt-8 p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/60">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="text-blue-900 font-semibold mb-1">Privacy Protected</p>
                  <p className="text-blue-700">
                    Your secret code is stored locally and never shared. Your identity remains completely anonymous.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Footer */}
          <div className="text-center mt-8 flex items-center justify-center space-x-2 text-gray-400">
            <Sparkles size={16} />
            <span className="text-sm">Enterprise-Grade Security</span>
            <Sparkles size={16} />
          </div>
        </div>
      </main>
    </PageContainer>
  );
};

export default AdminLogin;
