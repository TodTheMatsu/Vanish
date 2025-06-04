import { motion, AnimatePresence } from 'framer-motion';

interface CreatePostModalProps {
  show: boolean;
  newPost: string;
  expiresIn: number;
  onChange: (val: string) => void;
  onExpiresChange: (val: number) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function CreatePostModal({
  show,
  newPost,
  expiresIn,
  onChange,
  onExpiresChange,
  onSubmit,
  onClose,
}: CreatePostModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-neutral-900 rounded-xl p-6 max-w-2xl w-[90%] relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
              X
            </button>
            <h2 className="text-2xl text-white font-bold mb-4">Create Post</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
                onClose();
              }}
            >
              <textarea
                value={newPost}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-lg text-white resize-none focus:outline-none focus:border-blue-500 mb-4"
                placeholder="What's happening?"
                rows={4}
              />
              <div className="flex justify-between items-center">
                <select
                  value={expiresIn}
                  onChange={(e) => onExpiresChange(Number(e.target.value))}
                  className="bg-neutral-800 border border-neutral-700 rounded-md px-2 py-1 text-white"
                >
                  <option value={0}>0 seconds</option>
                  <option value={5 / 60}>5 minutes</option>
                  <option value={30 / 60}>30 minutes</option>
                  <option value={1}>1 hour</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                  <option value={72}>72 hours</option>
                  <option value={168}>1 week</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-blue-500 rounded-full font-bold hover:bg-blue-600 text-white"
                  type="submit"
                >
                  Post
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
