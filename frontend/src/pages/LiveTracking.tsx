import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import MapTracking from '../components/MapTracking';
import PageContainer from '../components/Layout/PageContainer';

const LiveTrackingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Actions */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
            <p className="text-sm text-gray-500">Real-time location monitoring</p>
          </div>
        </div>

      <div className="p-4">
        <MapTracking />
      </div>
      </main>
    </PageContainer>
  );
};

export default LiveTrackingPage;
