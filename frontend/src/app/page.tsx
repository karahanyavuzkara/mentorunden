import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* BACKGROUND GLOW */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/30 blur-[160px]" />
      <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[160px]" />

      {/* NAVBAR */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">

            {/* Logo with glow */}
            <Link
              href="/"
              className="text-2xl font-bold tracking-wide text-indigo-500
              drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]
              hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.9)]
              transition"
            >
              Mentorunden
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link
                href="/signin"
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
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-28 text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Find Your{" "}
          <span className="relative text-indigo-500 drop-shadow-[0_0_25px_rgba(99,102,241,0.6)]">
            Perfect Mentor
          </span>
        </h2>

        <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-400">
          Learn faster by connecting with experienced mentors.
          Book 1-on-1 sessions, grow your skills, and level up your career.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
          <Link
            href="/mentors"
            className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-lg font-semibold
            shadow-[0_0_30px_rgba(99,102,241,0.45)] hover:shadow-[0_0_50px_rgba(99,102,241,0.75)]"
          >
            Browse Mentors
          </Link>

          <Link
            href="/become-mentor"
            className="px-10 py-4 rounded-xl rounded-xl border border-white/20
            hover:bg-white/10 transition text-lg font-semibold
            shadow-[0_0_25px_rgba(255,255,255,0.08)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
          >
            Become a Mentor
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Mentorunden. All rights reserved.
      </footer>
    </div>
  );
}
