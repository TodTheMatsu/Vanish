# Vanish - Documentation

## Overview

Vanish is a privacy-focused social media platform built with React, TypeScript, and Vite. Using Supabase for authentication and data storage, it features ephemeral posts that automatically delete after a specified time and real-time messaging capabilities. Users have complete control over their digital footprint with automatic content expiration and secure messaging.

## Key Features

### **Authentication & Security**
- **Secure Authentication:** Users can sign up, log in, and log out using Supabase Auth with JWT tokens
- **Row Level Security (RLS):** Database-level security ensuring users only access their own data
- **Protected Routes:** Authentication required for Home, Profile, Messages, and Settings pages

### **Ephemeral Posts**
- **Post Creation:** Create text-based posts with customizable expiration times (from seconds up to a week)
- **Automatic Post Expiration:** Posts are automatically removed after their set expiration time
- **Real-time Updates:** Posts update and disappear in real-time across all connected clients

### **Real-time Messaging System**
- **Instant Messaging:** Send and receive messages in real-time using hybrid broadcast architecture
- **Conversation Management:** Create direct and group conversations with role-based permissions
- **Message Operations:** Edit, delete, and reply to messages with real-time updates
- **Typing Indicators:** Real-time typing status (coming soon)
- **Message Expiration:** Messages automatically expire based on conversation settings

### **User Profiles & Settings**
- **Rich Profiles:** Display username, display name, profile picture, bio, and banner
- **Profile Customization:** Edit bio, banner image, display name, and profile picture
- **Settings Modal:** Quick access to profile settings and preferences

### **User Interface**
- **Responsive Design:** Fully responsive across desktop, tablet, and mobile devices
- **Modern UI:** Clean, intuitive interface with smooth animations and transitions
- **Animated Landing Page:** Features parallax scrolling effects and particle animations
- **Dark Theme:** Consistent dark theme throughout the application

## Technologies Used

- **React & TypeScript:** For building a strongly-typed, component-based user interface
- **Vite:** Fast build tool providing optimized development experience and hot module replacement
- **Supabase:** Backend-as-a-Service providing authentication, real-time database, and storage
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development
- **Framer Motion:** Animation library for smooth transitions and micro-interactions
- **React Router:** Client-side routing with protected route handling
- **React Scroll Parallax:** Parallax scrolling effects on the landing page
- **tsparticles:** Interactive particle effects and animations
- **TanStack Query:** Data fetching, caching, and synchronization for optimal UX

## Real-time Architecture

Vanish uses a **hybrid real-time architecture** that combines database security with instant updates:

### **Security Layer**
- **Row Level Security (RLS):** Database policies ensure users can only access authorized data
- **JWT Authentication:** All API calls authenticated with Supabase JWT tokens
- **Edge Functions:** Server-side validation for complex operations

### **Real-time Layer**
- **Broadcast Events:** Real-time updates bypass RLS using Supabase's broadcast system
- **Authenticated Subscriptions:** Real-time channels require user authentication
- **Conversation-based Channels:** Each conversation has its own secure channel (`messages:${conversationId}`)

### **Message Flow**
1. **Send Message:** API → Database (RLS protected) → Broadcast event → Real-time update
2. **Receive Message:** Subscribe to channel → Receive broadcast → Update UI cache
3. **Security:** Only authorized users can subscribe to conversation channels

This architecture provides **database-level security** with **instant real-time updates**.

## File Structure

```
Vanish/
├── .replit                  # Replit configuration file
├── .gitignore               # Files and directories git should ignore
├── .env                     # Environment variables for Supabase credentials
├── index.html               # Main HTML file
├── package.json             # Project configuration and dependencies
├── postcss.config.js        # PostCSS configuration file
├── README.md                # Project documentation (this file)
├── eslint.config.js         # ESLint configuration file
├── vercel.json              # Vercel deployment configuration
├── vite.config.ts           # Vite configuration file
├── tsconfig.*.json          # TypeScript configuration files
├── tailwind.config.js       # Tailwind CSS configuration
├── email-templates/         # Email templates for notifications
├── public/                  # Static assets
├── sql/
│   └── policies/            # Database RLS policies
├── supabase/
│   └── functions/           # Supabase Edge Functions
│       ├── get-conversations/
│       ├── get-messages/
│       ├── get-user-permissions/
│       └── send-message/
└── src/
    ├── App.tsx              # Main application component with routing
    ├── AuthContext.tsx      # Authentication context and hooks
    ├── UserContext.tsx      # User profile context and hooks
    ├── supabaseClient.ts    # Supabase client configuration
    ├── index.css            # Main CSS file using Tailwind CSS
    ├── main.tsx             # React application entry point
    ├── vite-env.d.ts        # Vite environment variable typings
    ├── api/                 # API layer for data operations
    │   ├── messagesApi.ts   # Messaging API with real-time broadcasts
    │   ├── postsApi.ts      # Posts API with expiration handling
    │   └── userApi.ts       # User profile API
    ├── assets/              # Static assets (images, icons)
    ├── components/          # Reusable React components
    │   ├── CreatePostModal.tsx
    │   ├── Sidebar.tsx
    │   ├── PostList.tsx
    │   ├── ProtectedRoute.tsx
    │   ├── SettingsModal.tsx
    │   ├── SearchUsersModal.tsx
    │   ├── Particles.tsx
    │   ├── ToastProvider.tsx
    │   └── messages/        # Messaging components
    │       ├── ChatWindow.tsx
    │       ├── ConversationHeader.tsx
    │       ├── ConversationItem.tsx
    │       ├── ConversationList.tsx
    │       ├── MessageBubble.tsx
    │       ├── MessageInput.tsx
    │       ├── MessagesLayout.tsx
    │       └── NewConversationModal.tsx
    ├── hooks/               # Custom React hooks
    │   ├── usePosts.ts      # Post management and real-time updates
    │   ├── useUserData.ts   # User profile data management
    │   ├── useMessages.ts   # Message operations and caching
    │   ├── useRealtimeMessages.ts # Real-time message subscriptions
    │   ├── useSettings.ts   # User settings management
    │   └── useToast.ts      # Toast notification system
    ├── pages/               # Page components
    │   ├── Home.tsx         # Home feed with posts and sidebar
    │   ├── Landing.tsx      # Animated landing page
    │   ├── Login.tsx        # Authentication login page
    │   ├── Signup.tsx       # User registration page
    │   ├── Profile.tsx      # User profile page with customization
    │   ├── Messages.tsx     # Real-time messaging interface
    │   └── Settings.tsx     # User settings page
    └── types/               # TypeScript type definitions
        └── user.ts          # User profile type definitions
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm or yarn
- Supabase account and project

### Setup Instructions

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

   Run the SQL policies from `sql/policies/` in your Supabase SQL editor to set up:
   - Row Level Security policies for messages, conversations, and user data
   - Database triggers for automatic content expiration
   - User profile tables and indexes

5. **Deploy Edge Functions (optional):**

   If using Edge Functions, deploy them to your Supabase project:
   ```bash
   supabase functions deploy
   ```

6. **Run the application:**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:5173](http://localhost:5173).

### Database Setup

The application requires the following database tables:
- `profiles` - User profile information
- `posts` - Ephemeral posts with expiration
- `conversations` - Chat conversations
- `conversation_participants` - User-conversation relationships
- `messages` - Chat messages with expiration

RLS policies ensure data security while allowing real-time functionality.

## Current Status & Roadmap

### ✅ **Completed Features**
- **Real-time Messaging:** Fully functional with broadcast architecture and RLS security
- **Ephemeral Posts:** Auto-expiring posts with real-time updates
- **User Authentication:** Secure login/signup with JWT tokens
- **Profile Management:** Customizable profiles with bio, banner, and settings
- **Responsive UI:** Mobile-first design with dark theme
- **Data Security:** Row Level Security policies protecting user data

### 🚧 **In Development**
- **Message Threading:** Reply-to-message functionality
- **Typing Indicators:** Real-time typing status in conversations
- **File Sharing:** Image and file upload in messages
- **Push Notifications:** Browser notifications for new messages
- **Message Search:** Search within conversation history

### 📋 **Planned Features**
- **Group Chat Management:** Advanced admin controls for group conversations
- **End-to-End Encryption:** Client-side message encryption
- **Voice Messages:** Audio message recording and playback
- **Message Reactions:** Emoji reactions to messages
- **User Following:** Follow system and personalized feeds
- **Enhanced Media Support:** Video sharing and rich media embeds

## API Reference

### **Authentication API**
- User registration, login, and session management
- JWT token handling and refresh

### **Posts API** (`src/api/postsApi.ts`)
- Create ephemeral posts with expiration times
- Real-time post updates and automatic cleanup
- User timeline and feed management

### **Messages API** (`src/api/messagesApi.ts`)
- Send, edit, and delete messages with real-time broadcasts
- Conversation management (create, join, leave)
- Permission-based access control

### **User API** (`src/api/userApi.ts`)
- Profile management and settings
- User search and discovery
- Avatar and banner image handling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## References

- **Main App:** [src/App.tsx](src/App.tsx)
- **Real-time Messaging:** [src/hooks/useRealtimeMessages.ts](src/hooks/useRealtimeMessages.ts)
- **Messages API:** [src/api/messagesApi.ts](src/api/messagesApi.ts)
- **Auth Context:** [src/AuthContext.tsx](src/AuthContext.tsx)
- **Supabase Client:** [src/supabaseClient.ts](src/supabaseClient.ts)

## License

This project is licensed under the terms specified in the repository LICENSE file.
