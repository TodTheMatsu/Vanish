import React from 'react';
import { Message, ConversationPermissions } from '../../api/messagesApi';
import { useDeleteMessage } from '../../hooks/useMessages';

interface MessageBubbleProps {
  message: Message;
  conversationId: string;
  permissions?: ConversationPermissions | null; // Add permissions prop
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, conversationId, permissions }) => {
  // Remove the individual useConversationPermissions call to prevent spam
  // const { data: permissions } = useConversationPermissions(conversationId);
  const deleteMessage = useDeleteMessage();
  // Removed useMarkAsRead to prevent network spam
  
  // Get current user ID
  const currentUserId = JSON.parse(localStorage.getItem('sb-user') || '{}')?.id;
  const isOwnMessage = message.sender_id === currentUserId;
  
  // Check if user can delete this message
  const canDelete = permissions?.isAdmin || isOwnMessage;
  
  // Check if message can be edited (own message, within 15 minutes)
  const canEdit = isOwnMessage && 
    new Date(message.created_at).getTime() > Date.now() - 15 * 60 * 1000;

  // Mark message as read functionality - REMOVED to prevent network spam
  // React.useEffect(() => {
  //   if (!isOwnMessage && !message.read_by[currentUserId]) {
  //     markAsRead.mutate(message.id);
  //   }
  // }, [message.id, isOwnMessage, currentUserId, message.read_by, markAsRead]);

  // Calculate time until expiration
  const getExpirationInfo = () => {
    const expiresAt = new Date(message.expires_at);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    
    if (diffMs <= 0) return { expired: true, timeLeft: 'Expired' };
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return { expired: false, timeLeft: `${diffHours}h ${diffMinutes}m` };
    } else if (diffMinutes > 0) {
      return { expired: false, timeLeft: `${diffMinutes}m` };
    } else {
      const diffSeconds = Math.floor(diffMs / 1000);
      return { expired: false, timeLeft: `${diffSeconds}s` };
    }
  };

  const { expired, timeLeft } = getExpirationInfo();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage.mutateAsync(message.id);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (expired) {
    return (
      <div className="flex justify-center">
        <div className="text-gray-500 text-sm italic">
          Message expired
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage 
          ? 'bg-purple-600 text-white' 
          : 'bg-gray-700 text-white'
      }`}>
        {/* Sender name (for group chats and not own messages) */}
        {!isOwnMessage && message.sender && (
          <div className="text-xs text-gray-300 mb-1">
            {message.sender.display_name || message.sender.username}
          </div>
        )}

        {/* Reply context */}
        {message.reply_to_message && (
          <div className="bg-gray-600 bg-opacity-50 rounded p-2 mb-2 text-sm">
            <div className="text-gray-300 text-xs">
              {message.reply_to_message.sender?.display_name || 'Unknown User'}
            </div>
            <div className="text-gray-200 truncate">
              {message.reply_to_message.content}
            </div>
          </div>
        )}

        {/* Message content */}
        <div className="break-words">
          {message.content}
        </div>

        {/* Message metadata */}
        <div className="flex items-center justify-between mt-2 text-xs opacity-75">
          <div className="flex items-center space-x-2">
            <span>{formatTime(message.created_at)}</span>
            {message.edited_at && (
              <span className="italic">(edited)</span>
            )}
            {message.screenshot_detected && (
              <span className="text-yellow-400" title="Screenshot detected">📸</span>
            )}
          </div>
          
          {/* Expiration time */}
          <div className={`text-xs ${
            timeLeft.includes('m') && !timeLeft.includes('h') 
              ? 'text-yellow-400' 
              : 'text-gray-400'
          }`}>
            ⏰ {timeLeft}
          </div>
        </div>

        {/* Read receipts (for own messages) */}
        {isOwnMessage && Object.keys(message.read_by).length > 1 && (
          <div className="text-xs text-gray-300 mt-1">
            Read by {Object.keys(message.read_by).length - 1} others
          </div>
        )}

        {/* Message actions */}
        {(canDelete || canEdit) && (
          <div className="flex justify-end mt-2 space-x-2">
            {canEdit && (
              <button
                className="text-xs text-gray-300 hover:text-white"
                onClick={() => {
                  // TODO: Implement edit functionality
                  console.log('Edit message:', message.id);
                }}
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                className="text-xs text-red-400 hover:text-red-300"
                onClick={handleDelete}
                disabled={deleteMessage.isPending}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
