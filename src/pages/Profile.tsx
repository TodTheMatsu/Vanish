import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/useUserData';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';
import { Post } from '../hooks/usePosts';
import { PostList } from '../components/PostList'; // Import PostList
import SettingsModal from '../components/SettingsModal';
import { useSettings } from '../hooks/useSettings'; // Import the shared hook

export default function Profile() {
  const { username: routeUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, loading, error, setUser, fetchUserData } = useUserData(routeUsername);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingBio, setEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(user?.bio || '');
  const [editingBanner, setEditingBanner] = useState(false);
  const [tempBannerUrl, setTempBannerUrl] = useState(user?.banner_url || '');
  const [showSettings, setShowSettings] = useState(false);

  const {
    tempUser,
    isSettingsLoading,
    settingsError,
    setTempUser,
    handleUsernameChange,
    handleDisplayNameChange,
    handleProfilePictureChange,
    handleSaveSettings,
    handleLogout,
    setIsSettingsLoading,
    setSettingsError,
  } = useSettings({
    user,
    setUser,
    onClose: () => setShowSettings(false), // Close the modal
    fetchUserData: fetchUserData, // Refresh user data
  });

  useEffect(() => {
    if (user) {
      setTempBio(user.bio || '');
      setTempBannerUrl(user.banner_url || '');
    }
  }, [user]);

  // Fetch authenticated (current) user for the sidebar
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Error fetching current user", authError);
        return;
      }

      if (authUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, display_name, profile_picture')
          .eq('user_id', authUser.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile data", profileError);
          return;
        }

        if (profileData) {
          const fullUser = {
            ...authUser,
            username: profileData.username,
            displayName: profileData.display_name,
            profilePicture: profileData.profile_picture || 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif'
          };
          setCurrentUser(fullUser);
        }
      }
    };

    getCurrentUser();
  }, []);

  const fetchUserPosts = async () => {
    if (!routeUsername) return;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, content, timestamp, expires_in,
          profiles:profiles ( username, display_name, profile_picture )
        `)
        .eq('profiles.username', routeUsername)
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
            profilePicture: post.profiles?.profile_picture || 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif'
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
  }, [routeUsername]);

  const handleSaveBio = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.id) {
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ bio: tempBio })
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error updating bio:', error);
      } else {
        setUser(prev => ({ ...prev, bio: tempBio }));
        setEditingBio(false);
      }
    } catch (error) {
      console.error('Bio update error:', error);
    }
  };

  const handleSaveBanner = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.id) {
        return;
      }
      // Validate that the banner picture is a valid URL.
      if (!/^https?:\/\/.+/.test(tempBannerUrl)) {
        console.error('Banner picture must be a valid URL.');
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ banner_url: tempBannerUrl })
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error updating banner:', error);
      } else {
        setUser(prev => ({ ...prev, banner_url: tempBannerUrl }));
        setEditingBanner(false);
      }
    } catch (error) {
      console.error('Banner update error:', error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error || !user) return <div className="flex justify-center items-center h-screen">User not found.</div>;

  return (
    <>
      <div className="flex min-h-screen w-screen bg-neutral-950">
        {currentUser ? (
          <Sidebar
            user={currentUser}
            onNavigate={(path: string) => navigate(path)}
            onSettings={() => setShowSettings(true)} // Open settings modal
          />
        ) : (
          <div className="w-16 md:w-64 text-white bg-neutral-900 flex items-center justify-center">
            Loading...
          </div>
        )}
        <main className="flex-1 flex flex-col items-center p-8">
          {/* Banner */}
          <div className="w-full max-w-[50%] relative">
            <img
              src={user.banner_url || 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG9vc203MHhsNWZjZzBoZG84a3I1dDN0d2swZHliMTV1YjVpenRhdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8592ghhkChZtlPckIT/giphy.gif'}
              alt="Banner"
              className="w-full h-48 object-cover rounded-md"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG9vc203MHhsNWZjZzBoZG84a3I1dDN0d2swZHliMTV1YjVpenRhdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8592ghhkChZtlPckIT/giphy.gif';
              }}
            />

            {/* Show edit banner only if the current user owns this profile */}
            {routeUsername === currentUser?.username && (
              <button
                onClick={() => setEditingBanner(true)}
                className="absolute top-2 right-2 bg-neutral-800 text-white rounded-md p-2 text-sm hover:bg-neutral-700"
              >
                Edit Banner
              </button>
            )}

            {/* Profile picture overlapping banner and info box */}
            <img
              src={user.profilePicture}
              alt="Profile"
              className="absolute left-1/2 transform -translate-x-1/2 top-36 w-50 h-50 object-cover rounded-full border-4 border-neutral-800"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
              }}
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
                    disabled={loading}
                    className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Banner'}
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
                      disabled={loading}
                      className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Bio'}
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
                  {routeUsername === currentUser?.username && (
                    <button
                      onClick={() => setEditingBio(true)}
                      className="bg-neutral-800 text-white rounded-md p-2 text-sm hover:bg-neutral-700"
                    >
                      Edit Bio
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Posts */}
          <div className="w-full max-w-3xl text-white mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Posts</h3>
            <PostList posts={posts.filter(post => post.author.username === routeUsername)} />
          </div>
        </main>
      </div>

      <SettingsModal
        show={showSettings}
        tempUser={tempUser}
        isLoading={isSettingsLoading}
        settingsError={settingsError}
        onUsernameChange={handleUsernameChange}
        onDisplayNameChange={handleDisplayNameChange}
        onProfilePictureChange={handleProfilePictureChange}
        onSave={handleSaveSettings}
        onClose={() => setShowSettings(false)}
        onLogout={handleLogout}
      />
    </>
  );
}