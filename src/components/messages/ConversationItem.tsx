import React from 'react';
import { Conversation } from '../../api/messagesApi';
import { useUnreadCount } from '../../hooks/useMessages';
import { useUser } from '../../UserContext';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick
}) => {
  const unreadCount = useUnreadCount(conversation.id);
  const { userId: currentUserId } = useUser();

  // Get other participants (exclude current user)
  const otherParticipants = conversation.conversation_participants.filter(
    participant => participant.left_at === null
  );

  // Determine conversation display name and avatar
  const getConversationInfo = () => {
    if (conversation.type === 'group') {
      return {
        name: conversation.name || 'Group Chat',
        avatar: '👥',
        isGroup: true
      };
    } else {
      // For direct messages, show the other person's info
      const otherParticipant = otherParticipants.find(
        p => p.user_id !== currentUserId
      );
      
      if (otherParticipant) {
        return {
          name: otherParticipant.user.display_name || otherParticipant.user.username,
          avatar: otherParticipant.user.profile_picture,
          isGroup: false
        };
      }
      
      return {
        name: 'Unknown User',
        avatar: '👤',
        isGroup: false
      };
    }
  };

  const { name, avatar, isGroup } = getConversationInfo();

  // Format last message time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-purple-600 text-white'
          : 'hover:bg-gray-800 text-gray-300'
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="relative">
          {isGroup || !avatar || avatar.startsWith('http') ? (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">
              {typeof avatar === 'string' && avatar.startsWith('http') ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span>{avatar}</span>
              )}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">
              👤
            </div>
          )}
          
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>

        {/* Conversation info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className={`font-medium truncate ${
              isSelected ? 'text-white' : 'text-white'
            }`}>
              {name}
            </h3>
            <span className={`text-xs ${
              isSelected ? 'text-purple-200' : 'text-gray-500'
            }`}>
              {formatTime(conversation.last_message_at)}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className={`text-sm truncate ${
              isSelected ? 'text-purple-200' : 'text-gray-400'
            }`}>
              {isGroup && `${otherParticipants.length} members`}
              {!isGroup && 'Direct message'}
            </p>
            
            {/* Expiration indicator */}
            {conversation.expires_at && (
              <div className={`text-xs ${
                isSelected ? 'text-purple-200' : 'text-yellow-500'
              }`}>
                ⏰
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
