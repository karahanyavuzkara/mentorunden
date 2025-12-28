import request from 'supertest';
import express from 'express';
import bookingsRoutes from '../../routes/bookings';

// Mock Supabase client
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock email service
jest.mock('../../services/emailService', () => ({
  sendCancellationEmail: jest.fn().mockResolvedValue(true),
}));

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingsRoutes);

describe('Booking Cancellation Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if userId is missing', async () => {
    const response = await request(app)
      .post('/api/bookings/123/cancel')
      .send({})
      .expect(400);

    expect(response.body.message).toBe('User ID is required');
  });

  it('should return 404 if booking is not found', async () => {
    const { supabase } = require('../../lib/supabaseClient');
    
    // Mock the Supabase query chain for booking not found
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockSingle = jest.fn();
    const mockLimit = jest.fn();

    supabase.from.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return {
          select: mockSelect,
        };
      }
      return {
        select: mockSelect,
      };
    });

    // First call: try to get booking (returns error)
    mockSelect.mockReturnValueOnce({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      single: mockSingle,
    });
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' },
    });

    // Second call: try to get all bookings (for debugging)
    mockSelect.mockReturnValueOnce({
      limit: mockLimit,
    });
    mockLimit.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const response = await request(app)
      .post('/api/bookings/non-existent-id/cancel')
      .send({ userId: 'user123' })
      .expect(404);

    expect(response.body.message).toBe('Booking not found');
  });

  it('should return 403 if user is not the mentor', async () => {
    const { supabase } = require('../../lib/supabaseClient');
    
    // Mock the Supabase query chain
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockSingle = jest.fn();
    const mockUpdate = jest.fn();

    supabase.from.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return {
          select: mockSelect,
          update: mockUpdate,
        };
      }
      if (table === 'mentors') {
        return {
          select: mockSelect,
        };
      }
      if (table === 'profiles') {
        return {
          select: mockSelect,
        };
      }
      return {
        select: mockSelect,
      };
    });

    // Mock booking fetch
    mockSelect.mockReturnValueOnce({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      single: mockSingle,
    });
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'booking123',
        mentor_id: 'mentor123',
        student_id: 'student123',
        status: 'pending',
        start_time: '2024-12-29T09:00:00Z',
        end_time: '2024-12-29T10:00:00Z',
      },
      error: null,
    });

    // Mock mentor fetch
    mockSelect.mockReturnValueOnce({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      single: mockSingle,
    });
    mockSingle.mockResolvedValueOnce({
      data: {
        user_id: 'different-user-id', // Different from userId in request
      },
      error: null,
    });

    const response = await request(app)
      .post('/api/bookings/booking123/cancel')
      .send({ userId: 'user123' })
      .expect(403);

    expect(response.body.message).toBe('Only the mentor can cancel this booking');
  });
});

