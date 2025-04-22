import { motion } from 'framer-motion';
import Particles from './components/Particles';
import { ParallaxProvider } from 'react-scroll-parallax';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import HomePage from './components/HomePage';
import { IoMdArrowDown } from 'react-icons/io';
import { IconContext } from 'react-icons';
import Home from './components/Home';


interface NavLink {
  text: string;
}

interface AnimatedTextProps {
  baseOpacity: number;
  text: string;
}

const AnimatedText = ({ baseOpacity, text }: AnimatedTextProps) => {
  const textArray = text.split('');
  return (
    <>
      <h1 className='text-white font-bold text-9xl absolute select-none'>
        {textArray.map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: -500 }}
            animate={{ opacity: baseOpacity - index * 0.15, y: 0 }}
            transition={{ duration: 2, delay: 1 + index * 0.15 }}
          >
            {char}
          </motion.span>
        ))}
      </h1>
      <motion.h1 className='text-white font-bold blur-md text-9xl select-none'>
        {textArray.map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: baseOpacity - index * 0.15 }}
            transition={{
              delay: 2 + index * 0.3,
              duration: 1,
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.h1>
    </>
  );
};

const AnimatedWords = ({ baseOpacity, text }: AnimatedTextProps) => {
  return (
    <motion.h2 className='text-white text-4xl space-x-1'>
      {text.split(' ').map((word, wordIndex) => (
        <motion.span
          key={wordIndex}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.5, delay: 3 + wordIndex * 0.15 }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h2>
  );
};

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
  const text = 'Vanish';
  const baseOpacity = 1;
  const vanishDescription =
    'Vanish is a privacy-focused social media platform that gives you complete control over your digital footprint. Unlike traditional social networks that store your data indefinitely, Vanish automatically deletes your messages after a set period of time, ensuring your conversations remain private and temporary.';
  const [backgroundBlur, setBackgroundBlur] = useState(true);

  return (
    <BrowserRouter>
      <ParallaxProvider>
        <Particles />
        <motion.div
          className={`fixed w-screen h-screen`}
          initial={{ backdropFilter: 'blur(0.1em)' }}
          animate={{ backdropFilter: backgroundBlur ? 'blur(0em)' : 'blur(0.1em)' }}
          transition={{ duration: 2 }}
        ></motion.div>
        <div className='bg-black min-h-screen overflow-x-hidden w-screen flex items-center flex-col justify-start'>
          <Routes>
            <Route path="/" element={<Home baseOpacity={baseOpacity} text={text} vanishDescription={vanishDescription} navLinks={navLinks} backgroundBlur={backgroundBlur} setBackgroundBlur={setBackgroundBlur}/>} />
            <Route path="/home" element={<HomePage />} />
          </Routes>
          <NavLinks navLinks={navLinks} />
        </div>
      </ParallaxProvider>
    </BrowserRouter>
  );
}

export default App;