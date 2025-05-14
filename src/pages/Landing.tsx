import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowDown } from 'react-icons/io';
import { IconContext } from 'react-icons';
import {IoMdTimer, IoMdLock, IoMdEye, IoMdPeople, IoMdTrash, IoMdPhonePortrait} from 'react-icons/io';
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
      <motion.div className='grow text-neutral-500 z-10 text-lg p-3 max-h-[4vh] flex flex-row items-center justify-center space-x-2 md:space-x-5 hover:border-white'>
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
    <>
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
  </>);
};

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const text = 'Vanish';
  const baseOpacity = 1;
  const vanishDescription = 'Vanish is a privacy-focused social media platform that gives you complete control over your digital footprint. Unlike traditional social networks that store your data indefinitely, Vanish automatically deletes your messages after a set period of time, ensuring your conversations remain private and temporary.';

  const navLinks = [
    { text: 'Home' },
    { text: 'Sign Up' },
    { text: 'Sign In' },
    { text: 'Contact' },
    { text: 'Privacy Policy' },
    { text: 'Terms of Service' },
  ];

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <title>Vanish: Privacy-Focused Social Media</title>
      <meta name="description" content={vanishDescription} />
      <Particles />
      <div className='flex items-center h-screen justify-center flex-col'>
        <div className='flex items-center justify-center flex-col'>
          <AnimatedText baseOpacity={baseOpacity} text={text} />
        </div>

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
          className='cursor-pointer'
          onClick={scrollToAbout}
        >
          <IconContext.Provider value={{ size: '2em', className: 'animate-bounce fill-neutral-500 hover:fill-white' }}>
            <IoMdArrowDown />
          </IconContext.Provider>
        </motion.button>
      </div>
      <div id="about-section" className='flex text-white items-center w-screen h-screen justify-center flex-col'>
        <motion.h3 
            initial={{ opacity: 0, y: -50 }}
            viewport={{ once: true }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: { duration: 1.5, stiffness: 100 },
            }}
          className='p-6 text-4xl z-10  font-bold'>What is Vanish?</motion.h3>
        <p className=' text-center z-10  font-light text-xl  w-[80%] md:w-1/2 mx-auto'>
          {vanishDescription.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className=''
              transition={{ duration: 0.05, delay: index * 0.005 +1  }}
            >
              {char}
            </motion.span>
          ))}
        </p>
        <motion.img 
        initial={{ opacity: 0, y: 50 , borderWidth: '2px' }}
        viewport={{ once: true }}
        whileInView={{
          opacity: 1,
          y: 0,
          transition: {delay: 1.2 ,duration: 1.5},
        }}
        src='https://i.postimg.cc/BQCk6Z8v/vanishapp-Preview.png' className='scale-70 rounded-3xl mask-b-from-70% '/>
      </div>
      <div className='flex text-white items-center w-screen h-screen justify-center flex-col'>
        <motion.div
        initial={{ opacity: 0}}
        whileInView={{
          opacity: 1,
          transition: {delay: 0.5, duration: 1.5},
        }}
        viewport={{ once: true }}
        className='flex text-white bg-white/10 backdrop-blur-xs items-center w-[80%] rounded-2xl py-40 justify-center flex-col'>
          <motion.h3
          initial={{ opacity: 0, y: -50 }}
          viewport={{ once: true }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { delay: 0.5,duration: 1.5, stiffness: 100 },
          }}
        className='p-6 text-5xl font-bold'>Key Features</motion.h3>
          <h4
          className='text-center text-2xl font-light w-[80%] md:w-1/2 mx-auto'>
        {'Designed with your privacy and security as the top priority.'.split('').map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.05, delay: index * 0.01+1 }}
          >
            {char}
          </motion.span>
        ))}
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 p-6'>
          {[
            {
          title: 'Timed Messages',
          description:
          'Set custom expiration times for your messages, from seconds to days. Once the timer expires, your message is permanently deleted from all devices.',
          icon: <IoMdTimer size={30} className="mb-2" />,
            },
            {
          title: 'End-to-End Encryption',
          description:
          'All messages are encrypted from the moment they leave your device until they reach the recipient. Not even Vanish can read your private conversations.',
          icon: <IoMdLock size={30} className="mb-2 " />,
            },
            {
          title: 'Screenshot Detection',
          description:
          'Get notified immediately when someone takes a screenshot of your messages, giving you complete awareness of how your content is being saved.',
          icon: <IoMdEye size={30} className="mb-2" />,
            },
            {
          title: 'Secure Group Chats',
          description:
          'Create temporary group conversations that automatically dissolve after a set period, perfect for event planning or time-sensitive discussions.',
          icon: <IoMdPeople size={30} className="mb-2 " />,
            },
            {
          title: 'No Data Storage',
          description:
          "Unlike other platforms, we don't store your messages on our servers after they expire. When it's gone, it's truly gone.",
          icon: <IoMdTrash size={30} className="mb-2" />,
            },
            {
          title: 'Cross-Platform',
          description:
          'Available on iOS, Android, and web browsers, allowing you to communicate securely no matter which device you\'re using.',
          icon: <IoMdPhonePortrait size={30} className="mb-2" />,
            },
          ].map((feature, featureIndex) => (
            <motion.div
          key={featureIndex}
          className=' p-6 py-10 rounded-lg flex flex-col items-center text-center'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1 + featureIndex * 0.1 }}
            >
          {feature.icon}
          <h5 className='text-2xl font-semibold mb-2'>
          {feature.title.split('').map((char, index) => (
            <motion.span
          key={index}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.05, delay: 1.5 + featureIndex * 0.2 + index * 0.01 }}
            >
          {char}
            </motion.span>
          ))}
          </h5>
          <p className='text-neutral-300 text-xl'>
          {feature.description.split('').map((char, index) => (
            <motion.span
          key={index}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.05,
            delay: 1.5 + featureIndex * 0.2 + feature.title.length * 0.01 + index * 0.005,
          }}
            >
          {char}
            </motion.span>
          ))}
          </p>
            </motion.div>
          ))}
        </div>
        </motion.div>
      </div>
      <NavLinks navLinks={navLinks} />
    </>
  );
}
