"use client";

import React from "react";
import Link from "next/link";
import { FiHome, FiAlertCircle } from "react-icons/fi";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-surface text-main select-none">
      <div className="max-w-md w-full text-center space-y-8 p-8 rounded-3xl border border-soft shadow-xl bg-surface/50 backdrop-blur-md">
        {/* Error icon badge */}
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-warning-light text-warning">
            <FiAlertCircle size={48} />
          </div>
        </div>

        {/* Text descriptions */}
        <div className="space-y-3">
          <div className="text-gradient font-bold text-4xl leading-none">404</div>
          <h1 className="text-2xl font-bold tracking-tight text-main">
            Page Not Found
          </h1>
          <p className="text-sm text-muted">
            Oops! The page you are looking for might have been moved, deleted, or does not exist.
          </p>
        </div>

        {/* Home redirection button */}
        <div className="flex justify-center pt-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-medium transition-all duration-300 bg-primary text-inverse hover:bg-primary-strong shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
          >
            <FiHome />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
