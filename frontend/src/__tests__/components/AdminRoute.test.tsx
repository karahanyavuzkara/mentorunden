import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import AdminRoute from '@/components/AdminRoute';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('AdminRoute Component', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render children when user is admin', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'admin@example.com' },
      loading: false,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'admin', is_admin: true },
            error: null,
          }),
        }),
      }),
    });

    render(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when user is not admin', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'user@example.com' },
      loading: false,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'student', is_admin: false },
            error: null,
          }),
        }),
      }),
    });

    render(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should redirect when user has is_admin flag set to true', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'mentor@example.com' },
      loading: false,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'mentor', is_admin: true },
            error: null,
          }),
        }),
      }),
    });

    render(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});

