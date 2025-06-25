import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types/user';

interface SettingsModalProps {
  show: boolean;
  tempUser: UserProfile;
  isLoading: boolean;
  settingsError: string;
  onUsernameChange: (val: string) => void;
  onDisplayNameChange: (val: string) => void;
  onProfilePictureChange: (val: string) => void;
  onSave: () => void;
  onClose: () => void;
  onLogout: () => void;
}

export default function SettingsModal({
  show,
  tempUser,
  isLoading,
  settingsError,
  onUsernameChange,
  onDisplayNameChange,
  onProfilePictureChange,
  onSave,
  onClose,
  onLogout
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed text-white inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-neutral-900 rounded-xl p-6 max-w-2xl w-[90%] relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
              X
            </button>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <div className="space-y-6">
              {/* Profile Preview */}
              <div className="border border-neutral-700 rounded-lg p-4 flex items-center space-x-4">
                <img 
                  src={tempUser.profilePicture} 
                  alt="Profile Preview" 
                  className="w-16 h-16 rounded-full object-cover" 
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif" }}
                />
                <div>
                  <div className="font-bold">{tempUser.displayName}</div>
                  <div className="text-sm text-neutral-400">@{tempUser.username}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={tempUser.username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  className="w-full p-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  value={tempUser.displayName}
                  onChange={(e) => onDisplayNameChange(e.target.value)}
                  className="w-full p-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="onesignal-customlink-container">
                <button type="button" className='onesignal-customlink-subscribe medium button'></button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Profile Picture URL</label>
                <input
                  type="text"
                  value={tempUser.profilePicture}
                  onChange={(e) => onProfilePictureChange(e.target.value)}
                  className="w-full p-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {settingsError && <p className="text-red-500 text-sm text-center">{settingsError}</p>}
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  onClick={onSave}
                  disabled={isLoading}
                  className="w-full py-2 bg-blue-500 rounded-lg font-bold relative"
                >
                  <span className={isLoading ? "opacity-0" : "opacity-100"}>Save Changes</span>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className="w-full py-2 bg-transparent border-2 border-red-500 text-red-500 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-colors"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
