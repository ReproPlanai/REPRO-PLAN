import React from 'react';
import { LogoCircular } from '../../assets';

const PreAuthLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="relative mx-auto mb-6 w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-white shadow-lg flex items-center justify-center">
            <img
              src={LogoCircular}
              alt="REPRO PLAN Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">REPRO PLAN</h1>
        <p className="mt-2 text-sm text-gray-600">
          Anonymous, inclusive, and trusted SRHR support for youth across Africa.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white/80 px-5 py-4 shadow-sm">
          <p className="text-sm font-medium text-gray-900">
            Your privacy-first health companion
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Fast access to education, clinics, mentorship, and emergency help —
            even when you are offline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreAuthLoader;
