import { useParams } from 'react-router-dom';
import { MessagesLayout } from '../components/messages/MessagesLayout';

export default function Messages() {
  const { conversationId } = useParams<{ conversationId?: string }>();

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden">
      <MessagesLayout selectedConversationId={conversationId} />
    </div>
  );
}
