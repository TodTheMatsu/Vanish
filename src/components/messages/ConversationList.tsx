import React, { useState } from 'react';
import { useConversations } from '../../hooks/useMessages';
import { ConversationItem } from './ConversationItem';
import { NewConversationModal } from './NewConversationModal';

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  selectedConversationId,
  onSelectConversation
}) => {
  const { data: conversations, isLoading, error } = useConversations();
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  if (isLoading) {
    return (
      <div className="p-4 text-gray-400">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-400">
        <p>Error loading conversations: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Messages</h2>
        <button
          onClick={() => setShowNewConversationModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
          title="New Conversation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations && conversations.length > 0 ? (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <p className="mb-4">No conversations yet</p>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Start a conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <NewConversationModal
          onClose={() => setShowNewConversationModal(false)}
          onConversationCreated={(conversationId: string) => {
            setShowNewConversationModal(false);
            onSelectConversation(conversationId);
          }}
        />
      )}
    </div>
  );
};
