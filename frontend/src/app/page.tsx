"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const [clicked, setClicked] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect logged in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogoClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
  };

  // Show loading or nothing while checking auth
  if (loading || user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* BACKGROUND GLOW */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/30 blur-[160px]" />
      <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[160px]" />

      {/* NAVBAR */}
      <nav className="fixed top-0 z-50 w-full bg-black/60 backdrop-blur-xl shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative flex h-16 items-center justify-between">

            {/* LEFT */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                onClick={handleLogoClick}
                className={`relative text-2xl font-bold tracking-wide text-indigo-500
                transition-all duration-300
                hover:scale-105
                hover:drop-shadow-[0_0_22px_rgba(99,102,241,0.9)]
                ${clicked ? "drop-shadow-[0_0_40px_rgba(99,102,241,1)] scale-110" : ""}
                `}
              >
                Mentorunden
                {clicked && (
                  <span className="absolute inset-0 rounded-full bg-indigo-500/40 blur-xl animate-ping" />
                )}
              </Link>
            </div>

            {/* CENTER SEARCH */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <input
                type="text"
                placeholder="Search mentors..."
                className="
                w-[420px]
                rounded-full
                bg-gray-700/40
                px-6 py-3
                text-sm text-white
                placeholder-gray-300
                outline-none
                backdrop-blur-md
                shadow-[0_0_10px_rgba(255,255,255,0.15)]
                transition
                "
              />
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-6">
              <Link
                href="/blog"
                className="text-gray-300 hover:text-white transition"
              >
                Blog
              </Link>

              <button className="text-gray-300 hover:text-white transition">
                EN
              </button>

              {loading ? (
                <span className="text-gray-400">Loading...</span>
              ) : user ? (
                // User is logged in, will be redirected to dashboard
                <div className="flex items-center gap-4">
                  <span className="text-gray-300 text-sm">{user.email}</span>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/signup"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-medium
                    shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/60"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <main className="relative min-h-screen max-w-7xl mx-auto mx-auto px-6 pt-32 pb-32 flex flex-col justify-center text-center">
        <h2 className="text-6xl font-extrabold leading-tight">
          Find Your{" "}
          <span className="text-indigo-500 drop-shadow-[0_0_30px_rgba(99,102,241,0.7)]">
            Perfect Mentor
          </span>
        </h2>

        <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-400">
          Learn faster by connecting with experienced mentors.
          Book 1-on-1 sessions, grow your skills, and level up your career.
        </p>

        <div className="mt-12 flex justify-center gap-6">
          <Link
            href="/mentors"
            className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-lg font-semibold
            shadow-[0_0_35px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_rgba(99,102,241,0.85)]"
          >
            Browse Mentors
          </Link>

          <Link
            href="/become-mentor"
            className="px-10 py-4 rounded-xl border border-white/20
            hover:bg-white/10 transition text-lg font-semibold
            shadow-[0_0_25px_rgba(255,255,255,0.08)] hover:shadow-[0_0_45px_rgba(99,102,241,0.4)]"
          >
            Become a Mentor
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div>
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Support
            </h4>
            <a
              href="mailto:mentorunden@gmail.com"
              className="mt-3 block text-sm text-gray-400 hover:text-indigo-500 transition"
            >
              mentorunden@gmail.com
            </a>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Mentorunden. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
