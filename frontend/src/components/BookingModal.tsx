'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getAvailableSlotsForDate, formatTime, generateGoogleMeetLink, generateGoogleCalendarLink } from '@/lib/calendar';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string;
  mentorName: string;
  hourlyRate: number | null;
  availability: any;
  onSuccess: () => void;
}


export default function BookingModal({
  isOpen,
  onClose,
  mentorId,
  mentorName,
  hourlyRate,
  availability,
  onSuccess,
}: BookingModalProps) {
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Array<{ start: Date; end: Date }>>([]);
  const [existingBookings, setExistingBookings] = useState<Array<{ start_time: string; end_time: string; status: string }>>([]);

  // Fetch existing bookings when date changes
  useEffect(() => {
    if (date && isOpen) {
      fetchExistingBookings();
    }
  }, [date, isOpen]);

  // Update available slots when date or bookings change
  useEffect(() => {
    if (date && availability) {
      const selectedDate = new Date(date);
      const slots = getAvailableSlotsForDate(selectedDate, availability, existingBookings);
      setAvailableSlots(slots);
      setSelectedSlot(null); // Reset selection when date changes
    }
  }, [date, availability, existingBookings]);

  const fetchExistingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time, status')
        .eq('mentor_id', mentorId)
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;
      setExistingBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available time slot');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to book a session');
      }

      // Generate Google Meet link
      const meetLink = generateGoogleMeetLink();
      const calendarLink = generateGoogleCalendarLink(
        `Mentoring Session with ${mentorName}`,
        selectedSlot.start,
        selectedSlot.end,
        notes || undefined
      );

      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          mentor_id: mentorId,
          start_time: selectedSlot.start.toISOString(),
          end_time: selectedSlot.end.toISOString(),
          status: 'pending',
          notes: notes || null,
          meeting_link: meetLink,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      console.log('✅ Booking created:', bookingData?.id);

      // Open Google Calendar link in new tab for user to add to calendar
      if (calendarLink && bookingData) {
        // Small delay to ensure booking is saved
        setTimeout(() => {
          window.open(calendarLink, '_blank');
        }, 500);
      }

      onSuccess();
      onClose();
      
      // Reset form
      setDate('');
      setSelectedSlot(null);
      setNotes('');
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Book a Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300">
            Booking with <span className="text-indigo-400 font-semibold">{mentorName}</span>
          </p>
          {hourlyRate && (
            <p className="text-sm text-gray-400 mt-1">
              Rate: ${hourlyRate}/hour
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Available Time Slots */}
          {date && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Available Time Slots *
              </label>
              {availableSlots.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">
                  {availability?.timeSlots?.length > 0 
                    ? 'No available slots for this date. Please select another date.'
                    : 'This mentor has not set their availability yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2 rounded-lg border transition ${
                        selectedSlot?.start.getTime() === slot.start.getTime()
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-white/10 border-white/20 text-gray-300 hover:border-indigo-500/50'
                      }`}
                    >
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any specific topics or questions you'd like to discuss..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Info */}
          <div className="bg-indigo-600/20 border border-indigo-500/50 rounded-lg p-4">
            <p className="text-sm text-indigo-300">
              📅 A Google Meet link will be generated for your session
            </p>
            <p className="text-xs text-indigo-400/80 mt-2">
              The mentor will receive a notification and can confirm or reschedule your booking.
            </p>
            <p className="text-xs text-indigo-400/80 mt-1">
              💡 Tip: You can add this to your Google Calendar after booking
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Book Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

