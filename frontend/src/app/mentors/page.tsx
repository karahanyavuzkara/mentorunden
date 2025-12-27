'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
}

function MentorsPageContent() {
  const searchParams = useSearchParams();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState<string>('');

  useEffect(() => {
    // Get search query from URL params
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    fetchMentors();
  }, [searchParams]);

  const fetchMentors = async () => {
    try {
      // Fetch active mentors with profile information
      const { data, error } = await supabase
        .from('mentors')
        .select(`
          id,
          user_id,
          bio,
          expertise,
          hourly_rate,
          rating,
          total_sessions,
          profiles!mentors_user_id_fkey (
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .order('total_sessions', { ascending: false });

      if (error) throw error;

      // Transform data
      const mentorsWithProfiles = data?.map((mentor: any) => ({
        id: mentor.id,
        user_id: mentor.user_id,
        bio: mentor.bio,
        expertise: mentor.expertise || [],
        hourly_rate: mentor.hourly_rate,
        rating: mentor.rating || 0,
        total_sessions: mentor.total_sessions || 0,
        full_name: mentor.profiles?.full_name || 'Anonymous Mentor',
        avatar_url: mentor.profiles?.avatar_url,
        email: mentor.profiles?.email || '',
      })) || [];

      setMentors(mentorsWithProfiles);
    } catch (err: any) {
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter mentors based on search and expertise
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      searchQuery === '' ||
      mentor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some((exp) =>
        exp.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesExpertise =
      expertiseFilter === '' ||
      mentor.expertise.some((exp) =>
        exp.toLowerCase().includes(expertiseFilter.toLowerCase())
      );

    return matchesSearch && matchesExpertise;
  });

  // Get unique expertise areas for filter
  const allExpertise = Array.from(
    new Set(mentors.flatMap((m) => m.expertise))
  ).sort();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Browse <span className="text-indigo-500">Mentors</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Connect with experienced mentors to accelerate your growth
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search mentors by name, bio, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Expertise Filter */}
            <div className="md:w-64">
              <select
                value={expertiseFilter}
                onChange={(e) => setExpertiseFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Expertise</option>
                {allExpertise.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-400">
            Showing {filteredMentors.length} of {mentors.length} mentors
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No mentors found</p>
            <p className="text-gray-500 text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Link
                key={mentor.id}
                href={`/mentors/${mentor.id}`}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:border-indigo-500/50 transition group"
              >
                {/* Avatar and Name */}
                <div className="flex items-start gap-4 mb-4">
                  {mentor.avatar_url ? (
                    <img
                      src={mentor.avatar_url}
                      alt={mentor.full_name || 'Mentor'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center">
                      <span className="text-2xl text-indigo-400">
                        {mentor.full_name?.[0]?.toUpperCase() || 'M'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1 group-hover:text-indigo-400 transition">
                      {mentor.full_name}
                    </h3>
                    {mentor.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-400">
                          {mentor.rating.toFixed(1)} ({mentor.total_sessions} sessions)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {mentor.bio && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {mentor.bio}
                  </p>
                )}

                {/* Expertise Tags */}
                {mentor.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise.slice(0, 3).map((exp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-indigo-600/20 text-indigo-400 text-xs rounded"
                      >
                        {exp}
                      </span>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded">
                        +{mentor.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Hourly Rate */}
                {mentor.hourly_rate && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Hourly Rate</span>
                      <span className="text-lg font-semibold text-indigo-400">
                        ${mentor.hourly_rate}
                      </span>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm mt-16">
        © {new Date().getFullYear()} Mentorunden. All rights reserved.
      </footer>
    </div>
  );
}

export default function MentorsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    }>
      <MentorsPageContent />
    </Suspense>
  );
}

