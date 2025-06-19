import React, { useState } from 'react';
import { useCreateConversation, useSearchUsers } from '../../hooks/useMessages';

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
      onConversationCreated(conversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">New Conversation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conversation Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Conversation Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="direct"
                checked={conversationType === 'direct'}
                onChange={(e) => setConversationType(e.target.value as 'direct' | 'group')}
                className="mr-2"
              />
              <span className="text-white">Direct Message</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="group"
                checked={conversationType === 'group'}
                onChange={(e) => setConversationType(e.target.value as 'direct' | 'group')}
                className="mr-2"
              />
              <span className="text-white">Group Chat</span>
            </label>
          </div>
        </div>

        {/* Group Name (if group) */}
        {conversationType === 'group' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {/* Search Users */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search Users
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or display name"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
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
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedUsers.find(u => u.id === user.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.profile_picture}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
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
            <p className="text-sm font-medium text-gray-300 mb-2">Selected Users:</p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <span
                  key={user.id}
                  className="bg-purple-600 text-white px-2 py-1 rounded-full text-sm flex items-center"
                >
                  {user.display_name || user.username}
                  <button
                    onClick={() => handleUserSelect(user)}
                    className="ml-2 text-purple-200 hover:text-white"
                  >
                    ×
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
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateConversation}
            disabled={selectedUsers.length === 0 || createConversation.isPending}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {createConversation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};
