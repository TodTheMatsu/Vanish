import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCreateConversation, useSearchUsers } from '../../hooks/useMessages';
import { IoCloseOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';

interface NewConversationModalProps {
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  onClose,
  onConversationCreated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Array<{ id: string; username: string; display_name: string }>>([]);
  const [conversationType, setConversationType] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');

  const { data: searchResults = [] } = useSearchUsers(searchQuery);
  const createConversation = useCreateConversation();
  const { addToast } = useToast();

  const handleUserSelect = (user: { id: string; username: string; display_name: string }) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const conversationData = {
        type: conversationType,
        participantIds: selectedUsers.map(u => u.id),
        name: conversationType === 'group' ? groupName : undefined
      };

      const conversation = await createConversation.mutateAsync(conversationData);
      if (conversation.existing) {
        addToast('A direct message with this user already exists. Opening it...', 'info');
      }
      onConversationCreated(conversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const modal = (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl backdrop-blur-sm"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">New Conversation</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white hover:bg-neutral-800 p-1 rounded-lg transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conversation Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Conversation Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="direct"
                checked={conversationType === 'direct'}
                onChange={(e) => setConversationType(e.target.value as 'direct' | 'group')}
                className="mr-2 text-white"
              />
              <span className="text-white">Direct Message</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="group"
                checked={conversationType === 'group'}
                onChange={(e) => setConversationType(e.target.value as 'direct' | 'group')}
                className="mr-2 text-white"
              />
              <span className="text-white">Group Chat</span>
            </label>
          </div>
        </div>

        {/* Group Name (if group) */}
        {conversationType === 'group' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all duration-200"
            />
          </div>
        )}

        {/* Search Users */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Search Users
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or display name"
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all duration-200"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-4 max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedUsers.find(u => u.id === user.id)
                      ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-lg'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.profile_picture}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-600"
                    />
                    <div>
                      <p className="font-medium">{user.display_name || user.username}</p>
                      <p className="text-sm opacity-75">@{user.username}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-neutral-300 mb-2">Selected Users:</p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <span
                  key={user.id}
                  className="bg-white text-black px-3 py-1 rounded-full text-sm flex items-center shadow-lg"
                >
                  {user.display_name || user.username}
                  <button
                    onClick={() => handleUserSelect(user)}
                    className="ml-2 text-black/60 hover:text-black transition-colors"
                  >
                    <IoCloseOutline />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateConversation}
            disabled={selectedUsers.length === 0 || createConversation.isPending}
            className="px-4 py-2 bg-white hover:bg-neutral-200 disabled:bg-neutral-700 text-black disabled:text-neutral-500 rounded-xl transition-all duration-200 shadow-lg hover:shadow-white/25 disabled:shadow-none"
          >
            {createConversation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return ReactDOM.createPortal(modal, document.body);
};
