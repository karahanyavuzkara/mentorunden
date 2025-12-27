'use client';

import Link from 'next/link';
import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [clicked, setClicked] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

    const handleLogoClick = () => {
      setClicked(true);
      setTimeout(() => setClicked(false), 300);
    };

  return (
    <nav className="relative z-10 border-b border-white/10 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with glow */}
          <div className="flex items-center gap-6">
              <Link
                href="/"
                onClick={handleLogoClick}
                className={`relative text-2xl font-bold tracking-wide text-indigo-500
                transition-all duration-300
                hover:scale-105
                hover:drop-shadow-[0_0_22px_rgba(99,102,241,0.9)]
                ${clicked ? "drop-shadow-[0_0_40px_rgba(99,102,241,1)] scale-110" : ""}
                `}
              >
                Mentorunden
                {clicked && (
                  <span className="absolute inset-0 rounded-full bg-indigo-500/40 blur-xl animate-ping" />
                )}
              </Link>
            </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/become-mentor"
              className="text-gray-300 hover:text-white transition"
            >
              Become a Mentor
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {loading ? (
              <span className="text-gray-400">Loading...</span>
            ) : user ? (
              <>
                <Link
                  href="/blog"
                  className="text-gray-300 hover:text-white transition"
                >
                  Blog
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white transition"
                >
                  Profile
                </Link>
                <span className="text-gray-500">|</span>
                <span className="text-gray-300 text-sm">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/blog"
                  className="text-gray-300 hover:text-white transition"
                >
                  Blog
                </Link>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-medium
                  shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/60"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

