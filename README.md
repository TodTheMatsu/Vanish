# Vanish - Documentation

## Overview

Vanish is a privacy-focused social media platform built with React, TypeScript, and Vite, utilizing Supabase for authentication and data storage. The core concept is to give users control over their digital footprint by automatically deleting posts after a specified time.

## Key Features

*   **Authentication:** Users can sign up, log in, and log out using Supabase authentication.
*   **Post Creation:** Users can create text-based posts with an expiration time (ranging from seconds to a week).
*   **Automatic Post Deletion:** Posts are automatically removed after their expiration time.
*   **User Profiles:** Users have profiles with a username, display name, and profile picture.
*   **Settings:** Users can modify their display name and profile picture.
*   **Real-time Updates:** The application uses React and Supabase to provide a real-time experience.
*   **Landing Page:** A landing page introduces the concept of Vanish.

## Technologies Used

*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript.
*   **Vite:** A build tool that provides a fast and optimized development experience.
*   **Supabase:** An open-source Firebase alternative that provides authentication, database, and real-time functionality.
*   **Tailwind CSS:** A utility-first CSS framework.
*   **Framer Motion:** A library for creating animations.
*   **React Router:** A standard library for routing in React applications.
*   **React Scroll Parallax:** Used for creating parallax scrolling effects on the landing page.
*   **tsparticles:** Used for creating particle effects on the landing page.

## File Structure
<pre>
Vanish/
├── .replit # Replit configuration file
├── .gitignore # Specifies intentionally untracked files that Git should ignore
├── .env # Environment variables (Supabase URL and Key)
├── index.html # Main HTML file
├── package.json # Node.js package file
├── postcss.config.js # PostCSS configuration file
├── README.md # Documentation file
├── eslint.config.js # ESLint configuration file
├── src/
│ ├── App.tsx # Main application component
│ ├── AuthContext.tsx # Authentication context
│ ├── components/
│ │ ├── CreatePostModal.tsx # Modal for creating new posts
│ │ ├── PostList.tsx # Component to display list of posts
│ │ ├── ProtectedRoute.tsx # Component for protected routes
│ │ ├── SettingsModal.tsx # Modal for user settings
│ │ ├── Sidebar.tsx # Sidebar navigation component
│ │ └── Particles.tsx # Particles animation component
│ ├── hooks/
│ │ ├── usePosts.ts # Hook for managing posts data
│ │ └── useUserData.ts # Hook for managing user data
│ ├── index.css # Main CSS file
│ ├── main.tsx # Entry point for the React application
│ ├── pages/
│ │ ├── Home.tsx # Home page component
│ │ ├── Landing.tsx # Landing page component
│ │ ├── Login.tsx # Login page component
│ │ ├── Messages.tsx # Messages page component
│ │ ├── Settings.tsx # Settings page component
│ │ └── Signup.tsx # Signup page component
│ ├── supabaseClient.ts # Supabase client initialization
│ ├── types/
│ │ └── user.ts # TypeScript type definition for user profile
│ └── vite-env.d.ts # TypeScript definition file for Vite environment variables
├── tailwind.config.js # Tailwind CSS configuration file
├── tsconfig.app.json # TypeScript configuration file for the app
├── tsconfig.json # Main TypeScript configuration file
├── tsconfig.node.json # TypeScript configuration file for Node.js
└── vite.config.ts # Vite configuration file
</pre>
