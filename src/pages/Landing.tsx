import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { IoMdArrowDown, IoMdCheckmark } from 'react-icons/io';
import { IconContext } from 'react-icons';
import {IoMdTimer, IoMdLock, IoMdEye, IoMdPeople, IoMdTrash, IoMdPhonePortrait} from 'react-icons/io';
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
    <div className='fixed top-[1%] md:top-[5%] z-50 md:right-[10%]'>
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
      <h1 className='text-white font-bold text-[7rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[14rem] absolute select-none leading-none'>
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
      <motion.h1 className='text-white font-bold blur-md text-[7rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[14rem] select-none leading-none'>
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

const AnimatedWords = ({text}: AnimatedTextProps) => {
  return (
    <>
      <motion.h2 className="text-white text-2xl md:text-3xl lg:text-4xl space-x-1 font-bold">
        {text.split(' ').map((word, wordIndex) => {
          return (
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 3 + wordIndex * 0.5 }}
              className="inline-block mr-2 relative overflow-hidden whitespace-nowrap drop-shadow-[0_0_32px_white]"
            >
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: 'auto' }}
                transition={{ duration: 0.5, delay: 3 + wordIndex * 0.5 }}
                className="inline-block pr-1 relative"
              >
                {word}
              </motion.span>
            </motion.span>
          );
        })}
      </motion.h2>
    </>);
};

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
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

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <>
      <title>Vanish: Privacy-Focused Social Media</title>
      <meta name="description" content={vanishDescription} />
      <Particles />
      {/* Hero Section */}
      <div className='flex items-center w-screen h-screen justify-center flex-col relative overflow-hidden'>
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
        <p className=' text-center pb-10 z-10 font-light text-lg md:text-xl w-[90%] sm:w-[80%] md:w-1/2 mx-auto'>
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
        src='https://i.postimg.cc/BQCk6Z8v/vanishapp-Preview.png' className='scale-100 sm:scale-70 rounded-3xl mask-b-from-70% '/>
      </div>
      {/* Key Features Section - Redesigned */}
      <section id="features-section" className="w-full flex flex-col items-center justify-center py-20 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-7xl w-full flex flex-col z-10 items-center"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-center bg-gradient-to-r from-white to-neutral-300 bg-clip-text">
            Why Choose Vanish?
          </h2>
          <p className="text-lg md:text-xl text-neutral-300 mb-10 text-center max-w-2xl">
            Discover the core features that make Vanish the most secure and private way to connect online.
          </p>
          <div className="w-full overflow-x-auto pb-4">
            <div
              className="flex flex-col gap-6 sm:flex-row sm:overflow-x-auto sm:pb-4 md:grid md:grid-cols-3 md:grid-rows-2 md:gap-8 md:min-w-0 overflow-hidden"
            >
              {[ 
                {
                  title: 'Timed Messages',
                  description: 'Set custom expiration times for your messages. When the timer ends, your message is gone for good.',
                  icon: <IoMdTimer size={48} className="mb-4 text-blue-400" />,
                },
                {
                  title: 'End-to-End Encryption',
                  description: 'Your messages are encrypted from sender to receiver. Only you and your recipient can read them.',
                  icon: <IoMdLock size={48} className="mb-4 text-purple-400" />,
                },
                {
                  title: 'Secure Group Chats',
                  description: 'Create temporary group conversations that dissolve after a set period. Perfect for events and private discussions.',
                  icon: <IoMdPeople size={48} className="mb-4 text-green-400" />,
                },
                {
                  title: 'Cross-Platform',
                  description: 'Use Vanish on iOS, Android, and web browsers. Stay secure and private on any device.',
                  icon: <IoMdPhonePortrait size={48} className="mb-4 text-yellow-400" />,
                },
                {
                  title: 'Privacy First',
                  description: 'We do not collect or sell your personal data. Your activity stays private—always.',
                  icon: <IoMdEye size={48} className="mb-4 text-pink-400" />,
                  gridClass: 'md:col-span-1 md:row-span-1', // Wide bento block
                },
                {
                  title: 'Posts that Disappear',
                  description: 'Share photos and videos that automatically delete after viewing. Perfect for sharing without the worry of permanence.',
                  icon: <IoMdTrash size={48} className="mb-4 text-red-400" />,
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 + idx * 0.15 }}
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
                  className={`flex-shrink-0 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center min-w-[80vw] sm:min-w-[280px] md:min-w-0 hover:border-white/20 transition-all duration-300`}
                >
                  <div>{feature.icon}</div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-neutral-300 text-base md:text-lg leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <div id="pricing-section" className='flex text-white items-center w-screen justify-center flex-col px-4 sm:px-0 py-20 bg-gradient-to-b from-transparent to-black/20'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className='text-center mb-16 z-10'
        >
          <h3 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-300 h-20 bg-clip-text text-transparent'>
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
