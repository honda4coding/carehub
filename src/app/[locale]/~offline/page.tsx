"use client";

import { WifiOff, ShieldAlert, Phone } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[hsl(var(--color-primary))] p-6 flex flex-col items-center justify-center text-white">
          <WifiOff className="w-16 h-16 mb-4 opacity-90" />
          <h1 className="text-2xl font-bold text-center">No Internet Connection</h1>
          <p className="text-primary-foreground/80 text-center mt-2">
            You seem to be offline. We couldn't load this page because it requires a live connection to our secure servers.
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-start space-x-3 bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
            <ShieldAlert className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Your Data is Safe</h3>
              <p className="text-sm text-orange-700 mt-1">
                Any changes you saved while online have been securely stored. You can continue browsing previously visited pages.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Support Contacts</h3>
            
            <div className="flex items-center space-x-3 text-sm">
              <div className="bg-blue-50 p-2 rounded-full">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Technical Support (24/7)</p>
                <a href="tel:1-800-123-4567" className="text-blue-600 hover:underline">1-800-123-4567</a>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm">
              <div className="bg-green-50 p-2 rounded-full">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Hospital Reception</p>
                <a href="tel:1-800-987-6543" className="text-blue-600 hover:underline">1-800-987-6543</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-dark))] text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200 text-center"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
