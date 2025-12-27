export type UserRole = 'student' | 'mentor' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mentor {
  id: string;
  userId: string;
  bio?: string;
  expertise: string[];
  hourlyRate?: number;
  availability?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  studentId: string;
  mentorId: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

