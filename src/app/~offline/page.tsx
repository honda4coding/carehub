"use client";

import React from "react";
import { FiWifiOff, FiActivity, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center">
          <FiWifiOff className="w-12 h-12 text-rose-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">You are Offline</h1>
          <p className="text-gray-500">
            It looks like you've lost your internet connection. Please check your network and try again.
          </p>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-4">
            If you are a patient, you can still access your offline tracking tools:
          </p>
          <Link 
            href="/patient/tracking"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            <FiActivity className="w-5 h-5" />
            Go to Offline Tracking
          </Link>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center justify-center gap-2 mx-auto pt-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          Try reloading the page
        </button>
      </div>
    </div>
  );
}
