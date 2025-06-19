import React, { useState, useEffect, useRef } from 'react';
import { useMessages, useSendMessage, useConversationPermissions } from '../../hooks/useMessages';
import { useRealtimeMessages } from '../../hooks/useRealtimeMessages';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ConversationHeader } from './ConversationHeader';

interface ChatWindowProps {
  conversationId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(conversationId);
  const { data: permissions, isLoadingPermissions } = useConversationPermissions(conversationId);
  const sendMessage = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Temporarily disable real-time updates to debug fetch spam
  // useRealtimeMessages(conversationId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data, shouldAutoScroll]);

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
      console.error('Failed to send message - ChatWindow error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      // Show user-friendly error
      alert('Failed to send message. Please check console for details.');
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
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700">
          <div className="animate-pulse h-6 bg-gray-700 rounded w-32"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  // Show loading state while checking permissions
  if (isLoadingPermissions) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show access denied after loading is complete
  if (!permissions?.isParticipant) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center animate-fade-in">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
            <p>You don't have permission to view this conversation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ConversationHeader conversationId={conversationId} permissions={permissions} />

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {/* Load more indicator */}
        {isFetchingNextPage && (
          <div className="text-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        )}

        {/* Messages */}
        {allMessages.length > 0 ? (
          <>
            {allMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                conversationId={conversationId}
                permissions={permissions} // Pass permissions from ChatWindow
              />
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-3xl mb-2">👋</div>
              <p>No messages yet. Say hello!</p>
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
