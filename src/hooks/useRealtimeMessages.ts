import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from './useToast';

/**
 * Hook to enable real-time updates for messages in a specific conversation
 */
export const useRealtimeMessages = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  useEffect(() => {
    if (!conversationId) return;

    let messageSubscription: RealtimeChannel | null = null;
    let conversationSubscription: RealtimeChannel | null = null;

    const setupAuthenticatedSubscription = async () => {
      // Get the current session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No authenticated session for real-time subscription:', sessionError);
        return;
      }

      // Ensure the supabase client has the current session
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });

      // Subscribe to new messages in this conversation with authentication
      messageSubscription = supabase
        .channel(`messages:${conversationId}`)
        .on('broadcast', { event: 'new_message' }, (payload) => {
          if (payload.payload && payload.payload.message && payload.payload.conversationId === conversationId) {
            const newMessage = payload.payload.message;
            const senderId = payload.payload.senderId;
            
            queryClient.setQueryData(['messages', conversationId], (oldData: unknown) => {
              // Type guard for infinite query data structure
              if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) {
                return oldData;
              }
              
              const data = oldData as { pages: unknown[][], pageParams: unknown[] };
              if (!data.pages) return oldData;
              
              const messageId = newMessage.id;
              
              // Check if this is replacing an optimistic message from the same sender
              let foundOptimistic = false;
              const newPages = data.pages.map(page => 
                (page as unknown[]).map(message => {
                  const msg = message as { id: string, sender_id: string, _isOptimistic?: boolean };
                  // Replace optimistic message with real message
                  if (msg._isOptimistic && msg.sender_id === senderId && !foundOptimistic) {
                    foundOptimistic = true;
                    return newMessage;
                  }
                  return message;
                })
              );
              
              // If we didn't replace an optimistic message, check if message already exists
              if (!foundOptimistic) {
                const messageExists = data.pages.some(page => 
                  (page as unknown[]).some(message => 
                    (message as { id: string }).id === messageId
                  )
                );
                
                // Only add if message doesn't already exist
                if (!messageExists) {
                  // Add new message to the first page (most recent messages)
                  if (newPages.length > 0) {
                    newPages[0] = [...(newPages[0] as unknown[]), newMessage];
                  } else {
                    newPages[0] = [newMessage];
                  }
                }
              }
              
              return {
                ...data,
                pages: newPages
              };
            });
            
            // Still invalidate conversations to update last message, etc.
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          }
        })
        .on('broadcast', { event: 'message_updated' }, (payload) => {
          if (payload.payload && payload.payload.message && payload.payload.conversationId === conversationId) {
            const updatedMessage = payload.payload.message;
            
            queryClient.setQueryData(['messages', conversationId], (oldData: unknown) => {
              if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) {
                return oldData;
              }
              
              const data = oldData as { pages: unknown[][], pageParams: unknown[] };
              if (!data.pages) return oldData;
              
              const newPages = data.pages.map(page => 
                (page as unknown[]).map(message => 
                  (message as { id: string }).id === updatedMessage.id ? updatedMessage : message
                )
              );
              
              return {
                ...data,
                pages: newPages
              };
            });
          }
        })
        .on('broadcast', { event: 'message_deleted' }, (payload) => {
          if (payload.payload && payload.payload.messageId && payload.payload.conversationId === conversationId) {
            const deletedMessageId = payload.payload.messageId;
            
            queryClient.setQueryData(['messages', conversationId], (oldData: unknown) => {
              if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) {
                return oldData;
              }
              
              const data = oldData as { pages: unknown[][], pageParams: unknown[] };
              if (!data.pages) return oldData;
              
              const newPages = data.pages.map(page => 
                (page as unknown[]).filter(message => 
                  (message as { id: string }).id !== deletedMessageId
                )
              );
              
              return {
                ...data,
                pages: newPages
              };
            });
          }
        })
        .subscribe();

      // Subscribe to conversation-level events (member_left, conversation_deleted)
      conversationSubscription = supabase
        .channel(`conversations:${conversationId}`)
        .on('broadcast', { event: 'member_left' }, (payload) => {
          if (payload.payload && payload.payload.conversationId === conversationId) {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['conversation-permissions', conversationId] });
            addToast('A member has left the conversation.', 'info');
          }
        })
        .on('broadcast', { event: 'conversation_deleted' }, (payload) => {
          if (payload.payload && payload.payload.conversationId === conversationId) {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.removeQueries({ queryKey: ['messages', conversationId] });
            queryClient.removeQueries({ queryKey: ['conversation-permissions', conversationId] });
            addToast('This conversation has been deleted.', 'warning');
            // Optionally, redirect the user here
          }
        })
        .subscribe();
    };

    // Set up the authenticated subscription
    setupAuthenticatedSubscription();

    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
      if (conversationSubscription) {
        conversationSubscription.unsubscribe();
      }
    };
  }, [conversationId, queryClient]);
};

/**
 * Hook to enable real-time updates for all conversations
 */
export const useRealtimeConversations = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let conversationSubscription: RealtimeChannel | null = null;

    const setupAuthenticatedConversationSubscription = async () => {
      // Get the current session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No authenticated session for conversation real-time subscription:', sessionError);
        return;
      }

      // Subscribe to conversation updates
      conversationSubscription = supabase
        .channel('conversations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations'
          },
          (_payload) => {
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
        .subscribe();
    };

    // Set up the authenticated subscription
    setupAuthenticatedConversationSubscription();

    return () => {
      if (conversationSubscription) {
        conversationSubscription.unsubscribe();
      }
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

/**
 * Debug function to test if real-time is working
 */
export const testRealtimeConnection = async () => {
  console.log('🔍 Testing real-time connection...');
  
  const testChannel = supabase.channel('test-connection');
  
  testChannel.on('broadcast', { event: 'ping' }, (payload) => {
    console.log('🏓 Pong received:', payload);
  });
  
  testChannel.subscribe((status) => {
    console.log('Test channel status:', status);
    
    if (status === 'SUBSCRIBED') {
      console.log('✅ Sending test ping...');
      testChannel.send({
        type: 'broadcast',
        event: 'ping', 
        payload: { message: 'Hello from test!', timestamp: new Date().toISOString() }
      });
      
      setTimeout(() => {
        testChannel.unsubscribe();
        console.log('Test channel unsubscribed');
      }, 5000);
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ Test channel failed to subscribe');
    }
  });
};

/**
 * Debug function to test postgres_changes specifically
 */
export const testPostgresChanges = (conversationId?: string) => {
  console.log('🔍 Testing postgres_changes for messages table...');
  
  const testChannel = supabase.channel('test-postgres-changes');
  
  // Test both with and without conversation filter
  testChannel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public', 
      table: 'messages'
    },
    (payload) => {
      console.log('📥 Postgres changes event received (all messages):', payload);
    }
  );

  if (conversationId) {
    testChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log('📥 Postgres changes event received (filtered):', payload);
      }
    );
  }
  
  testChannel.subscribe((status) => {
    console.log('Postgres changes test channel status:', status);
    if (status === 'SUBSCRIBED') {
      console.log('✅ Postgres changes subscription active - try sending a message now');
    }
  });
  
  return () => testChannel.unsubscribe();
};
