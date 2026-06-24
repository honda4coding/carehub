"use client";

import React, { useEffect, useState } from "react";
import { FiWifiOff, FiRefreshCw, FiArrowLeft } from "react-icons/fi";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-surface text-main select-none">
      <div className="max-w-md w-full text-center space-y-8 p-8 rounded-3xl border border-soft shadow-xl bg-surface/50 backdrop-blur-md animate-fade-in">
        {/* Connection status badge */}
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-danger-light text-danger animate-pulse">
            <FiWifiOff size={44} />
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-danger"></span>
            </span>
          </div>
        </div>

        {/* Text descriptions */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-main">
            You are offline
          </h1>
          <p className="text-sm text-muted">
            We couldn't connect to the server. Please check your internet connection and try again.
          </p>
        </div>

        {/* User status */}
        <div className="text-xs font-semibold py-2 px-4 rounded-full inline-block bg-soft text-muted">
          {isOnline ? "Reconnecting..." : "Status: Offline Mode"}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-medium cursor-pointer transition-all duration-300 bg-primary text-inverse hover:bg-primary-strong shadow-lg shadow-primary/20 active:scale-95"
          >
            <FiRefreshCw className="animate-spin-hover" />
            Retry Connection
          </button>
          
          <button
            onClick={() => typeof window !== "undefined" && window.history.back()}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-medium cursor-pointer transition-all duration-300 bg-soft border border-soft hover:bg-zinc-100 dark:hover:bg-zinc-800 text-main active:scale-95"
          >
            <FiArrowLeft />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
