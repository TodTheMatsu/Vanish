import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowDown } from 'react-icons/io';
import { IconContext } from 'react-icons';
import { Parallax } from 'react-scroll-parallax';
import Particles from '../components/Particles';
import { useAuth } from '../AuthContext';

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
            animate={{ opacity: 1, transition: { delay: 4 + index * 0.2 } }}
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

interface AnimatedTextProps {
  baseOpacity: number;
  text: string;
}

const AnimatedText = ({ baseOpacity, text }: AnimatedTextProps) => {
  const textArray = text.split('');
  return (
    <>
      <motion.div
        className="fixed w-screen h-screen"
        initial={{ backdropFilter: 'blur(0.1em)' }}
        animate={{ backdropFilter: 'blur(0em)' }}
        transition={{ duration: 2 }}
      ></motion.div>
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

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const text = 'Vanish';
  const baseOpacity = 1;
  const vanishDescription = 'Vanish is a privacy-focused social media platform that gives you complete control over your digital footprint. Unlike traditional social networks that store your data indefinitely, Vanish automatically deletes your messages after a set period of time, ensuring your conversations remain private and temporary.';

  const navLinks = [
    { text: 'About' },
    { text: 'Sign Up' },
    { text: 'Sign In' },
    { text: 'Contact' },
    { text: 'Privacy Policy' },
    { text: 'Terms of Service' },
  ];

  return (
    <>
      <Particles />
      <div className='flex items-center h-screen justify-center flex-col'>
        <div className='flex items-center justify-center flex-col'>
          <AnimatedText baseOpacity={baseOpacity} text={text} />
        </div>
        <NavLinks navLinks={navLinks} />
        <AnimatedWords baseOpacity={baseOpacity} text={'Post.  Share.  Vanish.'} />
        <motion.button
          initial={{ scale: 1, opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 4.5, duration: 1 } }}
          whileHover={{ scale: 1.1, borderColor: 'white' }}
          className='boxdesign hover:text-black cursor-pointer hover:backdrop-opacity-100 hover:bg-white text-center my-5 flex flew-grow items-center justify-center px-5 py-2'
          onClick={() => {
            if (isAuthenticated) {
              navigate('/home');
            } else {
              navigate('/login');
            }
          }}
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
      <div className='flex items-center w-screen h-screen justify-center pointer-events-none flex-col'>
        <Parallax opacity={[0, 1]} startScroll={0} endScroll={1000} translateX={['120%', '0%']}>
          <h3 className='text-white p-6 text-4xl font-bold'>What is Vanish?</h3>
        </Parallax>
        <Parallax opacity={[0, 1]} startScroll={0} endScroll={1000} scale={[0, 1]} translateY={['200%', '0%']}>
          <p className='text-white text-center text-white font-light text-xl w-[80%] md:w-1/2 mx-auto'>
            {vanishDescription.split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                 viewport={{ once: true }}
                transition={{ duration: 0.025, delay: index * 0.01 }}
              >
                {char}
              </motion.span>
            ))}
          </p>
        </Parallax>
      </div>
    </>
  );
}
