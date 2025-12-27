import express, { Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';
import { sendCancellationEmail } from '../services/emailService';

const router = express.Router();

// Cancel booking (mentor only)
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    console.log('=== Cancel booking request ===');
    console.log('Booking ID:', id);
    console.log('User ID:', userId);
    console.log('Booking ID type:', typeof id);
    console.log('Booking ID length:', id?.length);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    // First, get the booking - try with different approaches
    let booking = null;
    let bookingError = null;

    // Try exact match first
    const { data: bookingData, error: error1 } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error1) {
      console.error('Error fetching booking (exact match):', error1);
      bookingError = error1;
      
      // Try without .single() to see if there are any bookings
      const { data: allBookings, error: error2 } = await supabase
        .from('bookings')
        .select('id, mentor_id, student_id, status')
        .limit(10);
      
      console.log('Sample bookings in database:', allBookings);
      console.log('Error 2:', error2);
    } else {
      booking = bookingData;
    }

    if (bookingError && !booking) {
      console.error('Error fetching booking:', bookingError);
      return res.status(404).json({ 
        message: 'Booking not found',
        error: bookingError.message,
        details: bookingError,
        bookingId: id
      });
    }

    if (!booking) {
      console.error('Booking not found for ID:', id);
      return res.status(404).json({ 
        message: 'Booking not found',
        bookingId: id
      });
    }

    console.log('✅ Booking found:', {
      id: booking.id,
      mentor_id: booking.mentor_id,
      student_id: booking.student_id,
      status: booking.status
    });

    // Get mentor record to check if user is the mentor
    const { data: mentor, error: mentorError } = await supabase
      .from('mentors')
      .select('user_id')
      .eq('id', booking.mentor_id)
      .single();

    if (mentorError || !mentor) {
      console.error('Error fetching mentor:', mentorError);
      return res.status(404).json({ message: 'Mentor not found for this booking' });
    }

    // Check if user is the mentor
    if (mentor.user_id !== userId) {
      return res.status(403).json({ message: 'Only the mentor can cancel this booking' });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Get student and mentor profile info for email
    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', booking.student_id)
      .single();

    const { data: mentorProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', mentor.user_id)
      .single();

    // Send cancellation email to student
    try {
      await sendCancellationEmail({
        studentEmail: studentProfile?.email || '',
        studentName: studentProfile?.full_name || 'Student',
        mentorName: mentorProfile?.full_name || 'Mentor',
        sessionDate: new Date(booking.start_time),
        sessionTime: `${new Date(booking.start_time).toLocaleTimeString()} - ${new Date(booking.end_time).toLocaleTimeString()}`,
      });
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: error.message || 'Failed to cancel booking' });
  }
});

export default router;

