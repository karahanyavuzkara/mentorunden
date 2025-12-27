'use client';

import Link from 'next/link';
import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [clicked, setClicked] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const handleLogoClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
  };

  // Fetch user profile for avatar
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url, full_name')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          if (data) {
            setAvatarUrl(data.avatar_url);
            setFullName(data.full_name);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      };

      fetchProfile();
    } else {
      setAvatarUrl(null);
      setFullName(null);
    }
  }, [user]);

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
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:ring-2 hover:ring-indigo-500/50 transition"
                  title="Profile"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName || user.email || 'Profile'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600/20 border-2 border-indigo-500/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-indigo-400">
                        {fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
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

