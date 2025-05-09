Vanish - Documentation
Overview
Vanish is a privacy-focused social media platform built with React, TypeScript, and Vite, utilizing Supabase for authentication and data storage. The core concept is to give users control over their digital footprint by automatically deleting posts after a specified time.

Key Features
Authentication: Users can sign up, log in, and log out using Supabase authentication.
Post Creation: Users can create text-based posts with an expiration time (ranging from seconds to a week).
Automatic Post Deletion: Posts are automatically removed after their expiration time.
User Profiles: Users have profiles with a username, display name, and profile picture.
Settings: Users can modify their display name and profile picture.
Real-time Updates: The application uses React and Supabase to provide a real-time experience.
Landing Page: A landing page introduces the concept of Vanish.
Technologies Used
React: A JavaScript library for building user interfaces.
TypeScript: A typed superset of JavaScript.
Vite: A build tool that provides a fast and optimized development experience.
Supabase: An open-source Firebase alternative that provides authentication, database, and real-time functionality.
Tailwind CSS: A utility-first CSS framework.
Framer Motion: A library for creating animations.
React Router: A standard library for routing in React applications.
React Scroll Parallax: Used for creating parallax scrolling effects on the landing page.
tsparticles: Used for creating particle effects on the landing page.
File Structure
Vanish/
├── .replit                   # Replit configuration file
├── .gitignore                # Specifies intentionally untracked files that Git should ignore
├── .env                      # Environment variables (Supabase URL and Key)
├── index.html                # Main HTML file
├── package.json              # Node.js package file
├── postcss.config.js         # PostCSS configuration file
├── README.md                 # Documentation file
├── eslint.config.js          # ESLint configuration file
├── src/
│   ├── App.tsx               # Main application component
│   ├── AuthContext.tsx       # Authentication context
│   ├── components/
│   │   ├── CreatePostModal.tsx # Modal for creating new posts
│   │   ├── PostList.tsx        # Component to display list of posts
│   │   ├── ProtectedRoute.tsx  # Component for protected routes
│   │   ├── SettingsModal.tsx   # Modal for user settings
│   │   ├── Sidebar.tsx         # Sidebar navigation component
│   │   └── Particles.tsx       # Particles animation component
│   ├── hooks/
│   │   ├── usePosts.ts         # Hook for managing posts data
│   │   └── useUserData.ts      # Hook for managing user data
│   ├── index.css             # Main CSS file
│   ├── main.tsx              # Entry point for the React application
│   ├── pages/
│   │   ├── Home.tsx            # Home page component
│   │   ├── Landing.tsx         # Landing page component
│   │   ├── Login.tsx           # Login page component
│   │   ├── Messages.tsx        # Messages page component
│   │   ├── Settings.tsx        # Settings page component
│   │   └── Signup.tsx          # Signup page component
│   ├── supabaseClient.ts     # Supabase client initialization
│   ├── types/
│   │   └── user.ts           # TypeScript type definition for user profile
│   └── vite-env.d.ts         # TypeScript definition file for Vite environment variables
├── tailwind.config.js        # Tailwind CSS configuration file
├── tsconfig.app.json         # TypeScript configuration file for the app
├── tsconfig.json             # Main TypeScript configuration file
├── tsconfig.node.json        # TypeScript configuration file for Node.js
└── vite.config.ts            # Vite configuration file
Key Components and Functionality
App.tsx (src/App.tsx): Sets up the React Router and defines the routes for the application. It wraps the application with AuthProvider and ParallaxProvider.
AuthContext.tsx (src/AuthContext.tsx): Manages user authentication state using React Context and Supabase Auth. It provides login, signup, and logout functions.
ProtectedRoute.tsx (src/components/ProtectedRoute.tsx): A component that protects routes, redirecting unauthenticated users to the login page.
Landing.tsx (src/pages/Landing.tsx): The landing page of the application, featuring animated text, parallax scrolling, and a description of Vanish.
Home.tsx (src/pages/Home.tsx): The main page for logged-in users, displaying posts and a sidebar for navigation.
PostList.tsx (src/components/PostList.tsx): Displays a list of posts, fetching data using the usePosts hook.
CreatePostModal.tsx (src/components/CreatePostModal.tsx): A modal for creating new posts, allowing users to set the expiration time.
SettingsModal.tsx (src/components/SettingsModal.tsx): A modal for user settings, allowing users to update their display name and profile picture.
usePosts.ts (src/hooks/usePosts.ts): A custom hook that fetches and manages posts data from Supabase.
useUserData.ts (src/hooks/useUserData.ts): A custom hook that fetches and manages user data from Supabase.
supabaseClient.ts (src/supabaseClient.ts): Initializes the Supabase client with the provided URL and API key.
Setup Instructions
Clone the repository:

Install dependencies:

Configure environment variables:

Create a .env file in the root directory.

Add your Supabase URL and API key:

Run the application:

The application will be available at http://localhost:5173.

Further Development
Implement the messages feature.
Add the ability to include images and other media in posts.
Implement user following and a personalized feed.
Add more settings options.
Improve the UI/UX.
This documentation provides a starting point. Remember to expand on each section with more specific details and instructions. Good luck!
