import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

/**
 * Hook to enable real-time updates for messages in a specific conversation
 */
export const useRealtimeMessages = (conversationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    console.log(`Setting up real-time subscription for conversation: ${conversationId}`);

    // Subscribe to new messages in this conversation
    const messageSubscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          // RLS ensures we only get messages we're allowed to see
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Message updated:', payload);
          // Handle message updates (read status, edits)
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Message deleted:', payload);
          // Handle message deletions
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe((status) => {
        console.log(`Message subscription status for ${conversationId}:`, status);
      });

    return () => {
      console.log(`Cleaning up real-time subscription for conversation: ${conversationId}`);
      messageSubscription.unsubscribe();
    };
  }, [conversationId, queryClient]);
};

/**
 * Hook to enable real-time updates for all conversations
 */
export const useRealtimeConversations = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up real-time subscription for conversations');

    // Subscribe to conversation updates
    const conversationSubscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversation changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants'
        },
        (payload) => {
          console.log('Conversation participants changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          // Also invalidate permissions for affected conversation
          if (payload.new && typeof payload.new === 'object' && 'conversation_id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['conversation-permissions', payload.new.conversation_id] });
          }
          if (payload.old && typeof payload.old === 'object' && 'conversation_id' in payload.old) {
            queryClient.invalidateQueries({ queryKey: ['conversation-permissions', payload.old.conversation_id] });
          }
        }
      )
      .subscribe((status) => {
        console.log('Conversation subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription for conversations');
      conversationSubscription.unsubscribe();
    };
  }, [queryClient]);
};

/**
 * Hook to handle real-time typing indicators
 */
export const useTypingIndicator = (conversationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const typingChannel = supabase.channel(`typing:${conversationId}`);

    const subscription = typingChannel
      .on('broadcast', { event: 'typing' }, (payload) => {
        console.log('Typing indicator:', payload);
        // Update typing state in cache or component state
        queryClient.setQueryData(['typing', conversationId], payload);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, queryClient]);

  const sendTypingIndicator = async (isTyping: boolean) => {
    if (!conversationId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.channel(`typing:${conversationId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        is_typing: isTyping,
        timestamp: new Date().toISOString()
      }
    });
  };

  return { sendTypingIndicator };
};

/**
 * Hook to handle presence (online/offline status) for a conversation
 */
export const usePresence = (conversationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const presenceChannel = supabase.channel(`presence:${conversationId}`, {
      config: {
        presence: {
          key: 'user_id'
        }
      }
    });

    const subscription = presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        console.log('Presence sync:', presenceState);
        queryClient.setQueryData(['presence', conversationId], presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await presenceChannel.track({
              user_id: user.id,
              online_at: new Date().toISOString()
            });
          }
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, queryClient]);
};

/**
 * Hook to handle real-time message expiration
 * Automatically removes expired messages from cache
 */
export const useMessageExpiration = (conversationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const checkExpiredMessages = () => {
      const messagesData = queryClient.getQueryData(['messages', conversationId]) as {
        pages: Array<Array<{ expires_at: string }>>;
      } | undefined;
      
      if (!messagesData?.pages) return;

      let hasExpiredMessages = false;
      
      for (const page of messagesData.pages) {
        for (const message of page) {
          if (new Date(message.expires_at) <= new Date()) {
            hasExpiredMessages = true;
            break;
          }
        }
        if (hasExpiredMessages) break;
      }

      if (hasExpiredMessages) {
        console.log('Found expired messages, refreshing...');
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      }
    };

    // Check every minute for expired messages
    const interval = setInterval(checkExpiredMessages, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [conversationId, queryClient]);
};
