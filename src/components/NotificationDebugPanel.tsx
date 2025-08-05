import { useUser } from '../UserContext';
import { createSampleNotifications, createSystemNotification } from '../utils/notificationHelpers';
import { useToast } from '../hooks/useToast';

/**
 * Debug component for testing notifications
 * You can remove this after testing
 */
export function NotificationDebugPanel() {
  const { userId } = useUser();
  const { addToast } = useToast();

  const handleCreateSamples = async () => {
    if (!userId) {
      addToast('Please log in first', 'error');
      return;
    }

    try {
      await createSampleNotifications(userId);
      addToast('Sample notifications created!', 'success');
    } catch (error) {
      addToast('Failed to create notifications', 'error');
    }
  };

  const handleCreateSystemNotification = async () => {
    if (!userId) {
      addToast('Please log in first', 'error');
      return;
    }

    try {
      await createSystemNotification(
        userId,
        'Test System Notification',
        'This is a test system notification created at ' + new Date().toLocaleTimeString(),
        { testNotification: true }
      );
      addToast('System notification created!', 'success');
    } catch (error) {
      addToast('Failed to create system notification', 'error');
    }
  };

  if (!userId) {
    return (
      <div className="p-4 bg-yellow-600/20 border border-yellow-500/50 rounded-lg">
        <p className="text-yellow-200 text-sm">Please log in to test notifications</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-600/20 border border-blue-500/50 rounded-lg">
      <h3 className="text-blue-200 font-semibold mb-3">Notification Debug Panel</h3>
      <div className="space-y-2">
        <button
          onClick={handleCreateSamples}
          className="block w-full px-3 py-2 bg-blue-600/30 hover:bg-blue-600/40 rounded text-blue-200 text-sm transition-colors"
        >
          Create Sample Notifications
        </button>
        <button
          onClick={handleCreateSystemNotification}
          className="block w-full px-3 py-2 bg-green-600/30 hover:bg-green-600/40 rounded text-green-200 text-sm transition-colors"
        >
          Create Test System Notification
        </button>
      </div>
      <p className="text-xs text-neutral-400 mt-2">
        Use these buttons to test the notification system. Remove this component when done testing.
      </p>
    </div>
  );
}
