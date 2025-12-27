'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author_id: string;
  author_name: string | null;
  author_avatar: string | null;
  created_at: string;
  updated_at: string;
  views: number;
  published: boolean;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchBlog(params.id as string);
    }
  }, [params.id]);

  const fetchBlog = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles!blogs_author_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user can view this blog
      if (!data.published && data.author_id !== user?.id) {
        setError('This blog post is not available');
        return;
      }

      // Transform data
      const blogData: Blog = {
        id: data.id,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        featured_image: data.featured_image,
        author_id: data.author_id,
        author_name: data.profiles?.full_name || 'Anonymous',
        author_avatar: data.profiles?.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
        views: data.views || 0,
        published: data.published,
      };

      setBlog(blogData);

      // Increment view count (only for published blogs)
      if (data.published) {
        await supabase
          .from('blogs')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id);
      }
    } catch (err: any) {
      console.error('Error fetching blog:', err);
      setError(err.message || 'Blog post not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!blog || !user || blog.author_id !== user.id) return;
    
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blog.id);

      if (error) throw error;

      router.push('/blog');
    } catch (err: any) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog post');
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

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-gray-400 mb-8">{error || 'The blog post you are looking for does not exist.'}</p>
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
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition"
        >
          ← Back to Blog
        </Link>

        {/* Author Actions (if owner) */}
        {user && user.id === blog.author_id && (
          <div className="mb-6 flex gap-4">
            <Link
              href={`/blog/${blog.id}/edit`}
              className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 rounded-lg transition text-indigo-400"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg transition text-red-400"
            >
              Delete
            </button>
          </div>
        )}

        {/* Featured Image */}
        {blog.featured_image && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{blog.title}</h1>

        {/* Meta Info */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {blog.author_avatar ? (
              <img
                src={blog.author_avatar}
                alt={blog.author_name || 'Author'}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
                <span className="text-sm text-indigo-400">
                  {blog.author_name?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
            )}
            <div>
              <div className="font-medium">{blog.author_name}</div>
              <div className="text-sm text-gray-400">
                {new Date(blog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {blog.views} views
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
            {blog.content}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm mt-16">
        © {new Date().getFullYear()} Mentorunden. All rights reserved.
      </footer>
    </div>
  );
}

