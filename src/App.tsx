import { GlowCapture, Glow } from '@codaworks/react-glow'
import {motion} from 'framer-motion'

function App() {


  return (
    <GlowCapture>
      <div className='bg-black h-screen w-screen flex items-center flex-col justify-center'>
        <div></div>
        <div className=' flex items-center justify-center flex-col'>
          <h1 className='text-white text-9xl absolute'>Vanish</h1>
          <h1 className='text-white blur-md text-9xl '>Vanish</h1>
        </div>
        <h2 className='text-white text-4xl '>Post. Share. Vanish.</h2>
        <Glow>
        <button className='boxdesign text-center my-5 flex flew-grow items-center justify-center px-5 py-1'>Explore</button>
        </Glow>
      </div>
    </GlowCapture>
  )
}

export default App
