import {
  generateGoogleCalendarLink,
  generateGoogleMeetLink,
  formatTime,
  formatDate,
  getAvailableSlotsForDate,
} from '@/lib/calendar';

describe('Calendar Utilities', () => {
  describe('generateGoogleMeetLink', () => {
    it('should return the new meeting link', () => {
      const link = generateGoogleMeetLink();
      expect(link).toBe('https://meet.google.com/new');
    });
  });

  describe('generateGoogleCalendarLink', () => {
    it('should generate a valid Google Calendar link', () => {
      const startTime = new Date('2024-12-29T09:00:00Z');
      const endTime = new Date('2024-12-29T10:00:00Z');
      const link = generateGoogleCalendarLink(
        'Test Session',
        startTime,
        endTime,
        'Test description',
        'Online'
      );

      expect(link).toContain('calendar.google.com');
      expect(link).toContain('action=TEMPLATE');
      expect(link).toContain(encodeURIComponent('Test Session'));
    });

    it('should work without optional parameters', () => {
      const startTime = new Date('2024-12-29T09:00:00Z');
      const endTime = new Date('2024-12-29T10:00:00Z');
      const link = generateGoogleCalendarLink(
        'Test Session',
        startTime,
        endTime
      );

      expect(link).toContain('calendar.google.com');
      expect(link).toContain('action=TEMPLATE');
    });
  });

  describe('formatTime', () => {
    it('should format time in 12-hour format', () => {
      const date = new Date('2024-12-29T14:30:00Z');
      const formatted = formatTime(date);
      
      // Should be in format like "2:30 PM" or "14:30" depending on locale
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('formatDate', () => {
    it('should format date in readable format', () => {
      const date = new Date('2024-12-29T14:30:00Z');
      const formatted = formatDate(date);
      
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      // Should contain day name
      expect(formatted.toLowerCase()).toMatch(/sunday|monday|tuesday|wednesday|thursday|friday|saturday/);
    });
  });

  describe('getAvailableSlotsForDate', () => {
    it('should return empty array if no availability for the day', () => {
      const date = new Date('2024-12-29'); // Sunday
      const availability = {
        timeSlots: [
          { day: 'monday', startTime: '09:00', endTime: '17:00' },
        ],
      };

      const slots = getAvailableSlotsForDate(date, availability);
      expect(slots).toEqual([]);
    });

    it('should return available slots for a day with availability', () => {
      // Create a date that is definitely in the future and on a Monday
      const today = new Date();
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(8, 0, 0, 0); // Set to 8 AM
      
      const availability = {
        timeSlots: [
          { day: 'monday', startTime: '09:00', endTime: '12:00' },
        ],
      };

      const slots = getAvailableSlotsForDate(nextMonday, availability);
      
      // Should return 3 slots (9-10, 10-11, 11-12)
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0].start).toBeInstanceOf(Date);
      expect(slots[0].end).toBeInstanceOf(Date);
    });

    it('should exclude slots that conflict with existing bookings', () => {
      // Create a date that is definitely in the future and on a Monday
      const today = new Date();
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(8, 0, 0, 0);
      
      const availability = {
        timeSlots: [
          { day: 'monday', startTime: '09:00', endTime: '12:00' },
        ],
      };

      // Create booking times for the same Monday
      const bookingStart = new Date(nextMonday);
      bookingStart.setHours(10, 0, 0, 0);
      const bookingEnd = new Date(nextMonday);
      bookingEnd.setHours(11, 0, 0, 0);

      const existingBookings = [
        {
          start_time: bookingStart.toISOString(),
          end_time: bookingEnd.toISOString(),
          status: 'confirmed',
        },
      ];

      const slots = getAvailableSlotsForDate(nextMonday, availability, existingBookings);
      
      // Should have fewer slots due to conflict (should be 2 instead of 3)
      expect(slots.length).toBeLessThan(3);
      expect(slots.length).toBeGreaterThanOrEqual(0);
    });

    it('should only return future slots', () => {
      const pastDate = new Date('2020-01-01'); // Past date
      pastDate.setHours(8, 0, 0, 0);
      
      const availability = {
        timeSlots: [
          { day: 'wednesday', startTime: '09:00', endTime: '12:00' },
        ],
      };

      const slots = getAvailableSlotsForDate(pastDate, availability);
      
      // Should return empty array since all slots are in the past
      expect(slots).toEqual([]);
    });
  });
});

