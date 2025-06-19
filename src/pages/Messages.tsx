import { useParams } from 'react-router-dom';
import { MessagesLayout } from '../components/messages/MessagesLayout';

export default function Messages() {
  const { conversationId } = useParams<{ conversationId?: string }>();

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <MessagesLayout selectedConversationId={conversationId} />
    </div>
  );
}
