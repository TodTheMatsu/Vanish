import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types/user';
import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';
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
  const [notifPermission, setNotifPermission] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (OneSignal && OneSignal.Notifications && typeof OneSignal.Notifications.permission === 'boolean') {
      setNotifPermission(OneSignal.Notifications.permission);
    }
  }, [show]);

  const handleEnableNotifications = () => {
    if (OneSignal.Notifications && OneSignal.Notifications.requestPermission) {
      OneSignal.Notifications.requestPermission().then(() => {
        setNotifPermission(OneSignal.Notifications.permission);
      });
    } else {
      alert('OneSignal is not initialized.');
    }
  };

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
            <h1 className="text-3xl mb-6">Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Profile Preview */}
              <div className="border border-neutral-700 rounded-lg p-6 flex flex-col items-center space-y-4 bg-neutral-800">
                <img 
                  src={tempUser.profilePicture} 
                  alt="Profile Preview" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg" 
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif" }}
                />
                <div className="text-center">
                  <div className="font-bold text-xl">{tempUser.displayName}</div>
                  <div className="text-sm text-neutral-400">@{tempUser.username}</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEnableNotifications}
                  className={`mt-4 w-full py-2 rounded-lg font-bold text-white transition-colors ${notifPermission ? 'bg-green-400 cursor-default' : 'bg-green-600 hover:bg-green-700'}`}
                  type="button"
                  disabled={notifPermission}
                >
                  {notifPermission ? 'Notifications Enabled' : 'Enable Notifications'}
                </motion.button>
              </div>

              {/* Right: Editable Fields */}
              <div className="space-y-6 flex flex-col justify-between h-full">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={tempUser.username}
                    onChange={(e) => onUsernameChange(e.target.value)}
                    className="w-full p-2 bg-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-neutral-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    value={tempUser.displayName}
                    onChange={(e) => onDisplayNameChange(e.target.value)}
                    className="w-full p-2 bg-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-neutral-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Picture URL</label>
                  <input
                    type="text"
                    value={tempUser.profilePicture}
                    onChange={(e) => onProfilePictureChange(e.target.value)}
                    className="w-full p-2 bg-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-neutral-700"
                  />
                </div>
                {settingsError && <p className="text-red-500 text-sm text-center">{settingsError}</p>}
                <div className="flex space-x-4 mt-4">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
