'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface MentorProfile {
  id: string;
  user_id: string;
  bio: string | null;
  expertise: string[];
  hourly_rate: number | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setBio(profileData.bio || '');
        setAvatarPreview(profileData.avatar_url);
      }

      // Fetch mentor profile if user is a mentor
      if (profileData?.role === 'mentor') {
        const { data: mentorData, error: mentorError } = await supabase
          .from('mentors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (mentorError && mentorError.code !== 'PGRST116') {
          // Mentor record doesn't exist, but user is marked as mentor
          // This is okay - we'll create it when they save
          console.log('Mentor record not found, will be created on save');
          setExpertise([]);
        } else if (mentorData) {
          setMentorProfile(mentorData);
          setExpertise(mentorData.expertise || []);
          setHourlyRate(mentorData.hourly_rate || null);
          // Use mentor bio if available, otherwise use profile bio
          if (mentorData.bio) {
            setBio(mentorData.bio);
          }
        } else {
          // Mentor record doesn't exist yet
          setHourlyRate(null);
        }
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      let avatarUrl = profile?.avatar_url || null;

      // Upload new avatar if one was selected
      if (avatarFile) {
        setUploading(true);
        
        // Delete old avatar if it exists
        if (profile?.avatar_url) {
          await deleteOldAvatar(profile.avatar_url);
        }
        
        // Upload new avatar
        avatarUrl = await uploadAvatar(avatarFile);
        setUploading(false);
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          bio: bio || null,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update or create mentor profile if user is a mentor
      if (profile?.role === 'mentor') {
        if (mentorProfile) {
          // Update existing mentor profile
          const { error: mentorError } = await supabase
            .from('mentors')
            .update({
              bio: bio || null,
              expertise: expertise,
              hourly_rate: hourlyRate || null,
            })
            .eq('id', mentorProfile.id);

          if (mentorError) throw mentorError;
        } else {
          // Create new mentor profile if it doesn't exist
          const { data: newMentor, error: mentorError } = await supabase
            .from('mentors')
            .insert({
              user_id: user.id,
              bio: bio || null,
              expertise: expertise,
              hourly_rate: hourlyRate || null,
              is_active: true,
            })
            .select()
            .single();

          if (mentorError) throw mentorError;
          if (newMentor) {
            setMentorProfile(newMentor);
          }
        }
      }

      setSuccess(true);
      setEditing(false);
      setAvatarFile(null);
      await fetchProfile(); // Refresh profile data

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setAvatarPreview(profile.avatar_url);
    }
    if (mentorProfile) {
      setExpertise(mentorProfile.expertise || []);
      setHourlyRate(mentorProfile.hourly_rate || null);
      if (mentorProfile.bio) {
        setBio(mentorProfile.bio || '');
      }
    } else {
      setHourlyRate(null);
    }
    setAvatarFile(null);
    setNewExpertise('');
    setEditing(false);
    setError(null);
  };

  const addExpertise = () => {
    const trimmed = newExpertise.trim();
    if (trimmed && !expertise.includes(trimmed)) {
      setExpertise([...expertise, trimmed]);
      setNewExpertise('');
    }
  };

  const removeExpertise = (index: number) => {
    setExpertise(expertise.filter((_, i) => i !== index));
  };

  const handleExpertiseKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExpertise();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      // File path should NOT include 'avatars/' prefix when using .from('avatars')
      const filePath = fileName;

      // Delete any existing avatar first
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
        await supabase.storage
          .from('avatars')
          .remove(filesToDelete);
      }

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      throw err;
    }
  };

  const deleteOldAvatar = async (avatarUrl: string) => {
    if (!avatarUrl || !avatarUrl.includes('/storage/v1/object/public/avatars/')) return;
    
    try {
      // Extract file path from URL
      // URL format: https://xxx.supabase.co/storage/v1/object/public/avatars/user-id/filename.jpg
      const urlParts = avatarUrl.split('/storage/v1/object/public/avatars/');
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);
      
      if (error) {
        console.error('Error deleting old avatar:', error);
      }
    } catch (err) {
      console.error('Error deleting old avatar:', err);
      // Don't throw - it's okay if old avatar deletion fails
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8">Your Profile</h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Success/Error Messages */}
              {success && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
                  Profile updated successfully!
                </div>
              )}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Profile Card */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/50"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center">
                          <span className="text-3xl font-bold text-indigo-400">
                            {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      {editing && (
                        <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 rounded-full p-2 cursor-pointer transition">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                            disabled={uploading}
                          />
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </label>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">
                        {profile.full_name || 'No name set'}
                      </h2>
                      <p className="text-gray-400">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {!editing ? (
                      <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving || uploading}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
                        >
                          {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-300">{profile.full_name || 'Not set'}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    {editing ? (
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {profile.bio || 'No bio set'}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role
                    </label>
                    <div className="inline-block px-3 py-1 bg-indigo-600/20 border border-indigo-500/50 rounded-lg text-indigo-400 capitalize">
                      {profile.role}
                    </div>
                  </div>

                  {/* Hourly Rate (for mentors only) */}
                  {profile.role === 'mentor' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hourly Rate ($)
                      </label>
                      {editing ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            value={hourlyRate || ''}
                            onChange={(e) => setHourlyRate(e.target.value ? parseFloat(e.target.value) : null)}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your hourly rate (e.g., 50)"
                          />
                          <p className="text-xs text-gray-400">
                            Set your hourly rate in USD. This will be displayed on your mentor profile.
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-300">
                          {hourlyRate ? `$${hourlyRate}/hour` : 'Not set'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Expertise (for mentors only) */}
                  {profile.role === 'mentor' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expertise
                      </label>
                      {editing ? (
                        <div className="space-y-3">
                          {/* Existing expertise tags */}
                          <div className="flex flex-wrap gap-2">
                            {expertise.map((exp, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/20 border border-indigo-500/50 rounded-lg text-indigo-400"
                              >
                                {exp}
                                <button
                                  type="button"
                                  onClick={() => removeExpertise(index)}
                                  className="text-red-400 hover:text-red-300 transition"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          {/* Add new expertise */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newExpertise}
                              onChange={(e) => setNewExpertise(e.target.value)}
                              onKeyPress={handleExpertiseKeyPress}
                              placeholder="Add expertise (e.g., Cloud, AI, Web Development)"
                              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={addExpertise}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                            >
                              Add
                            </button>
                          </div>
                          <p className="text-xs text-gray-400">
                            Press Enter or click Add to add expertise tags
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {expertise.length > 0 ? (
                            expertise.map((exp, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/50 rounded-lg text-indigo-400"
                              >
                                {exp}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-400">No expertise added yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Account Info */}
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>Member since: {new Date(profile.created_at).toLocaleDateString()}</p>
                      <p>User ID: <span className="font-mono text-xs">{profile.id}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400">Profile not found</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

