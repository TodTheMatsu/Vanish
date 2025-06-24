import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from './useToast';
import type { OptimisticMessage } from './useMessages';

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
            
            queryClient.setQueryData(['messages', conversationId], (oldData: { pages: OptimisticMessage[][], pageParams: unknown[] } | undefined) => {
              // Type guard for infinite query data structure
              if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) {
                return oldData;
              }
              
              const data = oldData as { pages: OptimisticMessage[][], pageParams: unknown[] };
              if (!data.pages) return oldData;
              
              const messageId = newMessage.id;
              
              // Check if this is replacing an optimistic message from the same sender
              let foundOptimistic = false;
              const newPages = data.pages.map(page => 
                page.map(message => {
                  const msg = message;
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
                  page.some(message => 
                    message.id === messageId
                  )
                );
                
                // Only add if message doesn't already exist
                if (!messageExists) {
                  // Add new message to the first page (most recent messages)
                  if (newPages.length > 0) {
                    newPages[0] = [...newPages[0], newMessage];
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
            
            queryClient.setQueryData(['messages', conversationId], (oldData: { pages: OptimisticMessage[][], pageParams: unknown[] } | undefined) => {
              if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) {
                return oldData;
              }
              
              const data = oldData as { pages: OptimisticMessage[][], pageParams: unknown[] };
              if (!data.pages) return oldData;
              
              const newPages = data.pages.map(page => 
                page.map(message => 
                  message.id === updatedMessage.id ? updatedMessage : message
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
            
            queryClient.setQueryData(['messages', conversationId], (oldData: { pages: OptimisticMessage[][], pageParams: unknown[] } | undefined) => {
              if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) {
                return oldData;
              }
              
              const data = oldData as { pages: OptimisticMessage[][], pageParams: unknown[] };
              if (!data.pages) return oldData;
              
              const newPages = data.pages.map(page => 
                page.filter(message => 
                  message.id !== deletedMessageId
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
  }, [conversationId, queryClient, addToast]);
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
          () => {
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

