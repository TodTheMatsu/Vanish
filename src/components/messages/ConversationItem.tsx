import { Conversation } from '../../api/messagesApi';
import { useUnreadCount } from '../../hooks/useMessages';
import { useUser } from '../../UserContext';
import { IoPersonOutline, IoPeopleOutline, IoTimeOutline } from 'react-icons/io5';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick
}: ConversationItemProps) {
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
        avatar: <IoPeopleOutline className="text-lg text-neutral-300" />,
        isGroup: true
      };
    } else {
      // For direct messages, show the other person's info
      const otherParticipant = otherParticipants.find(
        p => p.user_id !== currentUserId
      );
      
      if (otherParticipant && otherParticipant.user) {
        return {
          name: otherParticipant.user.display_name || otherParticipant.user.username || 'Unknown User',
          avatar: otherParticipant.user.profile_picture || <IoPersonOutline className="text-lg text-neutral-300" />,
          isGroup: false
        };
      }
      
      return {
        name: 'Unknown User',
        avatar: <IoPersonOutline className="text-lg text-neutral-300" />,
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
      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg'
          : 'hover:bg-neutral-800/50 border border-transparent hover:border-neutral-700'
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="relative">
          {isGroup || !avatar || (typeof avatar === 'string' && avatar.startsWith('http')) ? (
            <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xl">
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
            <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xl">
              <IoPersonOutline className="text-neutral-300" />
            </div>
          )}
          
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>

        {/* Conversation info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-medium truncate text-white">
              {name}
            </h3>
            <span className={`text-xs ${
              isSelected ? 'text-neutral-300' : 'text-neutral-500'
            }`}>
              {formatTime(conversation.last_message_at)}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className={`text-sm truncate ${
              isSelected ? 'text-neutral-300' : 'text-neutral-400'
            }`}>
              {isGroup && `${otherParticipants.length} members`}
              {!isGroup && 'Direct message'}
            </p>
            
            {/* Expiration indicator */}
            {conversation.expires_at && (
              <div className={`text-xs flex items-center ${
                isSelected ? 'text-yellow-300' : 'text-yellow-500'
              }`}>
                <IoTimeOutline className="text-sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
