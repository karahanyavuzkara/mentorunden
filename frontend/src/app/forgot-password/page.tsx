'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setLoading(true);

   const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/update-password',
   });

   if (!error) {
      setSuccess(true);
   } else {
      console.error(error.message);
   }

   setLoading(false);
   };

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
          Forgot Password
        </h1>

        {/* CARD */}
        <div className="rounded-2xl bg-black/60 backdrop-blur-xl p-8 shadow-lg shadow-black/40 border border-white/10">

          {success ? (
            <div className="text-center text-sm text-green-400">
              If an account exists for this email, a reset link has been sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              <p className="text-center text-sm text-gray-400">
                Enter your email and we’ll send you a password reset link.
              </p>

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

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full rounded-xl bg-indigo-600 py-3
                  font-semibold text-white
                  transition
                  hover:bg-indigo-700
                  disabled:opacity-50
                  shadow-[0_0_35px_rgba(99,102,241,0.5)]
                  hover:shadow-[0_0_55px_rgba(99,102,241,0.8)]
                "
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {/* BACK TO LOGIN */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-indigo-400 transition"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
