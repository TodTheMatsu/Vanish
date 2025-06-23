import React, { useState } from 'react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { useRealtimeConversations } from '../../hooks/useRealtimeMessages';

interface MessagesLayoutProps {
  selectedConversationId?: string;
}

export const MessagesLayout: React.FC<MessagesLayoutProps> = ({
  selectedConversationId
}) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    selectedConversationId || null
  );

  // Enable real-time updates for conversations
  useRealtimeConversations();

  return (
    <div className="flex h-full bg-gray-900">
      {/* Conversations Sidebar */}
      <div className="w-1/3 min-w-[300px] border-r border-gray-700">
        <ConversationList
          selectedConversationId={selectedConversation}
          onSelectConversation={setSelectedConversation}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow conversationId={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Welcome to Vanish Messages</h3>
              <p>Select a conversation to start chatting</p>
              <p className="text-sm mt-2">Messages automatically disappear after 24 hours</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
