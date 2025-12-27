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

interface Booking {
  id: string;
  student_id: string;
  mentor_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  meeting_link: string | null;
  student_name: string | null;
  student_avatar: string | null;
  mentor_name: string | null;
  mentor_avatar: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && profile) {
      fetchBookings();
    }
  }, [user, profile]);

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

  const fetchBookings = async () => {
    if (!user || !profile) {
      setBookingsLoading(false);
      return;
    }

    try {
      let query;
      
      if (profile.role === 'mentor') {
        // For mentors: Get bookings where they are the mentor
        // First get mentor record
        const { data: mentorData, error: mentorError } = await supabase
          .from('mentors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (mentorError || !mentorData) {
          setBookingsLoading(false);
          return;
        }

        query = supabase
          .from('bookings')
          .select(`
            *,
            profiles!bookings_student_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq('mentor_id', mentorData.id)
          .order('start_time', { ascending: false });
      } else {
        // For students: Get bookings where they are the student
        query = supabase
          .from('bookings')
          .select(`
            *,
            mentors!bookings_mentor_id_fkey (
              user_id,
              profiles!mentors_user_id_fkey (
                full_name,
                avatar_url
              )
            )
          `)
          .eq('student_id', user.id)
          .order('start_time', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data based on role
      const transformedBookings = data?.map((booking: any) => {
        if (profile.role === 'mentor') {
          return {
            id: booking.id,
            student_id: booking.student_id,
            mentor_id: booking.mentor_id,
            start_time: booking.start_time,
            end_time: booking.end_time,
            status: booking.status,
            notes: booking.notes,
            meeting_link: booking.meeting_link,
            student_name: booking.profiles?.full_name || 'Unknown Student',
            student_avatar: booking.profiles?.avatar_url,
            mentor_name: null,
            mentor_avatar: null,
          };
        } else {
          return {
            id: booking.id,
            student_id: booking.student_id,
            mentor_id: booking.mentor_id,
            start_time: booking.start_time,
            end_time: booking.end_time,
            status: booking.status,
            notes: booking.notes,
            meeting_link: booking.meeting_link,
            student_name: null,
            student_avatar: null,
            mentor_name: booking.mentors?.profiles?.full_name || 'Unknown Mentor',
            mentor_avatar: booking.mentors?.profiles?.avatar_url,
          };
        }
      }) || [];

      setBookings(transformedBookings);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this session? The student will be notified via email.')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to cancel a booking');
        return;
      }

      // Call backend API to cancel booking and send email
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      console.log('=== Frontend: Cancelling booking ===');
      console.log('Booking ID:', bookingId);
      console.log('Booking ID type:', typeof bookingId);
      console.log('Booking ID length:', bookingId?.length);
      console.log('User ID:', user.id);
      console.log('API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (!response.ok) {
        console.error('Cancel booking error:', data);
        throw new Error(data.message || 'Failed to cancel booking');
      }

      // Refresh bookings
      await fetchBookings();
      alert('Session cancelled successfully. The student has been notified via email.');
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      alert(err.message || 'Failed to cancel booking. Please check if the backend server is running.');
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
                  {profile?.role === 'mentor' && (
                    <Link
                      href="/availability"
                      className="block w-full px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg transition text-left"
                    >
                      <div className="font-medium">Manage Availability</div>
                      <div className="text-sm text-gray-400">Set your available time slots</div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-indigo-400">
                      {bookings.length}
                    </div>
                    <div className="text-sm text-gray-400">Total Bookings</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-indigo-400">
                      {bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-400">Active Sessions</div>
                  </div>
                  {profile?.role === 'mentor' && (
                    <div>
                      <div className="text-3xl font-bold text-indigo-400">
                        {Array.from(new Set(bookings.map((b) => b.student_id))).length}
                      </div>
                      <div className="text-sm text-gray-400">Students</div>
                    </div>
                  )}
                  {profile?.role === 'student' && (
                    <div>
                      <div className="text-3xl font-bold text-indigo-400">
                        {Array.from(new Set(bookings.map((b) => b.mentor_id))).length}
                      </div>
                      <div className="text-sm text-gray-400">Mentors</div>
                    </div>
                  )}
                </div>
              </div>

              {/* My Sessions */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 md:col-span-2 lg:col-span-3">
                <h3 className="text-xl font-semibold mb-4">My Sessions</h3>
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No sessions yet</p>
                    <p className="text-sm mt-2">Your upcoming sessions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings
                      .filter((b) => {
                        const startTime = new Date(b.start_time);
                        const now = new Date();
                        // Show upcoming and recent sessions (within last 7 days)
                        return startTime >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      })
                      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                      .map((booking) => {
                        const startTime = new Date(booking.start_time);
                        const endTime = new Date(booking.end_time);
                        const isUpcoming = startTime > new Date();
                        const isPast = endTime < new Date();
                        
                        return (
                          <div
                            key={booking.id}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition ${
                              isUpcoming
                                ? 'bg-indigo-600/10 border-indigo-500/50 hover:border-indigo-500'
                                : isPast
                                ? 'bg-white/5 border-white/10 opacity-60'
                                : 'bg-white/5 border-white/10 hover:border-indigo-500/50'
                            }`}
                          >
                            {/* Avatar */}
                            {profile?.role === 'mentor' ? (
                              booking.student_avatar ? (
                                <img
                                  src={booking.student_avatar}
                                  alt={booking.student_name || 'Student'}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
                                  <span className="text-lg text-indigo-400">
                                    {booking.student_name?.[0]?.toUpperCase() || 'S'}
                                  </span>
                                </div>
                              )
                            ) : (
                              booking.mentor_avatar ? (
                                <img
                                  src={booking.mentor_avatar}
                                  alt={booking.mentor_name || 'Mentor'}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
                                  <span className="text-lg text-indigo-400">
                                    {booking.mentor_name?.[0]?.toUpperCase() || 'M'}
                                  </span>
                                </div>
                              )
                            )}

                            {/* Session Info */}
                            <div className="flex-1">
                              <div className="font-medium">
                                {profile?.role === 'mentor' 
                                  ? `Session with ${booking.student_name || 'Student'}`
                                  : `Session with ${booking.mentor_name || 'Mentor'}`}
                              </div>
                              <div className="text-sm text-gray-400">
                                {startTime.toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })} at {startTime.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })} - {endTime.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  booking.status === 'confirmed'
                                    ? 'bg-green-600/20 text-green-400'
                                    : booking.status === 'pending'
                                    ? 'bg-yellow-600/20 text-yellow-400'
                                    : booking.status === 'completed'
                                    ? 'bg-blue-600/20 text-blue-400'
                                    : booking.status === 'cancelled'
                                    ? 'bg-red-600/20 text-red-400'
                                    : 'bg-gray-600/20 text-gray-400'
                                }`}>
                                  {booking.status}
                                </span>
                                {isPast && (
                                  <span className="text-xs text-gray-500">Past</span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                              {booking.meeting_link && isUpcoming && (
                                <a
                                  href={booking.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition text-sm font-medium"
                                >
                                  Join Meet
                                </a>
                              )}
                              {profile?.role === 'mentor' && isUpcoming && booking.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg transition text-sm font-medium text-red-400"
                                >
                                  Cancel
                                </button>
                              )}
                              {profile?.role === 'student' && booking.mentor_id && (
                                <Link
                                  href={`/mentors/${booking.mentor_id}`}
                                  className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                                >
                                  View Profile →
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    {bookings.filter((b) => {
                      const startTime = new Date(b.start_time);
                      const now = new Date();
                      return startTime >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    }).length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <p>No upcoming or recent sessions</p>
                        <p className="text-sm mt-2">Book a session to get started</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* My Students / My Mentors */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 md:col-span-2 lg:col-span-3">
                <h3 className="text-xl font-semibold mb-4">
                  {profile?.role === 'mentor' ? 'My Students' : 'My Mentors'}
                </h3>
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No {profile?.role === 'mentor' ? 'students' : 'mentors'} yet</p>
                    <p className="text-sm mt-2">
                      {profile?.role === 'mentor' 
                        ? 'Your students will appear here once they book sessions with you'
                        : 'Your mentors will appear here once you book sessions with them'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile?.role === 'mentor' ? (
                      // My Students - Show unique students
                      (() => {
                        const uniqueStudents = Array.from(
                          new Map(
                            bookings.map((b) => [b.student_id, {
                              id: b.student_id,
                              name: b.student_name,
                              avatar: b.student_avatar,
                              bookings: bookings.filter((bk) => bk.student_id === b.student_id),
                            }])
                          ).values()
                        );
                        return uniqueStudents.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-indigo-500/50 transition"
                          >
                            {student.avatar ? (
                              <img
                                src={student.avatar}
                                alt={student.name || 'Student'}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
                                <span className="text-lg text-indigo-400">
                                  {student.name?.[0]?.toUpperCase() || 'S'}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-gray-400">
                                {student.bookings.length} session{student.bookings.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div className="text-sm text-gray-400">
                              {student.bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length} active
                            </div>
                          </div>
                        ));
                      })()
                    ) : (
                      // My Mentors - Show unique mentors
                      (() => {
                        const uniqueMentors = Array.from(
                          new Map(
                            bookings.map((b) => [b.mentor_id, {
                              id: b.mentor_id,
                              name: b.mentor_name,
                              avatar: b.mentor_avatar,
                              bookings: bookings.filter((bk) => bk.mentor_id === b.mentor_id),
                            }])
                          ).values()
                        );
                        return uniqueMentors.map((mentor) => (
                          <div
                            key={mentor.id}
                            className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-indigo-500/50 transition"
                          >
                            {mentor.avatar ? (
                              <img
                                src={mentor.avatar}
                                alt={mentor.name || 'Mentor'}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
                                <span className="text-lg text-indigo-400">
                                  {mentor.name?.[0]?.toUpperCase() || 'M'}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{mentor.name}</div>
                              <div className="text-sm text-gray-400">
                                {mentor.bookings.length} session{mentor.bookings.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <Link
                              href={`/mentors/${mentor.id}`}
                              className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                            >
                              View Profile →
                            </Link>
                          </div>
                        ));
                      })()
                    )}
                  </div>
                )}
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

