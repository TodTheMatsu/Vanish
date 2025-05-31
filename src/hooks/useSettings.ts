import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { useAuth } from '../AuthContext';
import { UserProfile } from '../types/user';
import { supabase } from '../supabaseClient';

interface UseSettingsProps {
  user: UserProfile | undefined;
  setUser: (user: Partial<UserProfile>) => Promise<void>;
  onClose?: () => void; // Optional close handler
  fetchUserData?: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<UserProfile, Error>>; // Optional fetch user data
}

export const useSettings = ({ user, setUser, onClose, fetchUserData }: UseSettingsProps) => {
  const [tempUser, setTempUser] = useState<UserProfile | undefined>(user);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

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
    if (tempUser) {
      setTempUser(prev => ({ ...prev!, username: val }));
    }
  };

  const handleDisplayNameChange = (val: string) => {
    if (tempUser) {
      setTempUser(prev => ({ ...prev!, displayName: val }));
    }
  };

  const handleProfilePictureChange = (val: string) => {
    if (tempUser) {
      setTempUser(prev => ({ ...prev!, profilePicture: val }));
    }
  };

  const handleSaveSettings = async () => {
    setIsSettingsLoading(true);
    
    if (!tempUser) {
      setSettingsError('No user data to save');
      setIsSettingsLoading(false);
      return false;
    }
    
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
        await setUser(tempUser);
        // Invalidate and refetch user data queries
        queryClient.invalidateQueries({ queryKey: ['userData', 'currentUser'] });
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