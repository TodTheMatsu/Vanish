import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/useUserData';
import { usePostsByUsername, usePosts } from '../hooks/usePosts';
import Sidebar from '../components/Sidebar';
import { PostList } from '../components/PostList';
import SettingsModal from '../components/SettingsModal';
import CreatePostModal from '../components/CreatePostModal';
import { useSettings } from '../hooks/useSettings';
import { useUser } from '../UserContext';
import { useFollow, useFollowerCount, useFollowingCount } from '../hooks/useFollow';

export default function Profile() {
  // Handler for creating a post
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    await createPost({ content: newPost, expiresIn });
    setNewPost('');
  };

  const { username: routeUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, loading, error, setUser, fetchUserData, isUpdating } = useUserData(routeUsername);
  const { data: posts = [], isLoading: postsLoading } = usePostsByUsername(routeUsername || '');
  const { currentUser, updateUser } = useUser();
  const [editingBio, setEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(user?.bio || '');
  const [editingBanner, setEditingBanner] = useState(false);
  const [tempBannerUrl, setTempBannerUrl] = useState(user?.banner_url || '');
  const [showSettings, setShowSettings] = useState(false);
  const [showPostCreation, setShowPostCreation] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const { createPost } = usePosts();

  const {
    tempUser,
    isSettingsLoading,
    settingsError,
    handleUsernameChange,
    handleDisplayNameChange,
    handleProfilePictureChange,
    handleSaveSettings,
    handleLogout,
  } = useSettings({
    user: currentUser,
    setUser: updateUser,
    onClose: () => setShowSettings(false),
    fetchUserData: fetchUserData,
  });

  // --- Follower system hooks ---
  const myUserId = currentUser?.user_id;
  const targetUserId = user?.user_id;

  const {
    isFollowing,
    isLoading: followLoading,
    follow,
    unfollow,
    followPending,
    unfollowPending,
  } = useFollow(myUserId, targetUserId);

  const { data: followerCount } = useFollowerCount(targetUserId);
  const { data: followingCount } = useFollowingCount(targetUserId);

  useEffect(() => {
    if (user) {
      setTempBio(user.bio || '');
      setTempBannerUrl(user.banner_url || '');
    }
  }, [user]);

  // This effect is no longer needed as we're using the global user context

  const handleSaveBio = async () => {
    try {
      setUser({ ...user, bio: tempBio });
      setEditingBio(false);
    } catch (error) {
      console.error('Bio update error:', error);
    }
  };

  const handleSaveBanner = async () => {
    try {
      // Validate that the banner picture is a valid URL.
      if (!/^https?:\/\/.+/.test(tempBannerUrl)) {
        console.error('Banner picture must be a valid URL.');
        return;
      }
      setUser({ ...user, banner_url: tempBannerUrl });
      setEditingBanner(false);
    } catch (error) {
      console.error('Banner update error:', error);
    }
  };

  // Loading skeleton for profile
  const ProfileSkeleton = () => (
    <div className="animate-pulse w-full max-w-[50%]">
      <div className="w-full h-48 bg-neutral-800 rounded-md mb-4"></div>
      <div className="flex flex-col items-center mt-16">
        <div className="w-32 h-32 bg-neutral-700 rounded-full mb-4"></div>
        <div className="h-6 bg-neutral-700 w-48 rounded mb-2"></div>
        <div className="h-4 bg-neutral-700 w-32 rounded mb-4"></div>
        <div className="h-20 bg-neutral-800 w-full rounded mb-4"></div>
      </div>
    </div>
  );

  // Error display component
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="flex flex-col justify-center items-center h-screen text-white">
      <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md">
        <h3 className="text-xl font-bold mb-2">Error</h3>
        <p>{message}</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-4 rounded"
        >
          Return Home
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex min-h-screen w-screen bg-neutral-950">
      <Sidebar
        onNavigate={(path: string) => navigate(path)}
        onSettings={() => setShowSettings(true)}
        onCreatePost={() => setShowPostCreation(true)}
      />
      <main className="flex-1 flex flex-col items-center p-8">
        <ProfileSkeleton />
      </main>
    </div>
  );
  
  if (error || !user) return <ErrorDisplay message={error || "User not found."} />;

  return (
    <>
      <div className="flex md:h-screen w-screen bg-neutral-950">
        <Sidebar
          onNavigate={(path: string) => navigate(path)}
          onSettings={() => setShowSettings(true)}
          onCreatePost={() => setShowPostCreation(true)}
        />
        <main className="flex-1 flex flex-col items-center p-4 md:p-8 pb-14 md:pb-8 overflow-y-auto min-h-0">
          {/* Banner */}
          <div className="w-full max-w-3xl relative">
            <img
              src={user.banner_url || 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG9vc203MHhsNWZjZzBoZG84a3I1dDN0d2swZHliMTV1YjVpenRhdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8592ghhkChZtlPckIT/giphy.gif'}
              alt="Banner"
              className="w-full h-48 md:h-64 object-cover rounded-md shadow-lg transition-all duration-300 hover:opacity-95"
            onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG9vc203MHhsNWZjZzBoZG84a3I1dDN0d2swZHliMTV1YjVpenRhdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8592ghhkChZtlPckIT/giphy.gif';
              }}
            />

            {/* Show edit banner only if the current user owns this profile */}
            {routeUsername === currentUser?.username && (
              <button
                onClick={() => setEditingBanner(true)}
                className="absolute top-2 right-2 bg-neutral-800/80 text-white rounded-md p-2 text-sm hover:bg-neutral-700 transition-colors duration-200 backdrop-blur-sm"
              >
                Edit Banner
              </button>
            )}

            {/* Profile picture overlapping banner and info box */}
            <img
              src={user.profilePicture}
              alt="Profile"
              className="absolute left-1/2 z-20 transform -translate-x-1/2 top-36 w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-neutral-800 shadow-lg transition-transform duration-300 hover:scale-105"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
              }}
            />

            {editingBanner && (
              <div className="mt-4 ">
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
                    disabled={isUpdating}
                    className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Banner'}
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

          <div className="bg-neutral-900 rounded-lg shadow-lg p-6 md:p-8 pt-10 w-full max-w-3xl flex flex-col items-center mt-4 relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{user.displayName}</h2>
            <p className="text-neutral-400 mb-4">@{user.username}</p>
            {/* Follower/Following counts and Follow button */}
            <div className="flex items-center gap-4 mb-4">
              {myUserId && targetUserId && myUserId !== targetUserId && (
                followLoading ? (
                  <button disabled className="bg-neutral-700 text-white rounded-md px-4 py-2">Loading...</button>
                ) : isFollowing ? (
                  <button
                    onClick={() => unfollow()}
                    disabled={unfollowPending}
                    className="bg-neutral-700 text-white rounded-md px-4 py-2 hover:bg-neutral-600"
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    onClick={() => follow()}
                    disabled={followPending}
                    className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
                  >
                    Follow
                  </button>
                )
              )}
            </div>
            
            {/* User Stats */}
            <div className="flex w-full justify-center space-x-6 mb-6">
              <div className="text-center flex-1">
                <p className="text-xl font-bold text-white">{posts.filter(post => post.author.username === routeUsername).length}</p>
                <p className="text-sm text-neutral-400">Posts</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-xl font-bold text-white">{followerCount ?? 0}</p>
                <p className="text-sm text-neutral-400">Followers</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-xl font-bold text-white">{followingCount ?? 0}</p>
                <p className="text-sm text-neutral-400">Following</p>
              </div>
            </div>

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
                      disabled={isUpdating}
                      className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isUpdating ? 'Saving...' : 'Save Bio'}
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
                      className="bg-neutral-800 text-white rounded-md p-2 text-sm hover:bg-neutral-700 transition-colors duration-200"
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
            <h3 className="text-xl font-bold text-white mb-4 border-b border-neutral-800 pb-2">Posts</h3>
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-neutral-800 rounded-lg p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-neutral-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-neutral-700 w-1/4 rounded mb-2"></div>
                        <div className="h-3 bg-neutral-700 w-1/5 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-neutral-700 w-3/4 rounded mb-2"></div>
                    <div className="h-4 bg-neutral-700 w-1/2 rounded"></div>
                  </div>
                ))}
              </div>
            ) : posts.filter(post => post.author.username === routeUsername).length > 0 ? (
              <PostList posts={posts.filter(post => post.author.username === routeUsername)} />
            ) : (
              <div className="text-center py-8 bg-neutral-900 rounded-lg">
                <p className="text-neutral-400">No posts yet.</p>
                {routeUsername === currentUser?.username && (
                  <button 
                    onClick={() => navigate('/')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-200"
                  >
                    Create Your First Post
                  </button>
                )}
              </div>
            )}
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
      
      <CreatePostModal
        show={showPostCreation}
        newPost={newPost}
        expiresIn={expiresIn}
        onChange={setNewPost}
        onExpiresChange={setExpiresIn}
        onSubmit={handleCreatePost}
        onClose={() => setShowPostCreation(false)}
      />
    </>
  );
}