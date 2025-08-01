import React, { useState, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { useRealtimeConversations } from '../../hooks/useRealtimeMessages';
import { IoChatbubbleOutline } from 'react-icons/io5';
import { ConversationList } from './ConversationList';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface MessagesLayoutProps {
  selectedConversationId?: string;
  onMobileViewChange?: (view: 'list' | 'chat') => void;
}

export function MessagesLayout({
  selectedConversationId,
  onMobileViewChange
}: MessagesLayoutProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    selectedConversationId || null
  );
  const navigate = useNavigate();

  // Enable real-time updates for conversations
  useRealtimeConversations();

  // Mobile: show conversation list or chat window
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const showList = isMobile && !selectedConversation;
  const showChat = isMobile && selectedConversation;

  // Notify parent of mobile view changes
  useEffect(() => {
    if (onMobileViewChange && isMobile) {
      if (showList) onMobileViewChange('list');
      if (showChat) onMobileViewChange('chat');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showList, showChat, isMobile]);

  return (
    <div className="flex h-full bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden md:h-screen">
      {/* Desktop ConversationList sidebar */}
      <div className="hidden md:block md:w-80 lg:w-96 xl:w-[400px] border-r border-neutral-800 bg-neutral-900/95 backdrop-blur-sm">
        <ConversationList
          selectedConversationId={selectedConversation || selectedConversationId || null}
          onSelectConversation={id => {
            setSelectedConversation(id);
            navigate(`/messages/${id}`);
          }}
        />
      </div>
      {/* Mobile: show ConversationList or ChatWindow with animation */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden md:relative ${showList ? 'pb-14' : ''} md:pb-0`}>
        <AnimatePresence initial={false} mode="wait">
          {showList && (
            <motion.div
              key="conversation-list"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="block md:hidden h-full w-full bg-neutral-900/95 backdrop-blur-sm absolute inset-0"
            >
              <ConversationList
                selectedConversationId={null}
                onSelectConversation={id => {
                  setSelectedConversation(id);
                  navigate(`/messages/${id}`);
                }}
              />
            </motion.div>
          )}
          {showChat && (
            <motion.div
              key="chat-window"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className="block md:hidden h-full w-full absolute inset-0"
            >
              <ChatWindow
                conversationId={selectedConversation}
                onShowConversationList={() => setSelectedConversation(null)}
                showBackButton={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Desktop: ChatWindow or placeholder */}
        <div className="hidden md:flex flex-1 flex-col min-w-0 overflow-hidden">
          {selectedConversation ? (
            <ChatWindow 
              conversationId={selectedConversation}
              onShowConversationList={() => {}}
              showBackButton={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 p-6">
              <div className="text-center max-w-md">
                <div className="text-6xl md:text-8xl mb-6 text-neutral-400">
                  <IoChatbubbleOutline className="mx-auto" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 text-white">
                  Select a conversation to start messaging
                </h3>
                <p className="text-neutral-400">Your messages will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
