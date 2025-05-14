# Vanish - Documentation

## Overview

Vanish is a privacy-focused social media platform built with React, TypeScript, and Vite. Using Supabase for authentication and data storage, it automatically deletes posts after a specified time, giving users complete control over their digital footprint. The app features user profiles with editable bios and banners, real-time post updates, and a fully responsive design.

## Key Features

- **Authentication:** Users can sign up, log in, and log out using Supabase Auth.
- **Post Creation:** Create text-based posts with customizable expiration times (from seconds up to a week).
- **Automatic Post Expiration:** Posts are automatically removed after their set expiration.
- **User Profiles:** Profiles display username, display name, profile picture, bio, and banner. Profile owners can edit their bio and banner image.
- **Settings:** Users can update their display name and profile picture via a settings modal.
- **Protected Routes:** Certain pages (e.g., Home, Profile, Messages) require authentication.
- **Landing Page:** Features animated text, parallax scrolling effects, and an introduction to Vanish.
- **Real-time Updates:** Uses Supabase and custom hooks for seamless data fetching and updates.
- **Responsive Sidebar:** Navigation that includes quick access to Home, Messages (coming soon), Profile, and Settings.

## Technologies Used

- **React & TypeScript:** For building a strongly-typed user interface.
- **Vite:** A fast build tool providing an optimized development experience.
- **Supabase:** Provides authentication, real-time database features, and storage.
- **Tailwind CSS:** Utilized for rapidly building custom user interfaces.
- **Framer Motion:** Enables smooth animations and transitions across the app.
- **React Router:** For client-side routing and protected routes.
- **React Scroll Parallax:** Powers the parallax scrolling on the landing page.
- **tsparticles:** For creating captivating particle effects on the landing page.

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
├── src/
│   ├── App.tsx              # Main application component with routing
│   ├── AuthContext.tsx      # Authentication context and hooks
│   ├── components/
│   │   ├── CreatePostModal.tsx   # Modal for creating new posts
│   │   ├── Sidebar.tsx           # Sidebar navigation with profile preview and settings
│   │   ├── PostList.tsx          # Renders the list of posts
│   │   ├── ProtectedRoute.tsx    # Protects routes from unauthorized access
│   │   ├── SettingsModal.tsx     # Modal for updating user settings
│   │   └── Particles.tsx         # Particle animation component for the landing page
│   ├── hooks/
│   │   ├── usePosts.ts           # Custom hook for fetching and managing posts
│   │   └── useUserData.ts        # Custom hook for fetching and managing user profile data
│   ├── index.css               # Main CSS file using Tailwind CSS
│   ├── main.tsx                # Entry point for the React application
│   ├── pages/
│   │   ├── Home.tsx            # Home page displaying posts and sidebar
│   │   ├── Landing.tsx         # Animated landing page with parallax effects
│   │   ├── Login.tsx           # Login form page
│   │   ├── Signup.tsx          # Signup form page
│   │   ├── Profile.tsx         # User profile page with editable bio and banner
│   │   └── Settings.tsx        # Standalone settings page (alternative to modal)
│   ├── supabaseClient.ts       # Supabase client initialization and configuration
│   ├── types/
│   │   └── user.ts             # Type definitions for user profiles
│   └── vite-env.d.ts           # Vite environment variable typings
├── tailwind.config.js         # Tailwind CSS configuration file
├── tsconfig.app.json          # TypeScript configuration for the React app
├── tsconfig.json              # Main TypeScript configuration file
├── tsconfig.node.json         # TypeScript configuration for Node.js related files
└── vite.config.ts             # Vite configuration file
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- npm

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

   Create a `.env` file in the project root (if it doesn't already exist) and add your Supabase credentials:

   ```
   VITE_SUPABASE_URL=<your_supabase_url>
   VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   ```

4. **Run the application:**

   ```bash
   npm run dev
   ```

   The app should now be available at [http://localhost:5173](http://localhost:5173).

## Further Development

- **Messages Feature:** Currently a placeholder, this feature is under development.
- **Enhanced Media Support:** Adding the ability to include images and videos in posts.
- **Improved UI/UX:** Continual design improvements and component refinements.
- **End-to-End Encryption:** Future work on securing communications end-to-end.
- **User Following:** Implement user following and personalized feeds.

## References

- **App Component:** [src/App.tsx](src/App.tsx)
- **Profile Component:** [src/pages/Profile.tsx](src/pages/Profile.tsx)
- **Auth Context:** [src/AuthContext.tsx](src/AuthContext.tsx)
- **Supabase Client:** [src/supabaseClient.ts](src/supabaseClient.ts)
- **Custom Hooks:** [src/hooks/useUserData.ts](src/hooks/useUserData.ts), [src/hooks/usePosts.ts](src/hooks/usePosts.ts)

## License

This project is licensed under the terms specified in the repository LICENSE file.
