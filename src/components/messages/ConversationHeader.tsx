import React, { useState } from 'react';
import { useConversations, useLeaveConversation } from '../../hooks/useMessages';
import { ConversationPermissions } from '../../api/messagesApi';
import { useUser } from '../../UserContext';
import { IoPersonOutline, IoPeopleOutline, IoTimeOutline, IoHomeOutline } from 'react-icons/io5';

interface ConversationHeaderProps {
  conversationId: string;
  permissions?: ConversationPermissions | null;
  onShowConversationList?: () => void;
  showBackButton?: boolean;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({ 
  conversationId, 
  permissions,
  onShowConversationList,
  showBackButton = false
}) => {
  const { data: conversations } = useConversations();
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const leaveConversation = useLeaveConversation();
  const [showMenu, setShowMenu] = useState(false);
  const { userId: currentUserId } = useUser();

  const conversation = safeConversations.find(c => c.id === conversationId);
  
  if (!conversation) {
    return (
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
        <div className="animate-pulse h-6 bg-neutral-800 rounded w-32"></div>
      </div>
    );
  }

  // Get conversation info for display
  const getConversationInfo = () => {
    if (conversation.type === 'group') {
      return {
        name: conversation.name || 'Group Chat',
        subtitle: `${conversation.conversation_participants.filter(p => !p.left_at).length} members`,
        avatar: <IoPeopleOutline className="text-lg text-neutral-300" />
      };
    } else {
      // For direct messages, show the other person's info
      const otherParticipant = conversation.conversation_participants.find(
        p => p.user_id !== currentUserId && !p.left_at
      );
      
      if (otherParticipant && otherParticipant.user) {
        return {
          name: otherParticipant.user.display_name || otherParticipant.user.username || 'Unknown User',
          subtitle: otherParticipant.user.username ? `@${otherParticipant.user.username}` : 'Direct message',
          avatar: otherParticipant.user.profile_picture || <IoPersonOutline className="text-lg text-neutral-300" />
        };
      }
      
      return {
        name: 'Unknown User',
        subtitle: 'Direct message',
        avatar: <IoPersonOutline className="text-lg text-neutral-300" />
      };
    }
  };

  const { name, subtitle, avatar } = getConversationInfo();

  const handleLeaveConversation = async () => {
    if (window.confirm('Are you sure you want to leave this conversation?')) {
      try {
        await leaveConversation.mutateAsync(conversationId);
        // Navigation back to conversations list should be handled by parent
      } catch (error) {
        console.error('Failed to leave conversation:', error);
      }
    }
  };

  return (
    <div className="p-4 border-b border-neutral-800 flex items-center bg-neutral-900/80 backdrop-blur-sm">
      {/* Conversation info */}
      <div className="flex items-center space-x-3 flex-1">
        {/* Name and info */}
        <div>
          <h2 className="font-semibold text-white text-lg md:text-xl">{name}</h2>
          <div className="flex items-center space-x-2 text-sm text-neutral-400">
            <span>{subtitle}</span>
            {conversation.expires_at && (
              <>
                <span>•</span>
                <span className="text-yellow-400 flex items-center">
                  <IoTimeOutline className="mr-1" /> Auto-expires
                </span>
              </>
            )}
            {/* Only show Admin for group chats */}
            {conversation.type === 'group' && permissions?.isAdmin && (
              <>
                <span>•</span>
                <span className="text-white">Admin</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-10 backdrop-blur-sm">
            <div className="py-1">
              {conversation.type === 'group' && permissions?.isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // TODO: Open manage members modal
                      console.log('Manage members');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-lg mx-1"
                  >
                    Manage Members
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // TODO: Open settings modal
                      console.log('Conversation settings');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-lg mx-1"
                  >
                    Settings
                  </button>
                  <hr className="border-neutral-700 mx-2" />
                </>
              )}
              
              <button
                onClick={() => {
                  setShowMenu(false);
                  // TODO: Open conversation info
                  console.log('View info');
                }}
                className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-lg mx-1"
              >
                Conversation Info
              </button>
              
              <hr className="border-neutral-700 mx-2" />
              
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleLeaveConversation();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-800 rounded-lg mx-1"
                disabled={leaveConversation.isPending}
              >
                {leaveConversation.isPending ? 'Leaving...' : 'Leave Conversation'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};
