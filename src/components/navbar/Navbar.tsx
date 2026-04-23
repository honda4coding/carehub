import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcaseMedical } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[hsl(var(--color-bg))]/70 backdrop-blur-[20px] shadow-[0px_1px_0px_0px_rgba(229,238,255,1)]  border-gray-100 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[hsl(var(--color-primary))] rounded-lg flex items-center justify-center"> 
              <FontAwesomeIcon icon={faBriefcaseMedical} size="1x" style={{ color: "#fff" }}/>  
            </div>
            <span className="text-2xl font-bold text-gray-900">CareHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#"
              className="text-gray-700 hover:text-[hsl(var(--color-primary))] font-medium  transition-colors"
            >
              Platform
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-[hsl(var(--color-primary))] font-medium transition-colors"
            >
              Specialties
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-[hsl(var(--color-primary))] font-medium transition-colors"
            >
              About
            </Link>
          </div>

          {/* Sign In Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[hsl(var(--color-primary))] font-medium transition hover:text-white hover:bg-[hsl(var(--color-primary))]/80 px-3 py-1 rounded-full hover:shadow-sm "
            >
              Sign in
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray border-t border-gray-100">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              href="#"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-[hsl(var(--color-primary))] hover:bg-gray-50 transition-colors"
            >
              Platform
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-[hsl(var(--color-primary))] hover:bg-gray-50 transition-colors"
            >
              Specialties
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-[hsl(var(--color-primary))]  hover:bg-gray-50 transition-colors"
            >
              About
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
