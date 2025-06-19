import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { messagesApi, SendMessageData } from '../api/messagesApi';
import { useUser } from '../UserContext';

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

/**
 * Hook to send a message with optimistic updates
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  
  return useMutation({
    mutationFn: (messageData: SendMessageData) => messagesApi.sendMessage(messageData, userId!),
    onMutate: async (newMessage: SendMessageData) => {
      // Cancel any outgoing refetches for messages
      await queryClient.cancelQueries({ queryKey: ['messages', newMessage.conversationId] });
      
      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['messages', newMessage.conversationId]);
      
      // Don't do optimistic updates for now to avoid the temp ID issue
      // The message will appear after the mutation succeeds
      
      return { previousMessages };
    },
    onSuccess: (_data, variables) => {
      // Only invalidate, don't force refetch to avoid loops
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
    },
    onError: (error) => {
      console.error('Failed to send message - detailed error:', error);
    },
    onSettled: () => {
      // Remove this to avoid double invalidation
    }
  });
};

/**
 * Hook to create a new conversation
 */
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
 * Hook to get user permissions for a conversation
 */
export const useConversationPermissions = (conversationId: string) => {
  const { userId } = useUser();
  
  return useQuery({
    queryKey: ['conversation-permissions', conversationId, userId],
    queryFn: () => {
      return messagesApi.getUserPermissions(conversationId, userId!);
    },
    enabled: !!conversationId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false // Don't retry if user doesn't have permissions
  });
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
    onSuccess: () => {
      // Refresh all messages - we don't know which conversation it affects
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
