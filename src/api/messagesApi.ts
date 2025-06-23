import { supabase } from '../supabaseClient';

export interface SendMessageData {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
  expirationHours?: number; // Default to app setting
  replyTo?: string;
}

export interface CreateConversationData {
  type: 'direct' | 'group';
  participantIds: string[];
  name?: string; // Required for group chats
  expirationHours?: number; // For auto-dissolving groups
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  expires_at: string;
  read_by: Record<string, string>;
  screenshot_detected: boolean;
  edited_at?: string;
  reply_to?: string;
  sender?: {
    id: string;
    username: string;
    display_name: string;
    profile_picture: string;
  };
  reply_to_message?: {
    id: string;
    content: string;
    sender?: {
      username: string;
      display_name: string;
    };
  };
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  created_at: string;
  expires_at?: string;
  created_by: string;
  last_message_at: string;
  conversation_participants: Array<{
    id: string;
    user_id: string;
    role: 'admin' | 'member';
    joined_at: string;
    left_at?: string;
    user: {
      id: string;
      username: string;
      display_name: string;
      profile_picture: string;
    };
  }>;
}

export interface ConversationPermissions {
  isParticipant: boolean;
  isAdmin: boolean;
  role: 'admin' | 'member';
}

export const messagesApi = {
  /**
   * Fetch all conversations for the current user using secure Edge Function
   */
  async fetchConversations(_userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-conversations', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      // Defensive: If data is a string, try to parse it
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) return parsed;
          console.error('fetchConversations: Parsed data is not an array:', parsed);
          return [];
        } catch (e) {
          console.error('fetchConversations: Failed to parse string data:', data, e);
          return [];
        }
      }
      if (!Array.isArray(data)) {
        console.error('fetchConversations: Expected array, got:', typeof data, data);
        return [];
      }
      return data;
    } catch (error) {
      console.error('Error fetching conversations via Edge Function:', error);
      return [];
    }
  },

  /**
   * Fetch messages for a specific conversation using secure Edge Function
   */
  async fetchMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-messages', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: { 
          conversationId: conversationId, 
          limit, 
          offset 
        }
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching messages via Edge Function:', error);
      throw error;
    }
  },

  /**
   * Send a new message to a conversation using secure Edge Function
   */
  async sendMessage(messageData: SendMessageData, _userId: string): Promise<Message> {
    try {
      const { data, error } = await supabase.functions.invoke('send-message', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: {
          conversationId: messageData.conversationId,
          content: messageData.content,
          messageType: messageData.messageType || 'text',
          expirationHours: messageData.expirationHours || 24,
          replyTo: messageData.replyTo || null
        }
      });

      if (error) throw error;

      // After successful message creation, send broadcast for real-time updates
      try {
        const broadcastPayload = {
          type: 'new_message',
          message: data,
          conversationId: messageData.conversationId,
          senderId: data.sender_id,
          timestamp: new Date().toISOString()
        };

        // Send to conversation-specific channel
        await supabase.channel(`messages:${messageData.conversationId}`)
          .send({
            type: 'broadcast',
            event: 'new_message',
            payload: broadcastPayload
          });
      } catch (broadcastError) {
        // Don't throw here - message was saved successfully, broadcast is just for real-time
        console.error('Failed to send message broadcast (message still saved):', broadcastError);
      }

      return data;
    } catch (error) {
      console.error('Error sending message via Edge Function:', error);
      throw error;
    }
  },

  /**
   * Create a new conversation with participants
   * Simplified approach to avoid RLS recursion
   */
  async createConversation(conversationData: CreateConversationData): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      // Get the current session/access token
      const { data: { session } } = await supabase.auth.getSession();
      // Call the Edge Function instead of direct table insert
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-conversation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({
            ...conversationData,
            created_by: user.id
          })
        }
      );
      const result = await response.json();
      if (!response.ok) throw result.error || result;
      // Return the conversation object from the Edge Function
      return result.conversation;
    } catch (error) {
      console.error('Error in createConversation:', error);
      throw error;
    }
  },

  /**
   * Mark a message as read by the current user
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    if (!userId) throw new Error('User ID is required');

    const { data: message } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();

    if (!message) return;

    const readBy = message.read_by || {};
    readBy[userId] = new Date().toISOString();

    const { error } = await supabase
      .from('messages')
      .update({ read_by: readBy })
      .eq('id', messageId);

    if (error) throw error;
  },

  /**
   * Get user's permissions for a specific conversation using secure Edge Function
   */
  async getUserPermissions(conversationId: string, _userId: string): Promise<ConversationPermissions | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-permissions', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: { conversationId }
      });

      if (error) return null;

      return data;
    } catch (error) {
      console.error('Error getting user permissions via Edge Function:', error);
      return null;
    }
  },

  /**
   * Leave a conversation (sets left_at timestamp) via Edge Function
   */
  async leaveConversation(conversationId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('leave-conversation', {
      headers: {
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: { conversationId }
    });
    if (error) throw error;
    if (data && data.error) throw new Error(data.error);
  },

  /**
   * Add a participant to a conversation (admin only)
   * RLS ensures only admins can do this
   */
  async addParticipant(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('conversation_participants')
      .insert([{
        conversation_id: conversationId,
        user_id: userId,
        role: 'member'
      }]);

    if (error) throw error;
  },

  /**
   * Remove a participant from a conversation (admin only)
   * RLS ensures only admins can do this
   */
  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('conversation_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Delete a message (sender or admin)
   * RLS ensures proper permissions
   */
  async deleteMessage(messageId: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ messageId, userId: user.id })
      }
    );
    const result = await response.json();
    if (!response.ok) throw result.error || result;
    return;
  },

  /**
   * Edit a message (sender only, within time limit)
   * RLS ensures proper permissions
   */
  async editMessage(messageId: string, newContent: string): Promise<void> {
    // Get the conversation_id before updating
    const { data: messageData, error: fetchError } = await supabase
      .from('messages')
      .select('conversation_id')
      .eq('id', messageId)
      .single();

    if (fetchError) throw fetchError;

    const { data: updatedMessage, error } = await supabase
      .from('messages')
      .update({ 
        content: newContent,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;        // After successful update, send broadcast
        if (updatedMessage && messageData) {
          try {
            const broadcastPayload = {
              type: 'message_updated',
              message: updatedMessage,
              conversationId: messageData.conversation_id,
              timestamp: new Date().toISOString()
            };

            await supabase.channel(`messages:${messageData.conversation_id}`)
              .send({
                type: 'broadcast',
                event: 'message_updated',
                payload: broadcastPayload
              });
          } catch (broadcastError) {
            console.error('Failed to send message update broadcast:', broadcastError);
          }
        }
  },

  /**
   * Search for users to add to conversations
   */
  async searchUsers(query: string): Promise<Array<{ id: string; username: string; display_name: string; profile_picture: string }>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, profile_picture')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }
    // Map user_id to id for consistency
    return (data || []).map((user: any) => ({
      id: user.user_id,
      username: user.username,
      display_name: user.display_name,
      profile_picture: user.profile_picture
    }));
  },

  /**
   * Fetch pending invitations for the current user using secure Edge Function
   */
  async fetchPendingInvitations(): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-conversations', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: { status: 'pending' }
      });
      if (error) throw error;
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) return parsed;
          console.error('fetchPendingInvitations: Parsed data is not an array:', parsed);
          return [];
        } catch (e) {
          console.error('fetchPendingInvitations: Failed to parse string data:', data, e);
          return [];
        }
      }
      if (!Array.isArray(data)) {
        console.error('fetchPendingInvitations: Expected array, got:', typeof data, data);
        return [];
      }
      return data;
    } catch (error) {
      console.error('Error fetching pending invitations via Edge Function:', error);
      return [];
    }
  },
};
