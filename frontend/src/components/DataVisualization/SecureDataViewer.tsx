import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Download
} from 'lucide-react';

interface SecureDataViewerProps {
  data: any[];
  chartType: 'bar' | 'pie' | 'line' | 'area';
  title: string;
  description: string;
  userRole: string;
  onDataAccess: (data: any) => void;
}

const SecureDataViewer: React.FC<SecureDataViewerProps> = ({
  data,
  chartType,
  title,
  description,
  userRole,
  onDataAccess
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [accessAttempts, setAccessAttempts] = useState(0);

  // NDA Content
  const ndaContent = `
    CONFIDENTIAL DATA ACCESS AGREEMENT
    
    By accessing this data, you agree to:
    1. Maintain strict confidentiality of all data
    2. Not share, copy, or distribute any information
    3. Use data only for authorized purposes
    4. Report any security breaches immediately
    5. Comply with all privacy regulations
    
    Violation of this agreement may result in:
    - Immediate access revocation
    - Legal action
    - Termination of privileges
    
    Your access is logged and monitored.
  `;

  // Color schemes for different roles
  const roleColors = {
    'ADMIN': ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
    'POLICE': ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'],
    'SAFEHOUSE': ['#10B981', '#059669', '#047857', '#065F46'],
    'MEDICAL': ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
    'NGO': ['#F59E0B', '#D97706', '#B45309', '#92400E']
  };

  const currentColors = roleColors[userRole as keyof typeof roleColors] || roleColors.ADMIN;

  const handleNDAAcceptance = () => {
    setNdaAccepted(true);
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (otpCode.length === 6) {
      setIsAuthenticated(true);
      onDataAccess({
        timestamp: new Date().toISOString(),
        userRole,
        dataType: title,
        accessGranted: true
      });
    } else {
      setError('Invalid OTP. Please try again.');
      setAccessAttempts(prev => prev + 1);
    }
    setIsVerifying(false);
  };

  const handleDataDownload = () => {
    if (userRole !== 'ADMIN') {
      alert('Data download requires additional authorization. Contact administrator.');
      return;
    }
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset authentication after 30 minutes
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        setIsAuthenticated(false);
        setNdaAccepted(false);
        setOtpCode('');
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // If not authenticated, show security gate
  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Data Access</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {!ndaAccepted ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Confidential Data Access</h4>
                  <p className="text-xs text-yellow-700 mb-3">This data is protected by confidentiality agreements.</p>
                  <div className="bg-white border border-yellow-200 rounded p-3 max-h-32 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">{ndaContent}</pre>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleNDAAcceptance}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle size={18} />
              <span>I Accept NDA Terms</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">OTP Verification Required</h4>
                  <p className="text-xs text-blue-700">
                    Enter the 6-digit code sent to your registered phone number to access this data.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleOTPVerification} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-3 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-mono tracking-widest"
                  maxLength={6}
                  required
                  disabled={isVerifying}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 text-center">{error}</div>
              )}

              {accessAttempts >= 3 && (
                <div className="text-sm text-red-600 text-center">
                  Too many failed attempts. Access temporarily restricted.
                </div>
              )}

              <button
                type="submit"
                disabled={otpCode.length !== 6 || isVerifying || accessAttempts >= 3}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Eye size={18} />
                    <span>Access Data</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Render the actual chart
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill={currentColors[0]} />
          </BarChart>
        );
      
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke={currentColors[0]} strokeWidth={2} />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke={currentColors[0]} fill={currentColors[0]} fillOpacity={0.3} />
          </AreaChart>
        );
      
      default:
        return <div>No chart data available</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle size={16} />
              <span className="text-xs font-medium">Secured</span>
            </div>
            {userRole === 'ADMIN' && (
              <button
                onClick={handleDataDownload}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Download Data"
              >
                <Download size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SecureDataViewer;
