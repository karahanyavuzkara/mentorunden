'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

interface CollabVideo {
  id: string;
  title: string;
  description: string | null;
  video_id: string;
  thumbnail_url: string | null;
  display_order: number;
}

export default function CollabPage() {
  const [videos, setVideos] = useState<CollabVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  // Extract YouTube video ID from URL or use as-is if it's already an ID
  const extractVideoId = (input: string): string => {
    if (!input) return '';
    
    let cleaned = input.trim();
    
    // Remove ?si=... and other query parameters
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

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('collab_videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Clean video IDs in case they contain full URLs and update thumbnail URLs
      const cleanedVideos = (data || []).map(video => {
        const cleanVideoId = extractVideoId(video.video_id);
        // Generate thumbnail URL if it's missing or contains old video ID
        const thumbnailUrl = video.thumbnail_url && video.thumbnail_url.includes(cleanVideoId)
          ? video.thumbnail_url
          : `https://img.youtube.com/vi/${cleanVideoId}/maxresdefault.jpg`;
        
        return {
          ...video,
          video_id: cleanVideoId,
          thumbnail_url: thumbnailUrl,
        };
      });
      
      setVideos(cleanedVideos);
    } catch (err: any) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-indigo-500">Collaborations</span> & Communities
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Watch our collaboration videos and learn from experienced mentors
          </p>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 transition group"
            >
              {/* Video Thumbnail/Embed */}
              <div 
                className="relative aspect-video bg-gray-900 cursor-pointer group/thumbnail overflow-hidden"
                onClick={() => setPlayingVideoId(playingVideoId === video.id ? null : video.id)}
              >
                {playingVideoId === video.id ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.video_id}?rel=0&autoplay=1&enablejsapi=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                    frameBorder="0"
                  />
                ) : (
                  <>
                    <img
                      src={video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover/thumbnail:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to hqdefault if maxresdefault fails
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('maxresdefault')) {
                          target.src = `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`;
                        } else if (target.src.includes('hqdefault')) {
                          // Final fallback to mqdefault
                          target.src = `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`;
                        }
                      }}
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/thumbnail:bg-black/20 transition">
                      <div className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center group-hover/thumbnail:bg-red-600 group-hover/thumbnail:scale-110 transition-transform shadow-lg">
                        <svg
                          className="w-10 h-10 text-white ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-400 transition">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-gray-400 text-sm mb-4">
                    {video.description}
                  </p>
                )}
                <a
                  href={`https://www.youtube.com/watch?v=${video.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition text-sm font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  Watch on YouTube
                </a>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Empty State (if no videos) */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No collaboration videos yet</p>
            <p className="text-gray-500 text-sm">
              Check back soon for new content!
            </p>
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

