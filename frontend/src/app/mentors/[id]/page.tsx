'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Mentor {
  id: string;
  user_id: string;
  bio: string | null;
  expertise: string[];
  hourly_rate: number | null;
  rating: number;
  total_sessions: number;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  availability: any;
}

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchMentor(params.id as string);
    }
  }, [params.id]);

  const fetchMentor = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('mentors')
        .select(`
          *,
          profiles!mentors_user_id_fkey (
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Mentor not found');
        return;
      }

      // Transform data
      const mentorData: Mentor = {
        id: data.id,
        user_id: data.user_id,
        bio: data.bio,
        expertise: data.expertise || [],
        hourly_rate: data.hourly_rate,
        rating: data.rating || 0,
        total_sessions: data.total_sessions || 0,
        full_name: data.profiles?.full_name || 'Anonymous Mentor',
        avatar_url: data.profiles?.avatar_url,
        email: data.profiles?.email || '',
        availability: data.availability,
      };

      setMentor(mentorData);
    } catch (err: any) {
      console.error('Error fetching mentor:', err);
      setError(err.message || 'Mentor not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    // TODO: Implement booking functionality
    alert('Booking functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Mentor Not Found</h1>
          <p className="text-gray-400 mb-8">
            {error || 'The mentor you are looking for does not exist.'}
          </p>
          <Link
            href="/mentors"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
          >
            Back to Mentors
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition"
        >
          ← Back to Mentors
        </Link>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Avatar */}
            {mentor.avatar_url ? (
              <img
                src={mentor.avatar_url}
                alt={mentor.full_name || 'Mentor'}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-600/20 flex items-center justify-center">
                <span className="text-5xl text-indigo-400">
                  {mentor.full_name?.[0]?.toUpperCase() || 'M'}
                </span>
              </div>
            )}

            {/* Name and Stats */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{mentor.full_name}</h1>
              
              {mentor.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-400 text-2xl">★</span>
                  <span className="text-xl font-semibold">
                    {mentor.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-400">
                    ({mentor.total_sessions} sessions)
                  </span>
                </div>
              )}

              {mentor.hourly_rate && (
                <div className="text-2xl font-semibold text-indigo-400 mb-4">
                  ${mentor.hourly_rate}/hour
                </div>
              )}

              <button
                onClick={handleBookSession}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition font-semibold
                shadow-[0_0_30px_rgba(99,102,241,0.45)] hover:shadow-[0_0_50px_rgba(99,102,241,0.75)]"
              >
                Book a Session
              </button>
            </div>
          </div>

          {/* Bio */}
          {mentor.bio && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {mentor.bio}
              </p>
            </div>
          )}

          {/* Expertise */}
          {mentor.expertise.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Expertise</h2>
              <div className="flex flex-wrap gap-3">
                {mentor.expertise.map((exp, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
            <div>
              <div className="text-3xl font-bold text-indigo-400 mb-1">
                {mentor.total_sessions}
              </div>
              <div className="text-gray-400 text-sm">Total Sessions</div>
            </div>
            {mentor.rating > 0 && (
              <div>
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {mentor.rating.toFixed(1)}
                </div>
                <div className="text-gray-400 text-sm">Rating</div>
              </div>
            )}
            {mentor.hourly_rate && (
              <div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  ${mentor.hourly_rate}
                </div>
                <div className="text-gray-400 text-sm">Per Hour</div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm mt-16">
        © {new Date().getFullYear()} Mentorunden. All rights reserved.
      </footer>
    </div>
  );
}

