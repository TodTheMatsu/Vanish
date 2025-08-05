import { notificationsApi } from '../api/notificationsApi';

/**
 * Utility functions for creating sample notifications for testing
 */

export const createSampleNotifications = async (userId: string) => {
  const sampleNotifications = [
    {
      user_id: userId,
      type: 'message' as const,
      title: 'New Message',
      message: 'You have received a new message from John Doe',
      data: { conversationId: 'sample-conv-1', senderId: 'sample-user-1' }
    },
    {
      user_id: userId,
      type: 'invitation' as const,
      title: 'Conversation Invitation', 
      message: 'Sarah invited you to join "Weekend Plans" conversation',
      data: { conversationId: 'sample-conv-2', senderId: 'sample-user-2' }
    },
    {
      user_id: userId,
      type: 'system' as const,
      title: 'Welcome to Vanish!',
      message: 'Your account has been successfully created. Enjoy secure messaging!',
      data: { welcomeMessage: true }
    },
    {
      user_id: userId,
      type: 'friend_request' as const,
      title: 'Friend Request',
      message: 'Alex wants to connect with you',
      data: { requesterId: 'sample-user-3' }
    },
    {
      user_id: userId,
      type: 'message' as const,
      title: 'New Message',
      message: 'Hey! Are you available for a quick chat?',
      data: { conversationId: 'sample-conv-3', senderId: 'sample-user-4' },
      read: true
    }
  ];

  try {
    for (const notification of sampleNotifications) {
      await notificationsApi.createNotification(notification);
    }
    console.log('Sample notifications created successfully!');
  } catch (error) {
    console.error('Failed to create sample notifications:', error);
  }
};

/**
 * Create a new message notification
 */
export const createMessageNotification = async (
  recipientId: string, 
  senderName: string, 
  messageContent: string,
  conversationId: string,
  senderId: string
) => {
  try {
    await notificationsApi.createNotification({
      user_id: recipientId,
      type: 'message',
      title: 'New Message',
      message: `${senderName}: ${messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent}`,
      data: { conversationId, senderId }
    });
  } catch (error) {
    console.error('Failed to create message notification:', error);
  }
};

/**
 * Create a conversation invitation notification
 */
export const createInvitationNotification = async (
  recipientId: string,
  inviterName: string,
  conversationName: string,
  conversationId: string,
  inviterId: string
) => {
  try {
    await notificationsApi.createNotification({
      user_id: recipientId,
      type: 'invitation',
      title: 'Conversation Invitation',
      message: `${inviterName} invited you to join "${conversationName}"`,
      data: { conversationId, inviterId }
    });
  } catch (error) {
    console.error('Failed to create invitation notification:', error);
  }
};

/**
 * Create a system notification
 */
export const createSystemNotification = async (
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  try {
    await notificationsApi.createNotification({
      user_id: userId,
      type: 'system',
      title,
      message,
      data
    });
  } catch (error) {
    console.error('Failed to create system notification:', error);
  }
};
