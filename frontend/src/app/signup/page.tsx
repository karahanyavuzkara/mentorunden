'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center text-white">
          <p className="text-xl font-semibold drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
            Account created successfully ✨
          </p>
          <p className="mt-2 text-gray-400">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center px-6">

      {/* BACKGROUND GLOW */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/30 blur-[160px]" />
      <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[160px]" />

      <div className="relative z-10 w-full max-w-md">

        {/* TITLE ABOVE CARD */}
        <h1
          className="
            mb-12 text-center
            text-5xl font-extrabold text-white
            drop-shadow-[0_0_50px_rgba(255,255,255,0.95)]
          "
        >
          Sign Up
        </h1>

        {/* CARD */}
        <div className="rounded-2xl bg-black/60 backdrop-blur-xl p-8 shadow-lg shadow-black/40 border border-white/10">

          <p className="mb-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition">
              Sign In
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Full Name (optional)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="
                w-full rounded-xl bg-gray-700/40 px-5 py-3
                text-sm text-white placeholder-gray-400
                outline-none backdrop-blur-md
                focus:shadow-[0_0_20px_rgba(255,255,255,0.35)]
                transition
              "
            />

            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full rounded-xl bg-gray-700/40 px-5 py-3
                text-sm text-white placeholder-gray-400
                outline-none backdrop-blur-md
                focus:shadow-[0_0_20px_rgba(255,255,255,0.35)]
                transition
              "
            />

            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full rounded-xl bg-gray-700/40 px-5 py-3
                text-sm text-white placeholder-gray-400
                outline-none backdrop-blur-md
                focus:shadow-[0_0_20px_rgba(255,255,255,0.35)]
                transition
              "
            />

            <button
              type="submit"
              disabled={loading}
              className="
                mt-4 w-full rounded-xl bg-indigo-600 py-3
                font-semibold text-white
                transition
                hover:bg-indigo-700
                disabled:opacity-50
                shadow-[0_0_35px_rgba(99,102,241,0.5)]
                hover:shadow-[0_0_55px_rgba(99,102,241,0.8)]
              "
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}