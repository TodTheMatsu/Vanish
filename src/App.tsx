import { motion } from 'framer-motion';
import Particles from './components/Particles';
interface NavLink {
  text: string;
}

interface Props {
  baseOpacity: number;
  text: string;
}

const AnimatedText = ({ baseOpacity, text }: Props) => {
  return (
    <>
      <h1 className='text-white text-9xl absolute select-none'>
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: -500 }}
            animate={{ opacity: baseOpacity - index * 0.15, y: 0 }}
            transition={{ duration: 2, delay: 1 }}
          >
            {char}
          </motion.span>
        ))}
      </h1>
      <motion.h1
        className='text-white blur-sm text-9xl select-none'
      >
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: baseOpacity - index * 0.05 }}
            transition={{
              delay: 2 + index * 0.15,
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

const AnimatedWords = ({ baseOpacity, text }: Props) => {
  return (
    <motion.h2 className='text-white text-4xl '>
      {text.split(" ").map((word, wordIndex) => (
        <motion.span
          key={wordIndex}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: baseOpacity, x: 0 }}
          transition={{ duration: 0.5, delay: 3 + wordIndex * 0.5 }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h2>
  );
};

const NavLinks = ({ navLinks }: { navLinks: NavLink[] }) => {
  return (
    <div
    className='top-5 absolute right-5'>
      <motion.div
        initial={{ opacity: 0, x: 100, width: '0%' }}
        animate={{ opacity: 1, x: 0, width: '100%' }}
        transition={{ delay:4, duration: 2, width: { delay: 6, duration: 1 } }}
      className='boxdesign flex-grow p-3 max-h-[4vh] flex flex-row items-center justify-center space-x-5 hover:border-white'>
        {navLinks.map((link, index) => (
          <motion.button
        initial={{ scale: 1, opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 7 + index * 0.5 } }}
        whileHover={{ scale: 1.15 }}
        key={index}
          >
        {link.text}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};


function App() {
  const text = "Vanish";
  const baseOpacity = 1;
  const navLinks = [{ text: 'About' }, { text: 'Sign Up' }, { text: 'Sign In' }];

  return (
    <>
    <Particles />
    <div className='bg-black h-screen w-screen flex items-center flex-col justify-center'>

      <NavLinks navLinks={navLinks} />

      <div className='rounded-full bg-white h-[20%] w-[20%] blur-[300px] top-0 absolute left-0'></div>

      <div className='flex items-center justify-center flex-col'>
        <AnimatedText baseOpacity={baseOpacity} text={text} />
      </div>

      <AnimatedWords baseOpacity={baseOpacity} text={"Post. Share. Vanish."} />

      <motion.button
        initial={{ scale: 1, opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 5 } }}
        whileHover={{ scale: 1.1, borderColor: 'white' }}
        className='boxdesign text-center my-5 flex flew-grow items-center justify-center px-5 py-2'
      >
        Explore
      </motion.button>

    </div>

    </>
  )
}

export default App;
