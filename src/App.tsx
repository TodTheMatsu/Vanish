import { motion } from 'framer-motion';
import { ParallaxProvider } from 'react-scroll-parallax';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';

interface NavLink {
  text: string;
}

interface NavLinksProps {
  navLinks: NavLink[];
}

const NavLinks = ({ navLinks }: NavLinksProps) => {
  return (
    <div className='absolute md:fixed top-[5%] right-[5%] md:right-[10%]'>
      <motion.div className='grow text-neutral-500 text-lg p-3 max-h-[4vh] flex flex-row items-center justify-center space-x-2 md:space-x-5 hover:border-white'>
        {navLinks.map((link, index) => (
          <motion.button
            initial={{ scale: 1, opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 5 + index * 0.5 } }}
            whileHover={{ scale: 1.15 }}
            key={index}
            className='hover:text-white cursor-pointer text-sm md:text-lg'
          >
            {link.text}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

function App() {
  const navLinks = [
    { text: 'About' },
    { text: 'Sign Up' },
    { text: 'Sign In' },
    { text: 'Contact' },
    { text: 'Privacy Policy' },
    { text: 'Terms of Service' },
  ];

  return (
    <BrowserRouter>
      <ParallaxProvider>

        <div className='bg-black min-h-screen overflow-x-hidden w-screen flex items-center flex-col justify-start'>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
          </Routes>
          <NavLinks navLinks={navLinks} />
        </div>
      </ParallaxProvider>
    </BrowserRouter>
  );
}

export default App;