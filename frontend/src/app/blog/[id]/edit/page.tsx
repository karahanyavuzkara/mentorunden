'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  published: boolean;
  author_id: string;
}

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (params.id && user) {
      fetchBlog(params.id as string);
    }
  }, [params.id, user]);

  const fetchBlog = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user is the author
      if (data.author_id !== user?.id) {
        setError('You do not have permission to edit this blog post');
        return;
      }

      setBlog(data);
      setTitle(data.title);
      setExcerpt(data.excerpt || '');
      setContent(data.content);
      setFeaturedImage(data.featured_image || '');
      setPublished(data.published);
    } catch (err: any) {
      console.error('Error fetching blog:', err);
      setError(err.message || 'Blog post not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !blog) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('blogs')
        .update({
          title,
          excerpt: excerpt || null,
          content,
          featured_image: featuredImage || null,
          published,
        })
        .eq('id', blog.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push(`/blog/${blog.id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Error updating blog:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error && !blog) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link
            href="/blog"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
          >
            Back to Blog
          </Link>
        </main>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Edit Blog Post</h1>
            <p className="text-gray-400">Update your blog post</p>
          </div>

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6">
              Blog post updated successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter blog post title"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Excerpt (Short Summary)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="A brief summary of your blog post..."
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={15}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                placeholder="Write your blog post content here..."
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Featured Image URL (Optional)
              </label>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-5 h-5 rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="published" className="text-gray-300">
                Publish (uncheck to save as draft)
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Link
                href={`/blog/${blog?.id}`}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}

