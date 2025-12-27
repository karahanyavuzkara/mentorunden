'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import AdminRoute from '@/components/AdminRoute';

interface CollabVideo {
  id: string;
  title: string;
  description: string | null;
  video_id: string;
  thumbnail_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface Blog {
  id: string;
  title: string;
  excerpt: string | null;
  author_id: string;
  author_name: string | null;
  published: boolean;
  created_at: string;
  views: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'videos' | 'blogs'>('videos');
  
  // Collab Videos State
  const [videos, setVideos] = useState<CollabVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<CollabVideo | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    video_id: '',
    display_order: 0,
    is_active: true,
  });

  // Blogs State
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'videos') {
      fetchVideos();
    } else {
      fetchBlogs();
    }
  }, [activeTab]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('collab_videos')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      alert('Failed to fetch videos: ' + err.message);
    } finally {
      setVideosLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          excerpt,
          author_id,
          published,
          created_at,
          views,
          profiles!blogs_author_id_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const blogsWithAuthors = data?.map((blog: any) => ({
        id: blog.id,
        title: blog.title,
        excerpt: blog.excerpt,
        author_id: blog.author_id,
        author_name: blog.profiles?.full_name || 'Anonymous',
        published: blog.published,
        created_at: blog.created_at,
        views: blog.views || 0,
      })) || [];

      setBlogs(blogsWithAuthors);
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      alert('Failed to fetch blogs: ' + err.message);
    } finally {
      setBlogsLoading(false);
    }
  };

  // Extract YouTube video ID from URL or use as-is if it's already an ID
  const extractVideoId = (input: string): string => {
    if (!input) return '';
    
    let cleaned = input.trim();
    
    // Remove ?si=... and other query parameters first
    cleaned = cleaned.split('?')[0].split('&')[0];
    
    // If it's already just an ID (no slashes), return as-is
    if (!cleaned.includes('/')) {
      return cleaned;
    }
    
    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([^&\s?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        // Remove any query parameters from the extracted ID
        return match[1].split('?')[0].split('&')[0];
      }
    }
    
    // If no pattern matches, try to extract the last part after the last slash
    const parts = cleaned.split('/');
    const lastPart = parts[parts.length - 1];
    const videoId = lastPart.split('?')[0].split('&')[0];
    
    return videoId || cleaned;
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract video ID from URL if needed
    const videoId = extractVideoId(videoForm.video_id);
    
    if (!videoId) {
      alert('Please enter a valid YouTube video ID or URL');
      return;
    }
    
    try {
      if (editingVideo) {
        // Update existing video
        const { error } = await supabase
          .from('collab_videos')
          .update({
            title: videoForm.title,
            description: videoForm.description || null,
            video_id: videoId,
            thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            display_order: videoForm.display_order,
            is_active: videoForm.is_active,
          })
          .eq('id', editingVideo.id);

        if (error) throw error;
      } else {
        // Create new video
        const { error } = await supabase
          .from('collab_videos')
          .insert({
            title: videoForm.title,
            description: videoForm.description || null,
            video_id: videoId,
            thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            display_order: videoForm.display_order,
            is_active: videoForm.is_active,
          });

        if (error) throw error;
      }

      // Reset form and refresh
      setVideoForm({
        title: '',
        description: '',
        video_id: '',
        display_order: 0,
        is_active: true,
      });
      setShowVideoForm(false);
      setEditingVideo(null);
      await fetchVideos();
    } catch (err: any) {
      console.error('Error saving video:', err);
      alert('Failed to save video: ' + err.message);
    }
  };

  const handleEditVideo = (video: CollabVideo) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description || '',
      video_id: video.video_id,
      display_order: video.display_order,
      is_active: video.is_active,
    });
    setShowVideoForm(true);
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('collab_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchVideos();
    } catch (err: any) {
      console.error('Error deleting video:', err);
      alert('Failed to delete video: ' + err.message);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBlogs();
    } catch (err: any) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog: ' + err.message);
    }
  };

  const handleToggleBlogPublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await fetchBlogs();
    } catch (err: any) {
      console.error('Error toggling blog status:', err);
      alert('Failed to update blog: ' + err.message);
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            Admin <span className="text-indigo-500">Panel</span>
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-white/10">
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'videos'
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Collab Videos
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'blogs'
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Blog Posts
            </button>
          </div>

          {/* Collab Videos Tab */}
          {activeTab === 'videos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Collab Videos</h2>
                <button
                  onClick={() => {
                    setEditingVideo(null);
                    setVideoForm({
                      title: '',
                      description: '',
                      video_id: '',
                      display_order: 0,
                      is_active: true,
                    });
                    setShowVideoForm(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                >
                  + Add Video
                </button>
              </div>

              {/* Video Form */}
              {showVideoForm && (
                <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">
                    {editingVideo ? 'Edit Video' : 'Add New Video'}
                  </h3>
                  <form onSubmit={handleVideoSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                        required
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={videoForm.description}
                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        YouTube Video ID *
                      </label>
                      <input
                        type="text"
                        value={videoForm.video_id}
                        onChange={(e) => setVideoForm({ ...videoForm, video_id: e.target.value })}
                        required
                        placeholder="e.g., dQw4w9WgXcQ"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Extract from YouTube URL: https://youtu.be/VIDEO_ID
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={videoForm.display_order}
                          onChange={(e) => setVideoForm({ ...videoForm, display_order: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center gap-4 pt-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={videoForm.is_active}
                            onChange={(e) => setVideoForm({ ...videoForm, is_active: e.target.checked })}
                            className="w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-300">Active</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                      >
                        {editingVideo ? 'Update' : 'Create'} Video
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowVideoForm(false);
                          setEditingVideo(null);
                        }}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Videos List */}
              {videosLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p>No videos yet. Add your first video!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="p-6 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{video.title}</h3>
                            {!video.is_active && (
                              <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                                Inactive
                              </span>
                            )}
                            <span className="text-sm text-gray-400">
                              Order: {video.display_order}
                            </span>
                          </div>
                          {video.description && (
                            <p className="text-gray-400 text-sm mb-2">{video.description}</p>
                          )}
                          <p className="text-gray-500 text-xs">
                            Video ID: {video.video_id}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditVideo(video)}
                            className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 rounded-lg transition text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg transition text-sm text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Blogs Tab */}
          {activeTab === 'blogs' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Blog Posts</h2>
              {blogsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : blogs.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p>No blog posts yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="p-6 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{blog.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${
                              blog.published
                                ? 'bg-green-600/20 text-green-400'
                                : 'bg-gray-700 text-gray-300'
                            }`}>
                              {blog.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          {blog.excerpt && (
                            <p className="text-gray-400 text-sm mb-2">{blog.excerpt}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Author: {blog.author_name}</span>
                            <span>Views: {blog.views}</span>
                            <span>
                              {new Date(blog.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleBlogPublished(blog.id, blog.published)}
                            className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 rounded-lg transition text-sm"
                          >
                            {blog.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <a
                            href={`/blog/${blog.id}/edit`}
                            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-lg transition text-sm"
                          >
                            Edit
                          </a>
                          <button
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg transition text-sm text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </AdminRoute>
  );
}

