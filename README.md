# Vanish - Documentation

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
- `src/hooks/usePosts.ts` — Custom hook for fetching and creating posts.

**How it works:**
- Posts are fetched and managed using the `usePosts` hook, which interacts with Supabase directly.
- The Home page (`src/pages/Home.tsx`) displays posts and provides a button to open the create post modal.

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

**Extending:**
- To add new post features (e.g., comments, likes), extend the `usePosts` hook and related components.

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

Users can view and edit their profile, including display name, profile picture, and bio. Settings are managed via modals and custom hooks.

**Key Files:**
- `src/pages/Profile.tsx` — User profile page
- `src/pages/Settings.tsx` — Settings page
- `src/hooks/useUserData.ts` — Fetch and update user data
- `src/hooks/useSettings.ts` — Manage user settings

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

## UI/UX Utilities

- **Modals:** Used for creating posts and editing settings (`CreatePostModal`, `SettingsModal`).
- **Particles & Animations:** Visual enhancements using `Particles.tsx` and Framer Motion.
- **Sidebar Navigation:** Quick navigation and actions via `Sidebar.tsx`.

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
│   ├── components/           # React UI components
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page components
│   ├── assets/               # Static assets (images, icons)
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx, main.tsx, ...# Main app files
│   └── supabaseClient.ts     # Supabase client config for frontend
├── public/                   # Static assets for frontend
├── .env                      # Environment variables (Supabase URL/keys for frontend)
├── package.json, ...         # Project config
├── README.md                 # Project documentation (this file)
└── ...                       # Other config files (Vite, Tailwind, etc.)
```

- 🟦 = Supabase backend (Edge Functions, migrations, config)
- 🟩 = Frontend (React app)

---

## API Reference (Backend vs Frontend)

- **Edge Functions** (called via `/functions/v1/<function-name>`):
  - `create-conversation` (used in `src/api/messagesApi.ts`)
  - (Add more as you implement them)
- **Direct Supabase API** (called via `supabase-js`):
  - Posts (see `src/hooks/usePosts.ts`), user profiles, and some messaging features

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
   Create a `.env` file in the project root and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=<your_supabase_url>
   VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   ```
4. **Set up Supabase database:**
   - Apply migrations: `npx supabase db reset` (local) or `npx supabase db push` (remote)
   - (Optional) Run SQL from `sql/policies/` in the Supabase SQL editor for reference
5. **Deploy Edge Functions:**
   - Deploy at least `create-conversation` for messaging to work: `npx supabase functions deploy create-conversation`
   - Deploy others as you implement them
6. **Run the application:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Contributing

- Fork the repository
- Create a feature branch (`git checkout -b feature/amazing-feature`)
- Commit your changes (`git commit -m 'Add amazing feature'`)
- Push to the branch (`git push origin feature/amazing-feature`)
- Open a Pull Request

---

## References

- **Main App:** [src/App.tsx](src/App.tsx)
- **Real-time Messaging:** [src/components/ConversationSubscriptions.tsx](src/components/ConversationSubscriptions.tsx), [src/hooks/useRealtimeMessages.ts](src/hooks/useRealtimeMessages.ts)
- **Posts:** [src/components/PostList.tsx](src/components/PostList.tsx), [src/components/CreatePostModal.tsx](src/components/CreatePostModal.tsx), [src/hooks/usePosts.ts](src/hooks/usePosts.ts)
- **Messages API:** [src/api/messagesApi.ts](src/api/messagesApi.ts)
- **Auth Context:** [src/AuthContext.tsx](src/AuthContext.tsx)
- **Supabase Client:** [src/supabaseClient.ts](src/supabaseClient.ts)
- **Edge Functions:** [supabase/functions/](supabase/functions/)
- **Migrations:** [supabase/migrations/](supabase/migrations/)

---

## License

This project is licensed under the terms specified in the repository LICENSE file.
