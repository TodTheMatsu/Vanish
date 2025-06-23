import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { messagesApi, SendMessageData, Message } from '../api/messagesApi';
import { useUser } from '../UserContext';
import { useToast } from './useToast';
import { supabase } from '../supabaseClient';

/**
 * Hook to fetch all conversations for the current user
 */
export const useConversations = () => {
  const { userId } = useUser();
  
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => messagesApi.fetchConversations(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Disable window focus refetch
    refetchInterval: false // Disable automatic polling - use real-time instead
  });
};

/**
 * Hook to fetch messages for a specific conversation with infinite scroll
 */
export const useMessages = (conversationId: string) => {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam = 0 }) => {
      return messagesApi.fetchMessages(conversationId, 50, pageParam as number);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => 
      (lastPage as any[]).length === 50 ? pages.length * 50 : undefined, // eslint-disable-line @typescript-eslint/no-explicit-any
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: false // Disable automatic polling - use real-time instead
  });
};

// Extended Message interface for optimistic updates
interface OptimisticMessage extends Message {
  _isOptimistic?: boolean;
  _failed?: boolean;
  _originalData?: SendMessageData;
}

/**
 * Hook to send a message with optimistic updates
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { userId, currentUser } = useUser();
  const { addToast } = useToast();
  
  return useMutation({
    mutationFn: (messageData: SendMessageData) => messagesApi.sendMessage(messageData, userId!),
    onMutate: async (newMessage: SendMessageData) => {
      // Cancel any outgoing refetches for messages
      await queryClient.cancelQueries({ queryKey: ['messages', newMessage.conversationId] });
      
      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['messages', newMessage.conversationId]);
      
      // Create optimistic message
      const optimisticMessage: OptimisticMessage = {
        id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
        conversation_id: newMessage.conversationId,
        sender_id: userId!,
        content: newMessage.content,
        message_type: (newMessage.messageType || 'text') as 'text' | 'image' | 'file',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (newMessage.expirationHours || 24) * 60 * 60 * 1000).toISOString(),
        read_by: { [userId!]: new Date().toISOString() },
        screenshot_detected: false,
        reply_to: newMessage.replyTo,
        sender: {
          id: userId!,
          username: currentUser?.username || 'You',
          display_name: currentUser?.displayName || currentUser?.username || 'You',
          profile_picture: currentUser?.profilePicture || ''
        },
        // Mark as optimistic for UI handling
        _isOptimistic: true,
        _originalData: newMessage
      };
      
      // Optimistically update the messages cache
      queryClient.setQueryData(['messages', newMessage.conversationId], (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) {
          return {
            pages: [[optimisticMessage]],
            pageParams: [0]
          };
        }
        
        const data = oldData as { pages: OptimisticMessage[][], pageParams: number[] };
        
        // Add optimistic message to the first page (most recent messages) at the end
        // Since messages are displayed in chronological order, new messages go at the end
        const newPages = [...data.pages];
        newPages[0] = [...newPages[0], optimisticMessage];
        
        return {
          ...data,
          pages: newPages
        };
      });
      
      return { previousMessages, optimisticMessage };
    },
    onSuccess: (data, variables, context) => {
      // Seamlessly replace the optimistic message with the real message data
      queryClient.setQueryData(['messages', variables.conversationId], (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) return oldData;
        
        const cachedData = oldData as { pages: OptimisticMessage[][], pageParams: number[] };
        
        const newPages = cachedData.pages.map((page: OptimisticMessage[]) => 
          page.map((msg: OptimisticMessage) => {
            // Replace the optimistic message with the real message
            if (msg.id === context?.optimisticMessage.id) {
              return {
                ...data,
                // Keep the sender info from the optimistic message since it's already populated
                sender: msg.sender
              } as OptimisticMessage;
            }
            return msg;
          })
        );
        
        return {
          ...cachedData,
          pages: newPages
        };
      });
      
      // Update conversations list (but don't refetch messages since we just updated them)
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
    },
    onError: (error, variables, context) => {
      console.error('Failed to send message - detailed error:', error);
      
      // Show error toast
      addToast('Failed to send message. Please try again.', 'error');
      
      // Mark optimistic message as failed instead of removing it
      if (context?.optimisticMessage) {
        queryClient.setQueryData(['messages', variables.conversationId], (oldData: unknown) => {
          if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) return oldData;
          
          const data = oldData as { pages: OptimisticMessage[][], pageParams: number[] };
          
          const newPages = data.pages.map((page: OptimisticMessage[]) => 
            page.map((msg: OptimisticMessage) => 
              msg.id === context.optimisticMessage.id
                ? { ...msg, _failed: true, _isOptimistic: false }
                : msg
            )
          );
          
          return {
            ...data,
            pages: newPages
          };
        });
      }
    }
  });
};

/**
 * Hook to retry a failed message
 */
export const useRetryMessage = () => {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  const { addToast } = useToast();
  
  return useMutation({
    mutationFn: async ({ messageId, conversationId, originalData }: { 
      messageId: string; 
      conversationId: string; 
      originalData: SendMessageData; 
    }) => {
      // First, remove the failed message from the cache
      queryClient.setQueryData(['messages', conversationId], (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) return oldData;
        
        const data = oldData as { pages: OptimisticMessage[][], pageParams: number[] };
        
        const newPages = data.pages.map((page: OptimisticMessage[]) => 
          page.filter((msg: OptimisticMessage) => msg.id !== messageId)
        );
        
        return {
          ...data,
          pages: newPages
        };
      });
      
      // Then send the message again
      return messagesApi.sendMessage(originalData, userId!);
    },
    onSuccess: (_data, variables) => {
      // Invalidate to fetch the real message
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
      addToast('Message sent successfully!', 'success', 3000);
    },
    onError: (error, variables) => {
      console.error('Failed to retry message:', error);
      addToast('Failed to retry message. Please try again.', 'error');
      
      // Re-add the failed message back to cache
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    }
  });
};
export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  
  return useMutation({
    mutationFn: messagesApi.createConversation,
    onSuccess: (data) => {
      // Update conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
      
      // Pre-populate the new conversation's messages cache
      queryClient.setQueryData(['messages', data.id], {
        pages: [[]],
        pageParams: [0]
      });
    }
  });
};

/**
 * Hook to get user permissions for a conversation with minimum loading time
 */
export const useConversationPermissions = (conversationId: string) => {
  const { userId } = useUser();
  
  const query = useQuery({
    queryKey: ['conversation-permissions', conversationId, userId],
    queryFn: async () => {
      // Add minimum loading time of 600ms for better UX (reduced from 800ms)
      const startTime = Date.now();
      const permissionsPromise = messagesApi.getUserPermissions(conversationId, userId!);
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 600));
      
      const [permissions] = await Promise.all([permissionsPromise, minLoadingTime]);
      
      // Ensure we've waited at least 600ms
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 600) {
        await new Promise(resolve => setTimeout(resolve, 600 - elapsedTime));
      }
      
      return permissions;
    },
    enabled: !!conversationId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false // Don't retry if user doesn't have permissions
  });

  return {
    ...query,
    isLoadingPermissions: query.isLoading || query.isFetching
  };
};

/**
 * Hook to mark messages as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  
  return useMutation({
    mutationFn: (messageId: string) => messagesApi.markAsRead(messageId, userId!),
    onSuccess: () => {
      // Update message read status in cache
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });
};

/**
 * Hook to leave a conversation
 */
export const useLeaveConversation = () => {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  
  return useMutation({
    mutationFn: messagesApi.leaveConversation,
    onSuccess: (_data, conversationId) => {
      // Remove conversation from cache
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
      queryClient.removeQueries({ queryKey: ['messages', conversationId] });
      queryClient.removeQueries({ queryKey: ['conversation-permissions', conversationId] });
    }
  });
};

/**
 * Hook to add a participant to a conversation
 */
export const useAddParticipant = () => {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  
  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      messagesApi.addParticipant(conversationId, userId),
    onSuccess: (_data, { conversationId }) => {
      // Refresh conversation data to show new participant
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }
  });
};

/**
 * Hook to remove a participant from a conversation
 */
export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  
  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      messagesApi.removeParticipant(conversationId, userId),
    onSuccess: (_data, { conversationId }) => {
      // Refresh conversation data
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }
  });
};

/**
 * Hook to delete a message
 */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: messagesApi.deleteMessage,
    onMutate: async (messageId: string) => {
      // Find all conversations in cache
      const allQueries = queryClient.getQueryCache().findAll({ queryKey: ['messages'] });
      let previousMessages: Record<string, unknown> = {};
      // Remove the message optimistically from all conversations
      allQueries.forEach((query) => {
        const conversationId = query.queryKey[1];
        previousMessages[conversationId] = query.state.data;
        queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
          if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) return oldData;
          const data = oldData as { pages: any[][], pageParams: any[] };
          const newPages = data.pages.map(page => page.filter((msg: any) => msg.id !== messageId));
          return { ...data, pages: newPages };
        });
      });
      return { previousMessages };
    },
    onError: (_error, _messageId, context) => {
      // Restore previous messages if deletion fails
      if (context?.previousMessages) {
        Object.entries(context.previousMessages).forEach(([conversationId, data]) => {
          queryClient.setQueryData(['messages', conversationId], data);
        });
      }
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });
};

/**
 * Hook to edit a message
 */
export const useEditMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      messagesApi.editMessage(messageId, content),
    onSuccess: () => {
      // Refresh messages to show edit
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });
};

/**
 * Hook to search for users
 */
export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ['search-users', query],
    queryFn: () => messagesApi.searchUsers(query),
    enabled: query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get unread message count for a conversation
 */
export const useUnreadCount = (conversationId: string) => {
  const { data: messages } = useMessages(conversationId);
  const currentUserId = JSON.parse(localStorage.getItem('sb-user') || '{}')?.id;
  
  if (!messages || !currentUserId) return 0;
  
  let unreadCount = 0;
  // messages is back to infinite query structure with pages
  for (const page of messages.pages) {
    for (const message of page as any[]) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (message.sender_id !== currentUserId && !message.read_by?.[currentUserId]) {
        unreadCount++;
      }
    }
  }
  
  return unreadCount;
};

/**
 * Hook to fetch pending invitations for the current user
 */
export const usePendingInvitations = () => {
  return useQuery({
    queryKey: ['pending-invitations'],
    queryFn: () => messagesApi.fetchPendingInvitations(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: false
  });
};

/**
 * Mutation hook to accept a pending invitation
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversation_id: string) => {
      const { data, error } = await supabase.functions.invoke('accept-invitation', {
        body: { conversation_id }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};
