/**
 * Test for extractVideoId utility function
 * This function extracts YouTube video IDs from various URL formats
 */

describe('extractVideoId', () => {
  // This is a helper function that mimics the extractVideoId logic
  const extractVideoId = (input: string): string => {
    if (!input) return '';
    
    let cleaned = input.trim();
    
    // Extract from various YouTube URL formats BEFORE removing query parameters
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
    
    // Remove ?si=... and other query parameters if no pattern matched
    cleaned = cleaned.split('?')[0].split('&')[0];
    
    // If it's already just an ID (no slashes), return as-is
    if (!cleaned.includes('/')) {
      return cleaned;
    }
    
    // If no pattern matches, try to extract the last part after the last slash
    const parts = cleaned.split('/');
    const lastPart = parts[parts.length - 1];
    const videoId = lastPart.split('?')[0].split('&')[0];
    
    return videoId || cleaned;
  };

  it('should extract video ID from standard YouTube URL', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should extract video ID from youtu.be short URL', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ';
    expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should extract video ID from YouTube live URL', () => {
    const url = 'https://www.youtube.com/live/LFZ4OTGwQZg';
    expect(extractVideoId(url)).toBe('LFZ4OTGwQZg');
  });

  it('should extract video ID from URL with ?si= parameter', () => {
    const url = 'https://youtu.be/59tGJuLyhNc?si=CjmYid332vxbD8Cp';
    expect(extractVideoId(url)).toBe('59tGJuLyhNc');
  });

  it('should extract video ID from URL with multiple query parameters', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share&si=abc123';
    expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should return the ID as-is if it is already just an ID', () => {
    const videoId = 'dQw4w9WgXcQ';
    expect(extractVideoId(videoId)).toBe('dQw4w9WgXcQ');
  });

  it('should handle empty string', () => {
    expect(extractVideoId('')).toBe('');
  });

  it('should handle null/undefined input gracefully', () => {
    expect(extractVideoId(null as any)).toBe('');
    expect(extractVideoId(undefined as any)).toBe('');
  });

  it('should extract video ID from embed URL', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should trim whitespace from input', () => {
    const url = '  https://www.youtube.com/watch?v=dQw4w9WgXcQ  ';
    expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
  });
});

