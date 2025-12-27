'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import BookingModal from '@/components/BookingModal';
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

interface Review {
  id: string;
  mentor_id: string;
  student_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  student_name: string | null;
  student_avatar: string | null;
}

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ role: string } | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchMentor(params.id as string);
      fetchReviews(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

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
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    // Refresh page or show success message
    router.refresh();
  };

  const fetchReviews = async (mentorId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_student_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedReviews = data?.map((review: any) => ({
        id: review.id,
        mentor_id: review.mentor_id,
        student_id: review.student_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        updated_at: review.updated_at,
        student_name: review.profiles?.full_name || 'Anonymous',
        student_avatar: review.profiles?.avatar_url,
      })) || [];

      setReviews(transformedReviews);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };


  const handleSubmitReview = async () => {
    if (!user || !mentor) return;

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          mentor_id: mentor.id,
          student_id: user.id,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        });

      if (error) throw error;

      // Refresh reviews and mentor data
      await fetchReviews(mentor.id);
      await fetchMentor(mentor.id);
      
      // Reset form
      setReviewRating(5);
      setReviewComment('');
      setShowReviewForm(false);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
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

          {/* Availability */}
          {mentor.availability?.timeSlots && mentor.availability.timeSlots.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Availability</h2>
              <div className="space-y-2">
                {mentor.availability.timeSlots.map((slot: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 text-gray-300">
                    <span className="capitalize font-medium w-24">{slot.day}</span>
                    <span className="text-indigo-400">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
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

        {/* Reviews Section */}
        <div className="mt-12 bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Reviews</h2>
            {user && userProfile?.role === 'student' && !reviews.some(r => r.student_id === user.id) && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition text-sm font-medium"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && user && userProfile?.role === 'student' && (
            <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              
              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-3xl transition ${
                        star <= reviewRating
                          ? 'text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Share your experience with this mentor..."
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No reviews yet. Be the first to review this mentor!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-6 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {review.student_avatar ? (
                      <img
                        src={review.student_avatar}
                        alt={review.student_name || 'Student'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
                        <span className="text-lg text-indigo-400">
                          {review.student_name?.[0]?.toUpperCase() || 'S'}
                        </span>
                      </div>
                    )}

                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">
                            {review.student_name || 'Anonymous'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-lg ${
                                    star <= review.rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-400">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-gray-300 mt-3 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm mt-16">
        © {new Date().getFullYear()} Mentorunden. All rights reserved.
      </footer>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        mentorId={mentor.id}
        mentorName={mentor.full_name || 'Mentor'}
        hourlyRate={mentor.hourly_rate}
        availability={mentor.availability || { timeSlots: [] }}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}

