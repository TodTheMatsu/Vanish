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
  const [showConversationList, setShowConversationList] = useState(true);

  // Enable real-time updates for conversations
  useRealtimeConversations();

  return (
    <div className="flex h-full bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden">
      {/* Mobile: Overlay sidebar, Desktop: Fixed sidebar */}
      <div className={`
        ${showConversationList ? 'block' : 'hidden'}
        fixed inset-y-0 left-0 z-50 w-full bg-neutral-900/95 backdrop-blur-sm
        md:relative md:block md:w-80 md:flex-shrink-0
        lg:w-96 xl:w-[400px]
        border-r border-neutral-800
        transition-transform duration-300 ease-in-out
      `}>
        <ConversationList
          selectedConversationId={selectedConversation}
          onSelectConversation={(conversationId) => {
            setSelectedConversation(conversationId);
            // Hide conversation list on mobile when selecting a conversation
            if (window.innerWidth < 768) {
              setShowConversationList(false);
            }
          }}
          onClose={() => setShowConversationList(false)}
        />
      </div>

      {/* Chat Window - Always takes remaining space */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedConversation ? (
          <ChatWindow 
            conversationId={selectedConversation}
            onShowConversationList={() => setShowConversationList(true)}
            showBackButton={!showConversationList}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 p-6">
            <div className="text-center max-w-md">
              <div className="text-6xl md:text-8xl mb-6">💬</div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-white">
                Welcome to Vanish Messages
              </h3>
              <p className="text-base md:text-lg mb-2">
                Select a conversation to start chatting
              </p>
              <p className="text-sm md:text-base text-gray-500">
                Messages automatically disappear after 24 hours
              </p>
              {/* Mobile: Show button to open conversation list */}
              <button
                onClick={() => setShowConversationList(true)}
                className="md:hidden mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                View Conversations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile backdrop */}
      {showConversationList && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowConversationList(false)}
        />
      )}
    </div>
  );
};
