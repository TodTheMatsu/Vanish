import { useState } from 'react';
import { Message, ConversationPermissions, SendMessageData } from '../../api/messagesApi';
import { useDeleteMessage, useRetryMessage } from '../../hooks/useMessages';
import { useUser } from '../../UserContext';
import { IoTimeOutline, IoCameraOutline } from 'react-icons/io5';
import { ConfirmDialog } from '../ConfirmDialog';

// Extended interface for optimistic messages
interface OptimisticMessage extends Message {
  _isOptimistic?: boolean;
  _failed?: boolean;
  _originalData?: SendMessageData;
}

interface MessageBubbleProps {
  message: OptimisticMessage;
  conversationId: string;
  permissions?: ConversationPermissions | null; // Add permissions prop
  conversationType?: 'direct' | 'group'; // Add conversationType prop
}

export function MessageBubble({ message, conversationId, permissions, conversationType }: MessageBubbleProps) {
  const deleteMessage = useDeleteMessage();
  const retryMessage = useRetryMessage();
  const { userId: currentUserId } = useUser();
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Removed useMarkAsRead to prevent network spam
  
  // Get current user ID from context instead of localStorage
  const isOwnMessage = message.sender_id === currentUserId;

  // Check if user can delete this message
  let canDelete = permissions?.isAdmin || isOwnMessage;
  if (conversationType === 'direct') {
    canDelete = isOwnMessage;
  }
  // Check if message can be edited (own message, within 15 minutes)
  let canEdit = isOwnMessage && 
    new Date(message.created_at).getTime() > Date.now() - 15 * 60 * 1000;
  if (conversationType === 'direct') {
    canEdit = isOwnMessage && canEdit;
  }

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
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    try {
      await deleteMessage.mutateAsync(message.id);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleRetry = async () => {
    if (message._originalData) {
      try {
        await retryMessage.mutateAsync({
          messageId: message.id,
          conversationId,
          originalData: message._originalData
        });
      } catch (error) {
        console.error('Failed to retry message:', error);
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
        <div className="text-neutral-500 text-sm italic bg-neutral-800/30 px-3 py-1 rounded-full backdrop-blur-sm">
          Message expired
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`max-w-[85%] sm:max-w-md md:max-w-lg lg:max-w-xl px-3 sm:px-4 py-2 sm:py-3 rounded-xl relative backdrop-blur-sm border ${
          isOwnMessage 
            ? `${message._failed ? 'bg-red-600/80 border-red-500/50' : 'bg-white text-black border-white/20'} ${message._isOptimistic ? 'opacity-70' : ''} shadow-lg` 
            : 'bg-neutral-800/80 text-white border-neutral-700/50 shadow-lg'
        }`}>
          {/* Optimistic message indicator */}
          {message._isOptimistic && (
            <div className="absolute -bottom-1 -right-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
            </div>
          )}

          {/* Failed message indicator */}
          {message._failed && (
            <div className="absolute -bottom-1 -right-1">
              <div className="w-3 h-3 bg-red-400 rounded-full shadow-lg"></div>
            </div>
          )}
          
          {/* Sender name (for group chats and not own messages) */}
          {!isOwnMessage && message.sender && (
            <div className="text-xs text-neutral-400 mb-1 font-medium">
              {message.sender.display_name || message.sender.username}
            </div>
          )}

          {/* Reply context */}
          {message.reply_to_message && (
            <div className="bg-neutral-700/50 rounded-lg p-2 mb-2 text-sm border-l-2 border-neutral-500">
              <div className="text-neutral-300 text-xs font-medium">
                {message.reply_to_message.sender?.display_name || 'Unknown User'}
              </div>
              <div className="text-neutral-200 truncate">
                {message.reply_to_message.content}
              </div>
            </div>
          )}

          {/* Message content */}
          <div className="break-words text-sm sm:text-base leading-relaxed">
            {message.content}
          </div>

          {/* Message metadata */}
          <div className="flex items-center justify-between mt-2 text-xs opacity-75">
            <div className="flex items-center space-x-2">
              <span>{formatTime(message.created_at)}</span>
              {message._isOptimistic && (
                <span className="italic text-yellow-400">Sending...</span>
              )}
              {message._failed && (
                <span className="italic text-red-300">Failed to send</span>
              )}
              {message.edited_at && !message._isOptimistic && !message._failed && (
                <span className="italic">(edited)</span>
              )}
              {message.screenshot_detected && (
                <span className="text-yellow-400 flex items-center" title="Screenshot detected">
                  <IoCameraOutline />
                </span>
              )}
            </div>
            
            {/* Expiration time - don't show for optimistic or failed messages */}
            {!message._isOptimistic && !message._failed && (
              <div className={`text-xs flex items-center ${
                timeLeft.includes('m') && !timeLeft.includes('h') 
                  ? 'text-yellow-400' 
                  : isOwnMessage ? 'text-black/60' : 'text-neutral-400'
              }`}>
                <IoTimeOutline className="mr-1" /> {timeLeft}
              </div>
            )}
          </div>

          {/* Read receipts (for own messages) - don't show for optimistic or failed messages */}
          {isOwnMessage && !message._isOptimistic && !message._failed && Object.keys(message.read_by).length > 1 && (
            <div className="text-xs text-black/60 mt-1">
              Read by {Object.keys(message.read_by).length - 1} others
            </div>
          )}

          {/* Message actions */}
          <div className="flex justify-end mt-2 space-x-2">
            {/* Retry button for failed messages */}
            {message._failed && message._originalData && (
              <button
                className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                onClick={handleRetry}
                disabled={retryMessage.isPending}
              >
                {retryMessage.isPending ? 'Retrying...' : 'Retry'}
              </button>
            )}
            
            {/* Regular message actions - don't show for optimistic or failed messages */}
            {!message._isOptimistic && !message._failed && (canDelete || canEdit) && (
              <>
                {canEdit && (
                  <button
                    className={`text-xs transition-colors ${
                      isOwnMessage ? 'text-black/70 hover:text-black' : 'text-neutral-400 hover:text-white'
                    }`}
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
                    className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    onClick={handleDelete}
                    disabled={deleteMessage.isPending}
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Message"
        message="Are you sure you want to delete this message?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
