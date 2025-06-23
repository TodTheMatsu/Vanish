import { useParams, useNavigate } from 'react-router-dom';
import { MessagesLayout } from '../components/messages/MessagesLayout';
import Sidebar from '../components/Sidebar';

export default function Messages() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white flex relative overflow-hidden">
      <Sidebar
        onNavigate={path => navigate(path)}
        onSettings={() => navigate('/settings')}
        onCreatePost={() => {}}
      />
      <div className="flex-1 min-w-0">
        <MessagesLayout selectedConversationId={conversationId} />
      </div>
    </div>
  );
}
