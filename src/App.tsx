import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile'; // import the profile page
import Messages from './pages/Messages'; // import the messages page
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <div className='bg-black min-h-screen overflow-x-hidden w-screen flex items-center flex-col justify-start'>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
                <Route path="/messages/:conversationId" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
                {/* Add the route for the profile page */}
                <Route path="/profile/:username" element={<Profile />} />
              </Routes>
            </div>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;