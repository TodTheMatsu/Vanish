import { motion } from 'framer-motion';
import Particles from './components/Particles';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { useState } from 'react';
import { IoMdArrowDown } from 'react-icons/io';
import { IconContext } from 'react-icons';

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
    <div className='top-[5%] fixed right-[10%]'>
      <motion.div className='flex-grow text-neutral-500 text-md p-3 max-h-[4vh] flex flex-row items-center justify-center space-x-5 hover:border-white'>
        {navLinks.map((link, index) => (
          <motion.button
            initial={{ scale: 1, opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 5 + index * 0.5 } }}
            whileHover={{ scale: 1.15 }}
            key={index}
            className='hover:text-white'
          >
            {link.text}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

function App() {
  const text = 'Vanish';
  const baseOpacity = 1;
  const navLinks = [
    { text: 'About' },
    { text: 'Sign Up' },
    { text: 'Sign In' },
    { text: 'Contact' },
    { text: 'Privacy Policy' },
    { text: 'Terms of Service' },
  ];
  const vanishDescription =
    'Vanish is a privacy-focused social media platform that gives you complete control over your digital footprint. Unlike traditional social networks that store your data indefinitely, Vanish automatically deletes your messages after a set period of time, ensuring your conversations remain private and temporary.';
  const [backgroundBlur, setBackgroundBlur] = useState(true);

  return (
    <ParallaxProvider>
      <Particles />
      <motion.div
        className={`fixed w-screen h-screen`}
        initial={{ backdropFilter: 'blur(0em)' }}
        animate={{ backdropFilter: backgroundBlur ? 'blur(0.1em)' : 'blur(0em)' }}
        transition={{ duration: 2 }}
      ></motion.div>
      <div className='bg-black h-[400vh] overflow-x-hidden w-screen flex items-center flex-col justify-start'>
        <Parallax
          shouldAlwaysCompleteAnimation={true}
          opacity={[1, 0]}
          translateY={['0%', '100%']}
          easing='easeIn'
          speed={1000}
          startScroll={0}
          endScroll={1000}
          scale={[1, 0]}
          onProgressChange={(progress) => {
            setBackgroundBlur(progress < 0.2);
          }}
        >
          <div className='flex items-center h-screen justify-center flex-col'>
            <div className='flex items-center justify-center flex-col'>
              <AnimatedText baseOpacity={baseOpacity} text={text} />
            </div>
            <AnimatedWords baseOpacity={baseOpacity} text={'Post.  Share.  Vanish.'} />
            <motion.button
              initial={{ scale: 1, opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 4.5, duration: 1 } }}
              whileHover={{ scale: 1.1, borderColor: 'white' }}
              className='boxdesign hover:text-black  hover:backdrop-opacity-100 hover:bg-white text-center my-5 flex flew-grow items-center justify-center px-5 py-2'
            >
              Explore
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: -50 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 5, duration: 1.5, type: 'spring', stiffness: 100 },
              }}
            >
              <IconContext.Provider value={{ size: '2em', className: 'animate-bounce fill-neutral-500 hover:fill-white' }}>
                <IoMdArrowDown />
              </IconContext.Provider>
            </motion.button>
          </div>
        </Parallax>

        <div className='flex fixed items-center w-screen h-screen justify-center pointer-events-none flex-col'>
          <Parallax
            shouldAlwaysCompleteAnimation={true}
            opacity={[0, 1]}
            startScroll={500}
            endScroll={2000}
            translateX={['120%', '0%']}
          >
            <h3 className='text-white p-6 text-4xl font-bold'>What is Vanish?</h3>
          </Parallax>
          <Parallax
            shouldAlwaysCompleteAnimation={true}
            opacity={[0, 1]}
            startScroll={500}
            endScroll={2000}
            scale={[0, 1]}
            translateY={['200%', '0%']}
          >
            <p className='text-white text-center font-light text-xl w-1/2 mx-auto'>{vanishDescription}</p>
          </Parallax>
          <Parallax shouldAlwaysCompleteAnimation={true} opacity={[0, 1]} startScroll={1900} endScroll={2200}>
            <div className='w-screen my-[5%] h-[50%] flex items-center justify-center'>
              <div className='w-[15%] h-full bg-white bg-opacity-5 rounded-lg shadow-lg m-5'>
                <h3 className='text-white text-center text-2xl my-[5%] font-semibold'>For Personal Use</h3>
                <p className='text-white text-center px-[10%] font-light text-xl'>
                  Share moments, thoughts, and messages without worrying about them coming back years later. Perfect for private
                  conversations that should remain private.
                </p>
              </div>
              <div className='w-[15%] h-full bg-white bg-opacity-5 rounded-lg shadow-lg m-5'>
                <h3 className='text-white text-center text-2xl my-[5%] font-semibold'>For Business Use</h3>
                <p className='text-white text-center px-[10%] font-light text-xl'>
                  Discuss sensitive information, share temporary credentials, or collaborate on confidential projects with the assurance
                  that your data won't persist indefinitely.
                </p>
              </div>
            </div>
          </Parallax>
        </div>

        <NavLinks navLinks={navLinks} />
      </div>
    </ParallaxProvider>
  );
}

export default App;
