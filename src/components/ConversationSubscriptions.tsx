import { useConversations } from '../hooks/useMessages';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';

/**
 * Subscribes to realtime updates for all conversations the user is in.
 * This component mounts a hidden subscription for each conversation.
 */
export function ConversationSubscriptions() {
  const { data: conversations } = useConversations();
  const conversationIds = Array.isArray(conversations) ? conversations.map(c => c.id) : [];

  // Internal component for subscribing to a single conversation
  function ConversationSubscription({ conversationId } : { conversationId: string }) {
    useRealtimeMessages(conversationId);
    return null;
  }

  if (!conversationIds.length) return null;

  return (
    <>
      {conversationIds.map(id => (
        <ConversationSubscription key={id} conversationId={id} />
      ))}
    </>
  );
}
