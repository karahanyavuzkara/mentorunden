import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function BecomeMentorPage() {
  const googleFormsLink = 'https://forms.gle/9XGRXwP4zUZZJBVy9';

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Become a <span className="text-indigo-500">Mentor</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Share your expertise, guide others, and make a meaningful impact on someone's career journey.
          </p>
        </div>

        {/* What is Mentoring Section */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-indigo-400">What is Mentoring?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Mentoring is a powerful relationship where experienced professionals guide and support 
            those who are earlier in their careers. As a mentor, you'll share your knowledge, 
            provide insights, and help mentees navigate their professional challenges.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Through one-on-one sessions, you'll help students and professionals develop their skills, 
            build confidence, and achieve their career goals. Your experience becomes their roadmap to success.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-indigo-400">Why Become a Mentor?</h2>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 text-xl">✓</span>
              <span><strong className="text-white">Make a Real Impact:</strong> Help shape the next generation of professionals and see your mentees grow and succeed.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 text-xl">✓</span>
              <span><strong className="text-white">Share Your Expertise:</strong> Pass on your knowledge and experience to those who are eager to learn.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 text-xl">✓</span>
              <span><strong className="text-white">Expand Your Network:</strong> Connect with motivated individuals and build meaningful professional relationships.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 text-xl">✓</span>
              <span><strong className="text-white">Personal Growth:</strong> Teaching others helps you refine your own understanding and communication skills.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 text-xl">✓</span>
              <span><strong className="text-white">Flexible Schedule:</strong> Set your own availability and mentor on your own terms.</span>
            </li>
          </ul>
        </div>

        {/* Responsibilities Section */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-indigo-400">Mentor Responsibilities</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">1. Provide Guidance & Support</h3>
              <p className="text-gray-300 leading-relaxed">
                Offer practical advice based on your experience. Help mentees understand industry 
                best practices, career paths, and professional development opportunities.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">2. Share Knowledge & Resources</h3>
              <p className="text-gray-300 leading-relaxed">
                Share relevant resources, tools, and learning materials. Help mentees access 
                information that can accelerate their growth and development.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">3. Maintain Regular Communication</h3>
              <p className="text-gray-300 leading-relaxed">
                Commit to scheduled mentoring sessions. Be responsive to messages and maintain 
                consistent communication to build trust and rapport.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">4. Set Clear Expectations</h3>
              <p className="text-gray-300 leading-relaxed">
                Establish clear goals and expectations with your mentees. Define the scope of 
                mentoring, session frequency, and what mentees can expect from the relationship.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">5. Provide Constructive Feedback</h3>
              <p className="text-gray-300 leading-relaxed">
                Offer honest, constructive feedback that helps mentees improve. Be supportive 
                while also challenging them to grow beyond their comfort zones.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">6. Respect Confidentiality</h3>
              <p className="text-gray-300 leading-relaxed">
                Maintain confidentiality and respect the privacy of your mentees. Create a safe 
                space where they feel comfortable sharing challenges and concerns.
              </p>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-indigo-400">What We're Looking For</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-indigo-500">•</span>
              <span>Minimum 3+ years of professional experience in your field</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500">•</span>
              <span>Strong communication and interpersonal skills</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500">•</span>
              <span>Passion for teaching and helping others succeed</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500">•</span>
              <span>Ability to commit to regular mentoring sessions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500">•</span>
              <span>Patience and empathy in working with mentees at different skill levels</span>
            </li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/50 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community of mentors and start helping others achieve their goals. 
            Fill out our application form to get started.
          </p>
          <a
            href={googleFormsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-lg font-semibold transition
            shadow-[0_0_30px_rgba(99,102,241,0.45)] hover:shadow-[0_0_50px_rgba(99,102,241,0.75)]"
          >
            Apply to Become a Mentor
          </a>
          <p className="text-sm text-gray-400 mt-4">
            You'll be redirected to our application form
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm mt-16">
        © {new Date().getFullYear()} Mentorunden. All rights reserved.
      </footer>
    </div>
  );
}

