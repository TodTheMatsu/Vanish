# Vanish - Documentation

---

## Overview

Vanish is a modern, feature-rich social messaging application built with React and Supabase. It combines real-time messaging, social posts, notifications, and more into a Progressive Web App experience.

### Key Features
- 💬 **Real-time Messaging** — Private conversations with real-time updates
- 📱 **Posts & Comments** — Social feed with nested comments
- 🔔 **Notifications** — Real-time notification system with read/unread tracking
- 👥 **Follow System** — Follow users and build your social network
- 🔒 **Authentication** — Secure login and signup with Supabase Auth
- 📲 **PWA Support** — Installable on mobile and desktop devices
- 🔔 **Push Notifications** — OneSignal integration for push notifications
- ⚡ **Real-time Updates** — Supabase real-time subscriptions for instant updates

### Technology Stack
- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS 4, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Real-time, Edge Functions)
- **State Management:** TanStack Query (React Query), React Context
- **Push Notifications:** OneSignal
- **PWA:** Vite PWA Plugin
- **Routing:** React Router v7

---

## Project Structure: Supabase (Backend) vs Frontend (React)

### 🟦 Supabase (Backend)
- `supabase/` — All backend code, Edge Functions, and migrations
  - `supabase/functions/` — Supabase Edge Functions (serverless API endpoints)
    - `create-conversation/`   — Implemented: Handles conversation creation (used by frontend)
    - `get-conversations/`     — Placeholder (add code if needed)
    - `get-messages/`          — Placeholder (add code if needed)
    - `get-user-permissions/`  — Placeholder (add code if needed)
    - `send-message/`          — Placeholder (add code if needed)
  - `supabase/migrations/` — Database migration files (SQL)
  - `supabase/config.toml` — Supabase project config
- `sql/policies/` — (Optional) SQL files for RLS policies

### 🟩 Frontend (React App)
- `src/` — All React app code
  - `src/api/` — API calls (calls Edge Functions or Supabase directly)
  - `src/components/` — React UI components
  - `src/pages/`, `src/hooks/`, etc. — App logic and UI
- `public/` — Static assets for the frontend
- `.env` — Environment variables for frontend (Supabase URL/keys)

### 🟧 Project Root (shared/config)
- `package.json`, `vite.config.ts`, `tsconfig.json`, etc. — Project config
- `README.md` — This file

---

## Real-time Messaging (NEW)

Real-time updates for all conversations are now handled globally using the `ConversationSubscriptions` component. This ensures users receive updates for all their conversations, not just the currently open one.

**How it works:**
- `src/components/ConversationSubscriptions.tsx` uses `useConversations` to get all conversation IDs for the current user.
- For each conversation, it renders a hidden subscription using `useRealtimeMessages`.
- The component is rendered at the top level of the `Messages` page.

**Usage Example:**
```tsx
// src/pages/Messages.tsx
import { ConversationSubscriptions } from '../components/ConversationSubscriptions';

export default function Messages() {
  // ...existing code...
  return (
    <div>
      <ConversationSubscriptions />
      {/* ...rest of your layout... */}
    </div>
  );
}
```

**Extending:**
- To add new real-time events, update `useRealtimeMessages` and/or the Edge Functions as needed.
- No need to manually subscribe/unsubscribe in each chat window.

---

## Posts Feature

Vanish supports a social posts feature, allowing users to create, view, and interact with posts. Posts are displayed on the Home page and can be created via a modal dialog.

**Key Components & Hooks:**
- `src/components/PostList.tsx` — Displays a list of posts.
- `src/components/CreatePostModal.tsx` — Modal for creating a new post.
- `src/components/PostFocusModal.tsx` — Modal for viewing a single post with comments.
- `src/hooks/usePosts.ts` — Custom hook for fetching and creating posts.
- `src/api/postsApi.ts` — API layer for post operations.

**How it works:**
- Posts are fetched and managed using the `usePosts` hook, which interacts with Supabase directly.
- The Home page (`src/pages/Home.tsx`) displays posts and provides a button to open the create post modal.
- Users can click on a post to view it in focus mode with comments.

**Usage Example:**
```tsx
// src/pages/Home.tsx
import { PostList } from '../components/PostList';
import CreatePostModal from '../components/CreatePostModal';
import { usePosts } from '../hooks/usePosts';

export default function Home() {
  const { posts, createPost } = usePosts();
  // ...existing code...
  return (
    <>
      <PostList posts={posts} />
      <CreatePostModal onCreate={createPost} />
    </>
  );
}
```

---

## Comments Feature

Vanish supports nested comments on posts, allowing users to comment and reply to comments.

**Key Components & Hooks:**
- `src/components/CommentSection.tsx` — Displays comments for a post.
- `src/components/CommentList.tsx` — Renders a list of comments.
- `src/components/CommentItem.tsx` — Individual comment component with reply functionality.
- `src/components/AddCommentForm.tsx` — Form for adding new comments.
- `src/hooks/useComments.ts` — Custom hook for fetching, creating, and deleting comments.
- `src/api/commentsApi.ts` — API layer for comment operations.

**How it works:**
- Comments are managed using the `useComments` hook, which interacts with Supabase directly.
- Comments support nested replies (parent-child relationships).
- Comments are displayed in the `PostFocusModal` when viewing a post.
- Users can delete their own comments.

**Usage Example:**
```tsx
import { useComments } from '../hooks/useComments';

const { comments, createComment, deleteComment, isLoading } = useComments(postId);

// Create a comment
await createComment({
  postId,
  content: 'Great post!',
  parentCommentId: null, // or parent comment ID for replies
});
```

---

## Notifications Feature

Vanish includes a comprehensive notification system that keeps users informed about interactions and updates.

**Key Components & Hooks:**
- `src/pages/Notifications.tsx` — Notifications page displaying all user notifications.
- `src/components/NotificationList.tsx` — Displays a list of notifications.
- `src/components/NotificationItem.tsx` — Individual notification component.
- `src/components/RealtimeNotificationsProvider.tsx` — Provides real-time notification updates.
- `src/hooks/useNotifications.ts` — Custom hook for notification management.
- `src/hooks/useRealtimeNotifications.ts` — Hook for real-time notification subscriptions.
- `src/api/notificationsApi.ts` — API layer for notification operations.

**How it works:**
- Notifications are fetched and managed using the `useNotifications` hook.
- Real-time updates are handled by `RealtimeNotificationsProvider` using Supabase real-time subscriptions.
- Users can mark notifications as read, mark all as read, or delete notifications.
- The system tracks unread count displayed in the sidebar.

**Usage Example:**
```tsx
import { useNotifications } from '../hooks/useNotifications';

const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = useNotifications();
```

**Features:**
- Filter notifications by all or unread
- Mark individual notifications as read
- Mark all notifications as read at once
- Delete individual notifications
- Delete all read notifications
- Real-time notification updates

---

## Follow System

Vanish supports a social follow system where users can follow and unfollow each other.

**Key Components & Hooks:**
- `src/hooks/useFollow.ts` — Custom hooks for follow functionality.
- Profile pages display follow/unfollow buttons and follower/following counts.

**Available Hooks:**
- `useFollow(myUserId, targetUserId)` — Check follow status and follow/unfollow users.
- `useFollowerCount(userId)` — Get follower count for a user.
- `useFollowingCount(userId)` — Get following count for a user.

**Usage Example:**
```tsx
import { useFollow, useFollowerCount, useFollowingCount } from '../hooks/useFollow';

const { isFollowing, follow, unfollow } = useFollow(myUserId, targetUserId);
const { data: followerCount } = useFollowerCount(targetUserId);
const { data: followingCount } = useFollowingCount(targetUserId);

// Follow a user
<button onClick={() => follow()}>
  {isFollowing ? 'Unfollow' : 'Follow'}
</button>
```

---

## Push Notifications (OneSignal)

Vanish integrates OneSignal for push notifications to keep users engaged even when not actively using the app.

**Key Files:**
- `src/useOneSignal.ts` — OneSignal initialization hook.
- `src/OneSignalInitializer.tsx` — Component to initialize OneSignal.

**How it works:**
- OneSignal is initialized when a user logs in, using their user ID.
- Push notifications are configured to work with the PWA.
- Service worker files are located in `/public/onesignal/`.

**Setup:**
1. Configure environment variable: `VITE_PUBLIC_ONESIGNAL_APP_ID` or `VITE_ONESIGNAL_APP_ID`
2. OneSignal automatically initializes on user login
3. Users are prompted to allow notifications

---

## Progressive Web App (PWA)

Vanish is built as a Progressive Web App, allowing users to install it on their devices for a native app-like experience.

**Key Configuration:**
- `vite.config.ts` — PWA configuration using `vite-plugin-pwa`.
- App manifest configured with name, icons, and display settings.

**Features:**
- Installable on mobile and desktop devices
- Standalone display mode (no browser UI)
- Offline support with service workers
- Auto-update functionality
- Mobile PWA blocker for non-installed users (forces PWA installation on mobile)

**PWA Manifest:**
```json
{
  "name": "Vanish",
  "short_name": "Vanish",
  "start_url": "/home",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000"
}
```

**Mobile Installation:**
- Mobile users are prompted to install the PWA
- App must be installed to use on mobile devices
- Installation prompt uses native browser install functionality

---

## Edge Functions

Edge Functions are serverless API endpoints deployed to Supabase. Only `create-conversation` is implemented by default. Others are placeholders—add code as needed.

- `create-conversation`: Handles creation of conversations and participants in a single transaction, bypassing RLS issues. Used by the frontend for all new conversation creation.
- `get-conversations`, `get-messages`, `get-user-permissions`, `send-message`: Placeholders. Implement as needed for advanced backend logic or security.

**To add or update an Edge Function:**
1. Add or edit code in `supabase/functions/<function-name>/index.ts` for your desired function (e.g., `create-conversation`, `get-messages`, etc.).
2. Deploy the function with:
   ```bash
   npx supabase functions deploy <function-name>
   ```
   You can deploy multiple functions by running the command for each one.
3. Call the deployed function from the frontend using the `/functions/v1/<function-name>` endpoint.

---

## Migrations & Database Setup

- All schema and RLS changes should be made as migration files in `supabase/migrations/`.
- To apply migrations locally: `npx supabase db reset` (WARNING: this wipes local data!)
- To push migrations to remote: `npx supabase db push` (requires project to be linked)
- RLS policies may also be managed in `sql/policies/` for reference, but only migrations in `supabase/migrations/` are applied automatically.

---

## Authentication

Vanish supports user authentication with login and signup flows. Authentication state is managed globally using `AuthContext` and the `useAuth` hook.

**Key Files:**
- `src/pages/Login.tsx` — Login page
- `src/pages/Signup.tsx` — Signup page
- `src/AuthContext.tsx` — Authentication context and logic

**Usage Example:**
```tsx
import { useAuth } from '../AuthContext';

const { login, signup, logout, isAuthenticated } = useAuth();
// Use these methods in your components for authentication actions
```

---

## User Profiles & Settings

Users can view and edit their profile, including display name, profile picture, and bio. Settings are managed via modals and custom hooks. Users can also follow/unfollow other users and view follower/following counts.

**Key Files:**
- `src/pages/Profile.tsx` — User profile page
- `src/pages/Settings.tsx` — Settings page (if separate)
- `src/hooks/useUserData.ts` — Fetch and update user data
- `src/hooks/useSettings.ts` — Manage user settings
- `src/hooks/useFollow.ts` — Follow/unfollow functionality and counts
- `src/api/userApi.ts` — API layer for user operations

**Features:**
- View user profiles with posts
- Edit profile information (username, display name, bio, profile picture)
- Follow/unfollow users
- View follower and following counts
- Search for users

---

## Toast Notifications

Vanish provides a toast notification system for user feedback. Use the `useToast` hook to trigger notifications, and wrap your app with `ToastProvider`.

**Key Files:**
- `src/components/ToastProvider.tsx` — Toast context provider
- `src/hooks/useToast.ts` — Toast hook

**Usage Example:**
```tsx
import { useToast } from '../hooks/useToast';
const { addToast } = useToast();
addToast('Profile updated!', 'success');
```

---

## Protected Routes

Pages that require authentication are wrapped with the `ProtectedRoute` component to prevent unauthorized access.

**Key File:**
- `src/components/ProtectedRoute.tsx`

---

## UI/UX Components

- **Modals:** 
  - `CreatePostModal` — Create new posts
  - `SettingsModal` — Edit user settings
  - `PostFocusModal` — View post with comments
  - `NewConversationModal` — Start new conversations
  - `PendingInvitationsModal` — Manage conversation invitations
  - `SearchUsersModal` — Search and find users
  - `ConfirmDialog` — Generic confirmation dialog
- **Particles & Animations:** Visual enhancements using `Particles.tsx` and Framer Motion for smooth transitions.
- **Sidebar Navigation:** Quick navigation and actions via `Sidebar.tsx` with route-aware highlighting.
- **Toast Notifications:** User feedback via `ToastProvider.tsx` and `useToast` hook.
- **Real-time Subscriptions:** Background subscription components for messages and notifications.

---

## Landing Page

The landing page (`Landing.tsx`) provides an introduction and call-to-action for new users.

---

## TypeScript Types

Custom types for user profiles and other entities are defined in `src/types/`.

---

## File Structure (Detailed)

```
Vanish/
├── supabase/                  # 🟦 Supabase backend (Edge Functions, migrations, config)
│   ├── config.toml            # Supabase project config
│   ├── migrations/            # Database migration files (SQL)
│   │   └── *.sql              # Migration scripts (schema, RLS fixes, etc.)
│   └── functions/             # Supabase Edge Functions (serverless API endpoints)
│       ├── create-conversation/   # Implemented Edge Function (conversation creation)
│       │   └── index.ts
│       ├── get-conversations/     
│       ├── get-messages/        
│       ├── get-user-permissions/
│       └── send-message/          
├── sql/
│   └── policies/              # (Optional) SQL files for RLS policies
├── src/                      # 🟩 Frontend (React app)
│   ├── api/                  # API layer (calls Edge Functions or Supabase directly)
│   │   ├── messagesApi.ts    # Messages API
│   │   ├── postsApi.ts       # Posts API
│   │   ├── commentsApi.ts    # Comments API
│   │   ├── notificationsApi.ts # Notifications API
│   │   └── userApi.ts        # User profile API
│   ├── components/           # React UI components
│   │   ├── PostList.tsx, CreatePostModal.tsx, PostFocusModal.tsx # Posts
│   │   ├── CommentSection.tsx, CommentList.tsx, CommentItem.tsx # Comments
│   │   ├── NotificationList.tsx, NotificationItem.tsx # Notifications
│   │   ├── ConversationSubscriptions.tsx # Real-time message subscriptions
│   │   ├── RealtimeNotificationsProvider.tsx # Real-time notifications
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── ToastProvider.tsx # Toast notifications
│   │   ├── ProtectedRoute.tsx # Route protection
│   │   ├── SettingsModal.tsx, SearchUsersModal.tsx, ConfirmDialog.tsx # Modals
│   │   └── messages/         # Message components
│   │       ├── ChatWindow.tsx, MessageBubble.tsx, MessageInput.tsx
│   │       ├── ConversationList.tsx, ConversationItem.tsx, ConversationHeader.tsx
│   │       ├── NewConversationModal.tsx, PendingInvitationsModal.tsx
│   │       └── MessagesLayout.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── usePosts.ts       # Posts management
│   │   ├── useComments.ts    # Comments management
│   │   ├── useNotifications.ts # Notifications management
│   │   ├── useMessages.ts    # Messages management
│   │   ├── useRealtimeMessages.ts # Real-time message subscriptions
│   │   ├── useRealtimeNotifications.ts # Real-time notification subscriptions
│   │   ├── useFollow.ts      # Follow/unfollow functionality
│   │   ├── useSettings.ts    # User settings
│   │   ├── useUserData.ts    # User data fetching
│   │   └── useToast.ts       # Toast notifications
│   ├── pages/                # Page components
│   │   ├── Landing.tsx       # Landing page
│   │   ├── Login.tsx, Signup.tsx # Authentication
│   │   ├── Home.tsx          # Home feed with posts
│   │   ├── Profile.tsx       # User profiles
│   │   ├── Messages.tsx      # Messaging page
│   │   └── Notifications.tsx # Notifications page
│   ├── assets/               # Static assets (images, icons)
│   ├── types/                # TypeScript type definitions
│   ├── constants/            # App constants (e.g., stale times)
│   ├── App.tsx, main.tsx     # Main app files
│   ├── AuthContext.tsx       # Authentication context
│   ├── UserContext.tsx       # User context
│   ├── supabaseClient.ts     # Supabase client config for frontend
│   ├── useOneSignal.ts       # OneSignal push notifications hook
│   └── OneSignalInitializer.tsx # OneSignal initializer component
├── public/                   # Static assets for frontend
│   ├── onesignal/            # OneSignal service worker files
│   ├── web-app-manifest-*.png # PWA icons
│   └── ...
├── .env                      # Environment variables (Supabase URL/keys for frontend)
├── package.json, ...         # Project config
├── vite.config.ts            # Vite config with PWA plugin
├── README.md                 # Project documentation (this file)
└── ...                       # Other config files (Tailwind, ESLint, TypeScript, etc.)
```

- 🟦 = Supabase backend (Edge Functions, migrations, config)
- 🟩 = Frontend (React app)

---

## API Reference (Backend vs Frontend)

- **Edge Functions** (called via `/functions/v1/<function-name>`):
  - `create-conversation` (used in `src/api/messagesApi.ts`)
  - (Add more as you implement them)
  
- **Direct Supabase API** (called via `supabase-js`):
  - **Posts** — Create, fetch, and manage posts (`src/api/postsApi.ts`, `src/hooks/usePosts.ts`)
  - **Comments** — Create, fetch, delete comments on posts (`src/api/commentsApi.ts`, `src/hooks/useComments.ts`)
  - **Notifications** — Fetch, mark as read, delete notifications (`src/api/notificationsApi.ts`, `src/hooks/useNotifications.ts`)
  - **Messages** — Messaging and conversations (`src/api/messagesApi.ts`, `src/hooks/useMessages.ts`)
  - **User Profiles** — Fetch and update user data (`src/api/userApi.ts`, `src/hooks/useUserData.ts`)
  - **Follow System** — Follow/unfollow users, get counts (`src/hooks/useFollow.ts`)

---

## Getting Started (Updated)

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd Vanish
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   Create a `.env` file in the project root and add your Supabase credentials and OneSignal App ID:
   ```
   VITE_SUPABASE_URL=<your_supabase_url>
   VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   VITE_PUBLIC_ONESIGNAL_APP_ID=<your_onesignal_app_id>
   ```
4. **Set up Supabase database:**
   - Apply migrations: `npx supabase db reset` (local) or `npx supabase db push` (remote)
   - (Optional) Run SQL from `sql/policies/` in the Supabase SQL editor for reference
5. **Deploy Edge Functions:**
   - Deploy at least `create-conversation` for messaging to work: `npx supabase functions deploy create-conversation`
   - Deploy others as you implement them
6. **Set up OneSignal (Optional):**
   - Create a OneSignal account and app at [onesignal.com](https://onesignal.com)
   - Configure push notifications for web
   - Add your OneSignal App ID to the `.env` file
   - Place OneSignal service worker files in `/public/onesignal/`
7. **Run the application:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).
8. **Build for production:**
   ```bash
   npm run build
   ```
   This will create a production build with PWA support.

---

## Development Scripts

Common commands for development:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm run test

# Supabase commands
npx supabase start              # Start local Supabase
npx supabase db reset           # Reset local database and apply migrations
npx supabase db push            # Push migrations to remote
npx supabase functions deploy <function-name>  # Deploy Edge Function
```

---

## Contributing

- Fork the repository
- Create a feature branch (`git checkout -b feature/amazing-feature`)
- Commit your changes (`git commit -m 'Add amazing feature'`)
- Push to the branch (`git push origin feature/amazing-feature`)
- Open a Pull Request

---

## References

### Main App
- **Main App:** [src/App.tsx](src/App.tsx)
- **Auth Context:** [src/AuthContext.tsx](src/AuthContext.tsx)
- **User Context:** [src/UserContext.tsx](src/UserContext.tsx)
- **Supabase Client:** [src/supabaseClient.ts](src/supabaseClient.ts)

### Real-time Features
- **Real-time Messaging:** [src/components/ConversationSubscriptions.tsx](src/components/ConversationSubscriptions.tsx), [src/hooks/useRealtimeMessages.ts](src/hooks/useRealtimeMessages.ts)
- **Real-time Notifications:** [src/components/RealtimeNotificationsProvider.tsx](src/components/RealtimeNotificationsProvider.tsx), [src/hooks/useRealtimeNotifications.ts](src/hooks/useRealtimeNotifications.ts)

### Posts & Comments
- **Posts:** [src/components/PostList.tsx](src/components/PostList.tsx), [src/components/CreatePostModal.tsx](src/components/CreatePostModal.tsx), [src/hooks/usePosts.ts](src/hooks/usePosts.ts), [src/api/postsApi.ts](src/api/postsApi.ts)
- **Comments:** [src/components/CommentSection.tsx](src/components/CommentSection.tsx), [src/hooks/useComments.ts](src/hooks/useComments.ts), [src/api/commentsApi.ts](src/api/commentsApi.ts)

### Notifications
- **Notifications:** [src/pages/Notifications.tsx](src/pages/Notifications.tsx), [src/components/NotificationList.tsx](src/components/NotificationList.tsx), [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts), [src/api/notificationsApi.ts](src/api/notificationsApi.ts)

### Messages
- **Messages API:** [src/api/messagesApi.ts](src/api/messagesApi.ts)
- **Messages Hooks:** [src/hooks/useMessages.ts](src/hooks/useMessages.ts)

### User & Social
- **Follow System:** [src/hooks/useFollow.ts](src/hooks/useFollow.ts)
- **User API:** [src/api/userApi.ts](src/api/userApi.ts)

### Push Notifications & PWA
- **OneSignal:** [src/useOneSignal.ts](src/useOneSignal.ts), [src/OneSignalInitializer.tsx](src/OneSignalInitializer.tsx)
- **PWA Config:** [vite.config.ts](vite.config.ts)

### Backend
- **Edge Functions:** [supabase/functions/](supabase/functions/)
- **Migrations:** [supabase/migrations/](supabase/migrations/)

---

## License

This project is licensed under the terms specified in the repository LICENSE file.
