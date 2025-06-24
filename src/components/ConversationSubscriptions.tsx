import React from 'react';
import { useConversations } from '../hooks/useMessages';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';

/**
 * Renders subscriptions for all conversations the user is in.
 */
export const ConversationSubscriptions: React.FC = () => {
  const { data: conversations } = useConversations();
  const conversationIds = Array.isArray(conversations) ? conversations.map(c => c.id) : [];

  return (
    <>
      {conversationIds.map(id => (
        <ConversationSubscription key={id} conversationId={id} />
      ))}
    </>
  );
};

// Internal component for subscribing to a single conversation
const ConversationSubscription: React.FC<{ conversationId: string }> = React.memo(({ conversationId }) => {
  useRealtimeMessages(conversationId);
  return null;
});
ConversationSubscription.displayName = 'ConversationSubscription';
