import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user profile with role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email || '',
      role: profile?.role || 'student',
    };

    next();
  } catch (error: any) {
    return res.status(401).json({ error: 'Authentication failed', details: error.message });
  }
}

// Middleware to check if user has specific role
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role || 'student')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

