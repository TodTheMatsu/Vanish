import { motion } from 'framer-motion';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile'; // import the profile page
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
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
                  <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                    <p>Messages coming soon...</p>
                    <Link to="/home">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 p-2 bg-blue-500 text-white rounded"
                      >
                        Go Home
                      </motion.button>
                    </Link>
                  </div>
                </ProtectedRoute>
              } />
              {/* Add the route for the profile page */}
              <Route path="/profile/:username" element={<Profile />} />
            </Routes>
          </div>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;