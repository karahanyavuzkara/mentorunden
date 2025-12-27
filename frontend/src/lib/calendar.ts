// Google Calendar API utilities

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: 'hangoutsMeet';
      };
    };
  };
  attendees?: Array<{
    email: string;
  }>;
}

/**
 * Generate Google Calendar link with Google Meet
 */
export function generateGoogleCalendarLink(
  title: string,
  startTime: Date,
  endTime: Date,
  description?: string,
  location?: string
): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const start = formatDate(startTime);
  const end = formatDate(endTime);
  const desc = description ? `&details=${encodeURIComponent(description)}` : '';
  const loc = location ? `&location=${encodeURIComponent(location)}` : '';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}${desc}${loc}&sf=true&output=xml`;
}

/**
 * Generate Google Meet link
 * Note: In production, use Google Calendar API to create events with Meet links
 */
export function generateGoogleMeetLink(): string {
  // Generate a random meet code
  const meetCode = Math.random().toString(36).substring(2, 15);
  return `https://meet.google.com/${meetCode}`;
}

/**
 * Get available time slots for a specific date based on mentor availability
 */
export function getAvailableSlotsForDate(
  date: Date,
  availability: { timeSlots: Array<{ day: string; startTime: string; endTime: string }> },
  existingBookings: Array<{ start_time: string; end_time: string; status: string }> = []
): Array<{ start: Date; end: Date }> {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = dayNames[date.getDay()];
  
  // Find time slots for this day
  const daySlots = availability.timeSlots.filter(slot => slot.day === dayOfWeek);
  
  if (daySlots.length === 0) {
    return [];
  }

  const availableSlots: Array<{ start: Date; end: Date }> = [];
  const slotDuration = 60; // 60 minutes per slot

  daySlots.forEach(daySlot => {
    const [startHour, startMinute] = daySlot.startTime.split(':').map(Number);
    const [endHour, endMinute] = daySlot.endTime.split(':').map(Number);
    
    const slotStart = new Date(date);
    slotStart.setHours(startHour, startMinute, 0, 0);
    
    const slotEnd = new Date(date);
    slotEnd.setHours(endHour, endMinute, 0, 0);

    // Generate 60-minute slots within this time range
    let currentStart = new Date(slotStart);
    
    while (currentStart.getTime() + slotDuration * 60000 <= slotEnd.getTime()) {
      const currentEnd = new Date(currentStart.getTime() + slotDuration * 60000);
      
      // Check if this slot conflicts with existing bookings
      const hasConflict = existingBookings.some(booking => {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);
        
        // Check if booking is confirmed or pending
        if (booking.status !== 'confirmed' && booking.status !== 'pending') {
          return false;
        }
        
        // Check for overlap
        return (
          (currentStart >= bookingStart && currentStart < bookingEnd) ||
          (currentEnd > bookingStart && currentEnd <= bookingEnd) ||
          (currentStart <= bookingStart && currentEnd >= bookingEnd)
        );
      });

      // Only add if no conflict and slot is in the future
      if (!hasConflict && currentStart > new Date()) {
        availableSlots.push({
          start: new Date(currentStart),
          end: new Date(currentEnd),
        });
      }

      currentStart = new Date(currentStart.getTime() + slotDuration * 60000);
    }
  });

  return availableSlots;
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

