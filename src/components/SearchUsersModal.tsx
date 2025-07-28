import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types/user';

interface SearchUsersModalProps {
  show: boolean;
  onClose: () => void;
}

export default function SearchUsersModal({ show, onClose }: SearchUsersModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('username, display_name, profile_picture')
      .ilike('username', `%${searchQuery}%`);
    if (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      return;
    }
    if (data) {
      setResults(
        data.map((profile: any) => ({
          username: profile.username,
          displayName: profile.display_name,
          profilePicture: profile.profile_picture || "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif",
        }))
      );
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex text-white items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-neutral-900 rounded-xl p-6 max-w-lg w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl">Search Users</h2>
              <button onClick={onClose} className="text-neutral-400 hover:text-white">
                X
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 bg-neutral-800 rounded mb-4 text-white"
            />
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {results.map((user) => (
                  <li
                    key={user.username}
                    className="flex items-center space-x-3 p-2 hover:bg-neutral-800 rounded cursor-pointer"
                    onClick={() => {
                      // Navigate to the user's profile when clicked.
                      window.location.href = `/profile/${user.username}`;
                    }}
                  >
                    <img
                      src={user.profilePicture}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif";
                      }}
                    />
                    <div>
                      <div className="font-bold">{user.displayName}</div>
                      <div className="text-xs text-neutral-400">@{user.username}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}