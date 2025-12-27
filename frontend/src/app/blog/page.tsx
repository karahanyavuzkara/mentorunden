'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Blog {
  id: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  author_id: string;
  author_name: string | null;
  author_avatar: string | null;
  created_at: string;
  views: number;
}

export default function BlogPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      // Fetch published blogs with author information
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          excerpt,
          featured_image,
          author_id,
          created_at,
          views,
          profiles!blogs_author_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include author info
      const blogsWithAuthors = data?.map((blog: any) => ({
        id: blog.id,
        title: blog.title,
        excerpt: blog.excerpt,
        featured_image: blog.featured_image,
        author_id: blog.author_id,
        author_name: blog.profiles?.full_name || 'Anonymous',
        author_avatar: blog.profiles?.avatar_url,
        created_at: blog.created_at,
        views: blog.views || 0,
      })) || [];

      setBlogs(blogsWithAuthors);
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-indigo-500">Blog</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Insights, tips, and stories from our community
            </p>
          </div>
          {user && (
            <Link
              href="/blog/create"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition font-semibold
              shadow-[0_0_30px_rgba(99,102,241,0.45)] hover:shadow-[0_0_50px_rgba(99,102,241,0.75)]"
            >
              Create a Blog
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No blog posts yet</p>
            {user && (
              <Link
                href="/blog/create"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Be the first to create one!
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.id}`}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 transition group"
              >
                {blog.featured_image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-indigo-400 transition">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      {blog.author_avatar ? (
                        <img
                          src={blog.author_avatar}
                          alt={blog.author_name || 'Author'}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center">
                          <span className="text-xs text-indigo-400">
                            {blog.author_name?.[0]?.toUpperCase() || 'A'}
                          </span>
                        </div>
                      )}
                      <span>{blog.author_name}</span>
                    </div>
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm mt-16">
        © {new Date().getFullYear()} Mentorunden. All rights reserved.
      </footer>
    </div>
  );
}

