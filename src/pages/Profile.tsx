import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/useUserData';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';
import { Post } from '../hooks/usePosts';
import { PostList } from '../components/PostList'; // Import PostList

export default function Profile() {
  const { username: routeUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, loading, error, fetchUserData, setUser } = useUserData(routeUsername);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingBio, setEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(user?.bio || '');
  const [editingBanner, setEditingBanner] = useState(false);
  const [tempBannerUrl, setTempBannerUrl] = useState(user?.banner_url || '');
  const [settingsError, setSettingsError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setTempBio(user.bio || '');
      setTempBannerUrl(user.banner_url || '');
    }
  }, [user]);

  const fetchUserPosts = async () => {
    if (!user?.username) return;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, content, timestamp, expires_in,
          profiles:profiles ( username, display_name, profile_picture )
        `)
        .eq('profiles.username', user.username)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPosts = data.map((post: any) => ({
          id: post.id,
          content: post.content,
          timestamp: new Date(post.timestamp),
          expiresIn: post.expires_in,
          author: {
            username: post.profiles?.username || 'unknown',
            displayName: post.profiles?.display_name || 'Unknown',
            profilePicture: post.profiles?.profile_picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
          }
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [user?.username]);

  const handleSaveBio = async () => {
    setIsLoading(true);
    setSettingsError('');
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.id) {
        setSettingsError("User not found");
        setIsLoading(false);
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ bio: tempBio })
        .eq('user_id', currentUser.id);

      if (error) {
        setSettingsError(error.message);
      } else {
        setUser(prev => ({ ...prev, bio: tempBio }));
        setEditingBio(false);
      }
    } catch (error) {
      setSettingsError('Error updating bio');
      console.error('Bio update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBanner = async () => {
    setIsLoading(true);
    setSettingsError('');
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.id) {
        setSettingsError("User not found");
        setIsLoading(false);
        return;
      }
      // Validate that the banner picture is a valid URL.
      if (!/^https?:\/\/.+/.test(tempBannerUrl)) {
        setSettingsError('Banner picture must be a valid URL.');
        setIsLoading(false);
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ banner_url: tempBannerUrl })
        .eq('user_id', currentUser.id);

      if (error) {
        setSettingsError(error.message);
      } else {
        setUser(prev => ({ ...prev, banner_url: tempBannerUrl }));
        setEditingBanner(false);
      }
    } catch (error) {
      setSettingsError('Error updating banner');
      console.error('Banner update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error || !user) return <div className="flex justify-center items-center h-screen">User not found.</div>;

  return (
    <div className="flex min-h-screen w-screen bg-neutral-950">
      <Sidebar
        user={user}
        onNavigate={(path: string) => navigate(path)}
        onSettings={() => {}}
      />
      <main className="flex-1 flex flex-col items-center p-8">
        {/* Banner */}
        <div className="w-full max-w-[50%] relative">
          <img
            src={user.banner_url || 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG9vc203MHhsNWZjZzBoZG84a3I1dDN0d2swZHliMTV1YjVpenRhdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8592ghhkChZtlPckIT/giphy.gif'}
            alt="Banner"
            className="w-full h-48 object-cover rounded-md"
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG9vc203MHhsNWZjZzBoZG84a3I1dDN0d2swZHliMTV1YjVpenRhdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8592ghhkChZtlPckIT/giphy.gif'; }}
          />
          <button
            onClick={() => setEditingBanner(true)}
            className="absolute top-2 right-2 bg-neutral-800 text-white rounded-md p-2 text-sm hover:bg-neutral-700"
          >
            Edit Banner
          </button>

          {/* Profile picture overlapping banner and info box */}
          <img
            src={user.profilePicture}
            alt="Profile"
            className="absolute left-1/2 transform -translate-x-1/2 top-36 w-50 h-50 object-cover rounded-full border-4 border-neutral-800"
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'; }}
          />

          {editingBanner && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Banner URL"
                value={tempBannerUrl}
                onChange={e => setTempBannerUrl(e.target.value)}
                className="w-full p-2 bg-neutral-800 rounded-lg text-white"
              />
              <div className="flex justify-between mt-2">
                <button
                  onClick={handleSaveBanner}
                  disabled={isLoading}
                  className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Banner'}
                </button>
                <button
                  onClick={() => setEditingBanner(false)}
                  className="bg-neutral-700 text-white rounded-md p-2 hover:bg-neutral-600"
                >
                  Cancel
                </button>
              </div>
              {settingsError && <p className="text-red-500 text-sm mt-2">{settingsError}</p>}
            </div>
          )}
        </div>

        <div className="bg-neutral-900 rounded-lg shadow-lg p-8 pt-40 w-full max-w-1/2 flex flex-col items-center mt-4">
          <h2 className="text-2xl font-bold text-white mb-2">{user.displayName}</h2>
          <p className="text-neutral-400 mb-4">@{user.username}</p>

          {/* Bio */}
          <div className="w-full text-center">
            {editingBio ? (
              <>
                <textarea
                  value={tempBio}
                  onChange={e => setTempBio(e.target.value)}
                  className="w-full p-2 bg-neutral-800 rounded-lg text-white resize-none"
                  rows={3}
                />
                <div className="flex justify-between mt-2">
                  <button
                    onClick={handleSaveBio}
                    disabled={isLoading}
                    className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Bio'}
                  </button>
                  <button
                    onClick={() => setEditingBio(false)}
                    className="bg-neutral-700 text-white rounded-md p-2 hover:bg-neutral-600"
                  >
                    Cancel
                  </button>
                </div>
                {settingsError && <p className="text-red-500 text-sm mt-2">{settingsError}</p>}
              </>
            ) : (
              <>
                <p className="text-neutral-300 mb-4">{user.bio || 'No bio provided.'}</p>
                <button
                  onClick={() => setEditingBio(true)}
                  className="bg-neutral-800 text-white rounded-md p-2 text-sm hover:bg-neutral-700"
                >
                  Edit Bio
                </button>
              </>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="w-full max-w-2xl text-white mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Posts</h3>
          <PostList posts={posts} /> {/* Reuse PostList component */}
        </div>
      </main>
    </div>
  );
}