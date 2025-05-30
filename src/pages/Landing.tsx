import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { IoMdArrowDown, IoMdCheckmark, IoMdStar } from 'react-icons/io';
import { IconContext } from 'react-icons';
import {IoMdTimer, IoMdLock, IoMdEye, IoMdPeople, IoMdTrash, IoMdPhonePortrait, IoMdQuote} from 'react-icons/io';
import Particles from '../components/Particles';
import { useAuth } from '../AuthContext';

interface NavLink {
  text: string;
  action?: () => void;
}

interface NavLinksProps {
  navLinks: NavLink[];
}

const NavLinks = ({ navLinks }: NavLinksProps) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='fixed top-[5%] z-50 right-[5%] md:right-[10%]'>
      <motion.div 
        className='text-neutral-400 text-sm md:text-base p-2 md:p-3 rounded-2xl flex flex-row items-center justify-center space-x-2 md:space-x-4 border border-transparent hover:border-white/20'
        animate={{
          backgroundColor: scrollY > 0 ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0)',
          backdropFilter: scrollY > 0 ? 'blur(20px)' : 'blur(0px)',
          borderColor: scrollY > 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0)'
        }}
        transition={{
          duration: 0.4,
          ease: 'easeInOut'
        }}
      >
        {navLinks.map((link, index) => (
          <motion.button
            initial={{ scale: 1, opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 4 + index * 0.1 } }}
            whileHover={{ scale: 1.05, color: '#ffffff' }}
            whileTap={{ scale: 0.95 }}
            key={index}
            className='hover:text-white cursor-pointer transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-white/10'
            onClick={link.action}
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
        className="fixed w-screen h-[200%]"
        initial={{ backdropFilter: 'blur(0.5em)' }}
        animate={{ backdropFilter: 'blur(0em)' }}
        transition={{delay:2, duration: 2 }}
      ></motion.div>
      <h1 className='text-white font-bold text-6xl sm:text-7xl md:text-8xl lg:text-9xl absolute select-none'>
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
      <motion.h1 className='text-white font-bold blur-md text-6xl sm:text-7xl md:text-8xl lg:text-9xl select-none'>
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
    <motion.h2 className='text-white text-2xl md:text-3xl lg:text-4xl space-x-1'>
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

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { text: 'About', action: () => scrollToSection('about-section') },
    { text: 'Features', action: () => scrollToSection('features-section') },
    { text: 'Pricing', action: () => scrollToSection('pricing-section') },
    { text: 'Sign In', action: () => navigate('/login') },
  ];

  const scrollToAbout = () => {
    scrollToSection('about-section');
  };

  return (
    <>
      <title>Vanish: Privacy-Focused Social Media</title>
      <meta name="description" content={vanishDescription} />
      <Particles />
      {/* Hero Section */}
      <div className='flex items-center h-screen justify-center flex-col relative overflow-hidden'>
        <div className='flex items-center justify-center flex-col z-10'>
          <AnimatedText baseOpacity={baseOpacity} text={text} />
        </div>

        <AnimatedWords baseOpacity={baseOpacity} text={'Post.  Share.  Vanish.'} />
        
        {/* Enhanced tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 4, duration: 1 }}
          className='text-neutral-300 text-lg md:text-xl text-center max-w-2xl mx-auto px-4 mt-4 mb-8'
        >
          Your privacy matters. Experience social media that respects your digital footprint.
        </motion.p>

        {/* Enhanced CTA buttons */}
        <div className='flex flex-col sm:flex-row gap-4 items-center z-20 relative'>
          <motion.button
            initial={{ scale: 1, opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 4.5, duration: 1 } }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 1)' }}
            whileTap={{ scale: 0.95 }}
            className='bg-white text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300 text-lg cursor-pointer z-20'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isAuthenticated) {
                navigate('/home');
              } else {
                navigate('/login');
              }
            }}
          >
            Get Started Free
          </motion.button>
          
          <motion.button
            initial={{ scale: 1, opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 4.7, duration: 1 } }}
            whileHover={{ scale: 1.05, borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            className='border border-neutral-400 text-white px-8 py-3 rounded-full hover:border-white transition-all duration-300 text-lg backdrop-blur-sm cursor-pointer z-20'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollToSection('about-section');
            }}
          >
            Learn More
          </motion.button>
        </div>

        <motion.button
          initial={{ opacity: 0, y: -50 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: 5.5, duration: 1.5, type: 'spring', stiffness: 100 },
          }}
          className='cursor-pointer mt-12 z-20 relative'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            scrollToAbout();
          }}
        >
          <IconContext.Provider value={{ size: '2.5em', className: 'animate-bounce fill-neutral-400 hover:fill-white transition-colors duration-300' }}>
            <IoMdArrowDown />
          </IconContext.Provider>
        </motion.button>

        {/* Gradient overlay for better text readability */}
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none z-0' />
      </div>
      {/* About Vanish Section */}
      <div id="about-section" className='flex text-white items-center w-screen h-screen justify-center flex-col px-4 sm:px-0'>
        <motion.h3 
            initial={{ opacity: 0, y: -50 }}
            viewport={{ once: true }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: { duration: 1.5, stiffness: 100 },
            }}
          className='p-6 text-3xl md:text-4xl z-10 font-bold'>What is Vanish?</motion.h3>
        <p className=' text-center z-10 font-light text-lg md:text-xl w-[90%] sm:w-[80%] md:w-1/2 mx-auto'>
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
        src='https://i.postimg.cc/BQCk6Z8v/vanishapp-Preview.png' className='scale-50 sm:scale-70 rounded-3xl mask-b-from-70% '/>
      </div>
      {/* Key Features Section */}
      <div id="features-section" className='flex text-white items-center w-screen justify-center flex-col px-4 sm:px-0 py-20'>
        <motion.div
        initial={{ opacity: 0}}
        whileInView={{
          opacity: 1,
          transition: {delay: 0.3, duration: 1.5},
        }}
        viewport={{ once: true }}
        className='flex text-white bg-gradient-to-br from-zinc-900 to-black backdrop-blur-sm items-center w-full max-w-7xl rounded-3xl py-20 md:py-32 justify-center flex-col shadow-2xl border border-white/10'>
          <motion.h3
          initial={{ opacity: 0, y: -50 }}
          viewport={{ once: true }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { delay: 0.5,duration: 1.5, stiffness: 100 },
          }}
        className='p-6 text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent'>Key Features</motion.h3>
          <motion.h4
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { delay: 0.7, duration: 1 },
          }}
          className='text-center text-xl md:text-2xl font-light w-[90%] sm:w-[80%] md:w-1/2 mx-auto text-neutral-300 mb-12'>
            Designed with your privacy and security as the top priority.
          </motion.h4>
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
          className='bg-gradient-to-br from-white/5 to-white/10 p-8 py-12 rounded-2xl flex flex-col items-center text-center backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl'
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 + featureIndex * 0.1 }}
          whileHover={{ y: -5 }}
            >
          <div className='text-white mb-4 p-3 rounded-full bg-gradient-to-br from-white/10 to-white/5'>
            {feature.icon}
          </div>
          <h5 className='text-2xl font-bold mb-4 text-white'>
            {feature.title}
          </h5>
          <p className='text-neutral-300 text-base md:text-lg leading-relaxed'>
            {feature.description}
          </p>
            </motion.div>
          ))}
        </div>
        </motion.div>
      </div>

      {/* Pricing Section */}
      <div id="pricing-section" className='flex text-white items-center w-screen justify-center flex-col px-4 sm:px-0 py-20 bg-gradient-to-b from-transparent to-black/20'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className='text-center mb-16 z-10'
        >
          <h3 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent'>
            Simple Pricing
          </h3>
          <p className='text-xl md:text-2xl text-neutral-300 max-w-2xl mx-auto'>
            Choose the plan that works best for you. All plans include our core privacy features.
          </p>
        </motion.div>

        <div className='grid z-10 grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full'>
          {[
            {
              name: 'Free',
              price: '$0',
              period: 'forever',
              description: 'Perfect for getting started with private messaging',
              features: [
                'Up to 500 messages per day',
                'Basic timed messages (1 hour max)',
                'End-to-end encryption',
                'Screenshot detection',
                'Cross-platform access'
              ],
              popular: false,
              cta: 'Get Started Free'
            },
            {
              name: 'Pro',
              price: '$9.99',
              period: 'per month',
              description: 'For power users who need more control and features',
              features: [
                'Unlimited messages',
                'Custom timer settings (up to 30 days)',
                'Priority support',
                'Advanced group features',
                'Message scheduling',
                'Custom themes'
              ],
              popular: true,
              cta: 'Start Free Trial'
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: 'contact us',
              description: 'For organizations with advanced security needs',
              features: [
                'Everything in Pro',
                'Advanced admin controls',
                'Custom retention policies',
                'SSO integration',
                'Dedicated support',
                'Custom deployment'
              ],
              popular: false,
              cta: 'Contact Sales'
            }
          ].map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className={`relative p-8 rounded-3xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'bg-gradient-to-br from-white/15 to-white/5 border-white/30 shadow-2xl' 
                  : 'bg-gradient-to-br from-white/5 to-white/10 border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold'>
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className='text-center mb-8'>
                <h4 className='text-2xl font-bold mb-2'>{plan.name}</h4>
                <div className='mb-4'>
                  <span className='text-4xl md:text-5xl font-bold'>{plan.price}</span>
                  <span className='text-neutral-400 ml-2'>/{plan.period}</span>
                </div>
                <p className='text-neutral-300'>{plan.description}</p>
              </div>

              <ul className='space-y-4 mb-8'>
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className='flex items-center'>
                    <IoMdCheckmark className='text-green-400 mr-3 flex-shrink-0' size={20} />
                    <span className='text-neutral-200'>{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (plan.name === 'Enterprise') {
                    // Handle enterprise contact
                    window.location.href = 'mailto:sales@vanish.app';
                  } else {
                    navigate('/login');
                  }
                }}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Navigation Links */}
      <NavLinks navLinks={navLinks} />
    </>
  );
}
