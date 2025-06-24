import React, { useState } from 'react';
import { useConversations } from '../../hooks/useMessages';
import { ConversationItem } from './ConversationItem';
import { NewConversationModal } from './NewConversationModal';
import { PendingInvitationsModal } from './PendingInvitationsModal';
import { IoChatbubbleOutline, IoMailOpenOutline } from 'react-icons/io5';
import { AnimatePresence, motion } from 'framer-motion';

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onClose?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  selectedConversationId,
  onSelectConversation,
  onClose
}) => {
  const { data: conversations, isLoading, error } = useConversations();
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Debug: print type and structure of conversations
  console.log('Frontend conversations:', conversations, 'Type:', typeof conversations, 'IsArray:', Array.isArray(conversations));
  if (conversations && !Array.isArray(conversations)) {
    return (
      <div className="p-4 text-red-400">
        <p>Conversations data is not an array. Type: {typeof conversations}</p>
        <pre>{JSON.stringify(conversations, null, 2)}</pre>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-neutral-400">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-neutral-800/50 rounded-xl"></div>
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
    <div className="flex flex-col h-full bg-neutral-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-neutral-400 hover:text-white hover:bg-neutral-800 p-1 rounded-lg transition-all duration-200"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <h2 className="text-xl font-semibold text-white">Messages</h2>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowNewConversationModal(true)}
            className="bg-white text-black hover:bg-neutral-200 p-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-white/25"
            title="New Conversation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Pending Invitations Button */}
          <button
            onClick={() => setShowPendingModal(true)}
            className="ml-2 bg-white text-black px-3 py-1 rounded-lg font-semibold hover:bg-neutral-200 transition-all flex items-center gap-2"
            title="View Pending Invitations"
          >
            <IoMailOpenOutline className="text-xl" />
            Invitations
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations && conversations.length > 0 ? (
          <div className="space-y-1 p-2">
            <AnimatePresence initial={false}>
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.18 }}
                >
                  <ConversationItem
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.id}
                    onClick={() => onSelectConversation(conversation.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-400">
            <div className="text-center p-8">
              <h3 className="text-xl font-semibold text-neutral-300 mb-2">No conversations yet</h3>
              <p className="text-neutral-500 mb-6">Start messaging with other users!</p>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="bg-white text-black hover:bg-neutral-200 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-white/25"
              >
                Start a conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConversationModal && (
          <NewConversationModal
            onClose={() => setShowNewConversationModal(false)}
            onConversationCreated={(conversationId: string) => {
              setShowNewConversationModal(false);
              onSelectConversation(conversationId);
            }}
          />
        )}
        <PendingInvitationsModal isOpen={showPendingModal} onClose={() => setShowPendingModal(false)} />
      </AnimatePresence>
    </div>
  );
};
