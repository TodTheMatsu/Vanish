import { motion } from 'framer-motion';
import { ParallaxProvider } from 'react-scroll-parallax';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Settings from './pages/Settings';
function App() {
  return (
    <BrowserRouter>
      <ParallaxProvider>
        <div className='bg-black min-h-screen overflow-x-hidden w-screen flex items-center flex-col justify-start'>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/messages" element={<div className="min-h-screen bg-black text-white flex items-center justify-center">Messages coming soon...</div>} />
          </Routes>
        </div>
      </ParallaxProvider>
    </BrowserRouter>
  );
}

export default App;