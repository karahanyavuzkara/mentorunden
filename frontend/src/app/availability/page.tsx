'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

interface TimeSlot {
  day: string; // 'monday', 'tuesday', etc.
  startTime: string; // '09:00'
  endTime: string; // '17:00'
}

interface Availability {
  timeSlots: TimeSlot[];
  timezone?: string;
}

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export default function AvailabilityPage() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<Availability>({ timeSlots: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMentorAndAvailability();
    }
  }, [user]);

  const fetchMentorAndAvailability = async () => {
    if (!user) return;

    try {
      // Get mentor record
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentors')
        .select('id, availability')
        .eq('user_id', user.id)
        .single();

      if (mentorError) {
        if (mentorError.code === 'PGRST116') {
          setError('You need to be a mentor to set availability. Please apply to become a mentor first.');
        } else {
          throw mentorError;
        }
        setLoading(false);
        return;
      }

      setMentorId(mentorData.id);
      
      // Parse existing availability
      if (mentorData.availability && typeof mentorData.availability === 'object') {
        setAvailability(mentorData.availability as Availability);
      }
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = () => {
    setAvailability({
      ...availability,
      timeSlots: [
        ...availability.timeSlots,
        { day: 'monday', startTime: '09:00', endTime: '17:00' },
      ],
    });
  };

  const removeTimeSlot = (index: number) => {
    setAvailability({
      ...availability,
      timeSlots: availability.timeSlots.filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...availability.timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability({ ...availability, timeSlots: updated });
  };

  const handleSave = async () => {
    if (!mentorId || !user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('mentors')
        .update({
          availability: availability,
        })
        .eq('id', mentorId);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving availability:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !mentorId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          <main className="max-w-4xl mx-auto px-6 py-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Error</h1>
            <p className="text-gray-400 mb-8">{error}</p>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Manage Availability</h1>
            <p className="text-gray-400">Set your available time slots for mentoring sessions</p>
          </div>

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6">
              Availability updated successfully!
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Time Slots</h2>
              <button
                onClick={addTimeSlot}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                + Add Time Slot
              </button>
            </div>

            {availability.timeSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No time slots added yet</p>
                <p className="text-sm mt-2">Click "Add Time Slot" to set your availability</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availability.timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Day
                      </label>
                      <select
                        value={slot.day}
                        onChange={(e) => updateTimeSlot(index, 'day', e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {DAYS.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => removeTimeSlot(index)}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg transition text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

