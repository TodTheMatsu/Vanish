import React, { useState, useEffect, useRef } from 'react';
import { useMessages, useSendMessage, useConversationPermissions } from '../../hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ConversationHeader } from './ConversationHeader';
import { IoLockClosedOutline, IoHandRightOutline } from 'react-icons/io5';
import { useConversations } from '../../hooks/useMessages';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

interface ChatWindowProps {
  conversationId: string;
  onShowConversationList?: () => void;
  showBackButton?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  conversationId, 
  onShowConversationList,
  showBackButton = false 
}) => {
  
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useMessages(conversationId);
  const { data: permissions, isLoadingPermissions } = useConversationPermissions(conversationId);
  const sendMessage = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const { data: conversations } = useConversations();
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const conversation = safeConversations.find(c => c.id === conversationId);
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data, shouldAutoScroll]);

  // On conversationId change, force a refetch of messages to avoid stale cache.
  // Only refetch if not already loading/fetching.
  useEffect(() => {
    if (conversationId && !isLoading && !isFetchingNextPage) {
      refetch().catch((err) => {
        // Log error, don't break UI
        console.error('Failed to refetch messages for conversation:', conversationId, err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Flatten all pages of messages (back to infinite query)
  const allMessages = data?.pages.flat() || [];

  const handleSend = async (content: string, expirationHours?: number) => {
    if (!content.trim()) return;

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content,
        expirationHours
      });
      setShouldAutoScroll(true);
    } catch (error) {
      // Error is handled by the toast notification in useSendMessage hook
      console.error('Failed to send message:', error);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);

    // Load more messages when scrolling to top
    if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-neutral-900/50 backdrop-blur-sm">
        <div className="p-4 border-b border-neutral-800">
          <div className="animate-pulse h-6 bg-neutral-800 rounded w-32"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Show loading state while checking permissions
  if (isLoadingPermissions) {
    return (
      <div className="flex flex-col h-full bg-neutral-900/50 backdrop-blur-sm">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-neutral-400">Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show access denied after loading is complete
  if (!permissions?.isParticipant) {
    return (
      <div className="flex flex-col h-full bg-neutral-900/50 backdrop-blur-sm">
        <div className="flex-1 flex items-center justify-center text-neutral-400">
          <div className="text-center animate-fade-in p-8">
            <div className="text-6xl mb-4 text-neutral-400">
              <IoLockClosedOutline className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-300 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to view this conversation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900/30 backdrop-blur-sm">
      {/* Header */}
      <ConversationHeader 
        conversationId={conversationId} 
        permissions={permissions}
        onShowConversationList={onShowConversationList}
        showBackButton={showBackButton}
      />

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-1"
        onScroll={handleScroll}
      >
        {/* Load more indicator */}
        {isFetchingNextPage && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            <p className="text-neutral-400 text-sm mt-2">Loading more messages...</p>
          </div>
        )}

        {/* Messages */}
        {allMessages.length > 0 ? (
          <>
            {allMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.18 }}
              >
                <MessageBubble
                  message={message}
                  conversationId={conversationId}
                  permissions={permissions}
                  conversationType={conversation?.type}
                />
              </motion.div>
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-400">
            <div className="text-center p-8">
              <div className="text-6xl mb-4 text-neutral-400">
                <IoHandRightOutline className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-300 mb-2">No messages yet</h3>
              <p className="text-neutral-500">Say hello to start the conversation!</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSend={handleSend}
        disabled={sendMessage.isPending}
        placeholder="Type a message..."
      />
    </div>
  );
};
