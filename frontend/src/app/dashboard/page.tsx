'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  bio: string | null;
  avatar_url: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back,{' '}
              <span className="text-indigo-500">
                {profile?.full_name || user?.email?.split('@')[0] || 'there'}!
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Here's your dashboard overview
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-400">
                        {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">
                      {profile?.full_name || 'No name set'}
                    </h3>
                    <p className="text-sm text-gray-400">{profile?.email}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-indigo-600/20 border border-indigo-500/50 rounded-lg text-indigo-400 text-sm capitalize">
                    {profile?.role || 'student'}
                  </span>
                </div>
                <Link
                  href="/profile"
                  className="block w-full text-center px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 rounded-lg transition text-indigo-400"
                >
                  Edit Profile
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/mentors"
                    className="block w-full px-4 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 rounded-lg transition text-left"
                  >
                    <div className="font-medium">Browse Mentors</div>
                    <div className="text-sm text-gray-400">Find and connect with mentors</div>
                  </Link>
                  {profile?.role === 'student' && (
                    <Link
                      href="/become-mentor"
                      className="block w-full px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg transition text-left"
                    >
                      <div className="font-medium">Become a Mentor</div>
                      <div className="text-sm text-gray-400">Apply to become a mentor</div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-indigo-400">0</div>
                    <div className="text-sm text-gray-400">Bookings</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-indigo-400">0</div>
                    <div className="text-sm text-gray-400">Sessions</div>
                  </div>
                  {profile?.role === 'mentor' && (
                    <div>
                      <div className="text-3xl font-bold text-indigo-400">0</div>
                      <div className="text-sm text-gray-400">Students</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 md:col-span-2 lg:col-span-3">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="text-center py-8 text-gray-400">
                  <p>No recent activity yet</p>
                  <p className="text-sm mt-2">Your bookings and sessions will appear here</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm mt-16">
          © {new Date().getFullYear()} Mentorunden. All rights reserved.
        </footer>
      </div>
    </ProtectedRoute>
  );
}

