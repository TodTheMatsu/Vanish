import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { UserProfile } from '../types/user';
import { supabase } from '../supabaseClient';

interface UseSettingsProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onClose?: () => void; // Optional close handler
  fetchUserData?: () => Promise<void>; // Optional fetch user data
}

export const useSettings = ({ user, setUser, onClose, fetchUserData }: UseSettingsProps) => {
  const [tempUser, setTempUser] = useState(user);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Update tempUser when the user changes
  useEffect(() => {
    setTempUser(user);
  }, [user]);

  const handleUsernameChange = (val: string) => {
    const allowedRegex = /^[a-z0-9]*$/;
    if (!allowedRegex.test(val)) {
      setSettingsError('Username must only contain lowercase letters and numbers. No spaces or special characters.');
    } else {
      setSettingsError('');
    }
    setTempUser(prev => ({ ...prev, username: val }));
  };

  const handleDisplayNameChange = (val: string) =>
    setTempUser(prev => ({ ...prev, displayName: val }));

  const handleProfilePictureChange = (val: string) =>
    setTempUser(prev => ({ ...prev, profilePicture: val }));

  const handleSaveSettings = async () => {
    setIsSettingsLoading(true);
    if (!/^[a-z0-9]+$/.test(tempUser.username)) {
      setSettingsError('Username must only contain lowercase letters and numbers. No spaces or special characters.');
      setIsSettingsLoading(false);
      return false;
    }
    if (!/^https?:\/\/.+/.test(tempUser.profilePicture)) {
      setSettingsError('Profile picture must be a valid URL.');
      setIsSettingsLoading(false);
      return false;
    }
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.id) {
        setSettingsError("User not found");
        setIsSettingsLoading(false);
        return false;
      }
      const { error } = await supabase
        .from('profiles')
        .update({
          username: tempUser.username,
          display_name: tempUser.displayName,
          profile_picture: tempUser.profilePicture
        })
        .eq('user_id', currentUser.id);
      if (error) {
        setSettingsError(error.message);
        return false;
      } else {
        setUser(tempUser);
        if (fetchUserData) {
          await fetchUserData();
        }
        onClose?.();
        return true;
      }
    } catch (error) {
      setSettingsError('Error updating settings');
      console.error('Settings update error:', error);
      return false;
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return {
    tempUser,
    setTempUser,
    isSettingsLoading,
    settingsError,
    handleUsernameChange,
    handleDisplayNameChange,
    handleProfilePictureChange,
    handleSaveSettings,
    handleLogout,
    setIsSettingsLoading,
    setSettingsError,
  };
};