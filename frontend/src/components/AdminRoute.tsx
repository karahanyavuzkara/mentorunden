'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (authLoading) return;

      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ Error fetching profile:', error);
          throw error;
        }

        console.log('🔍 Admin check - User profile:', {
          userId: user.id,
          email: user.email,
          role: data?.role,
          is_admin: data?.is_admin,
        });

        // Check if user is admin (either role = 'admin' or is_admin = true)
        const userIsAdmin = data?.role === 'admin' || data?.is_admin === true;
        
        console.log('🔐 Admin check result:', userIsAdmin);

        if (userIsAdmin) {
          setIsAdmin(true);
        } else {
          console.warn('⚠️ User is not admin. Redirecting to dashboard.');
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('❌ Error checking admin role:', err);
        router.push('/dashboard');
      } finally {
        setCheckingRole(false);
      }
    };

    checkAdminRole();
  }, [user, authLoading, router]);

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}

