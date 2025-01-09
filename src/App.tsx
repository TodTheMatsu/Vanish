import { motion } from 'framer-motion'

function App() {
  const text = "Vanish"; 
  const baseOpacity = 1;
  const navLinks = [{text : 'About'}, {text : 'Sign Up'}, {text : 'Sign In'}];
  return (
    <div className='bg-black h-screen w-screen flex items-center flex-col justify-center'>
      <div className='top-5 absolute right-5'>
        <div className='boxdesign flex-grow p-3 flex flex-row items-center justify-center space-x-5'>
          {navLinks.map((link, index) => (
            <motion.button initial={{ scale: 1 }} whileHover={{ scale: 1.1 }} key={index}>{link.text}</motion.button>
          ))}
        </div>
      </div>
      <div className='rounded-full bg-white h-[20%] w-[20%] blur-[300px] top-0 absolute left-0'></div>
      <div className='flex items-center justify-center flex-col'>
        <h1 className='text-white text-9xl absolute'>
          {text.split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 1 }}
              animate={{ opacity: baseOpacity - index * 0.15 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              {char}
            </motion.span>
          ))}
        </h1>
        <h1 className='text-white blur-md text-9xl '>{text}</h1>
      </div>
      <h2 className='text-white text-4xl '>Post. Share. Vanish.</h2>
      <motion.button
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className='boxdesign text-center my-5 flex flew-grow items-center justify-center px-5 py-2'
      >
        Explore
      </motion.button>
    </div>
  )
}

export default App;
