import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';

interface CreatePostModalProps {
  show: boolean;
  newPost: string;
  expiresIn: number;
  onChange: (val: string) => void;
  onExpiresChange: (val: number) => void;
  onSubmit: (image?: File) => Promise<void>;
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasteMessage, setShowPasteMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_POST_LENGTH = 280;
  const isTooLong = newPost.length > MAX_POST_LENGTH;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    // Check if clipboard contains images
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          // Clear file input if it has a value
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          // Convert blob to File with a proper name
          const imageFile = new File([file], `pasted-image-${Date.now()}.png`, { type: file.type });
          processImageFile(imageFile);
          
          // Show success message
          setShowPasteMessage(true);
          setTimeout(() => setShowPasteMessage(false), 2000);
        }
        break; // Only process the first image
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!isTooLong && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onSubmit(selectedImage || undefined);
        // Reset state
        setSelectedImage(null);
        setImagePreview(null);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
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
            onPaste={handlePaste}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
              X
            </button>
            <h2 className="text-2xl text-white font-normal mb-4">Create Post</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isTooLong && !isSubmitting) {
                  handleSubmit();
                  onClose();
                }
              }}
              onPaste={handlePaste}
            >
              <textarea
                value={newPost}
                onChange={(e) => onChange(e.target.value)}
                onPaste={handlePaste}
                className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-lg text-white resize-none focus:outline-none focus:border-blue-500 mb-4"
                placeholder="What's happening? (You can also paste images directly!)"
                rows={4}
              />
              
              {/* Image Upload Section */}
              <div className="mb-4">
                <label className="block text-sm text-neutral-400 mb-2">Add an image (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
                <p className="text-xs text-neutral-500 mt-1">Or paste an image directly from your clipboard!</p>
                
                {showPasteMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-green-400 mt-2"
                  >
                    ✓ Image pasted from clipboard!
                  </motion.div>
                )}
                
                {imagePreview && (
                  <div className="mt-4 relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-full max-h-64 rounded-lg object-cover" 
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {isTooLong && (
                <div className="text-red-500 text-sm mb-2">Post is too long! Maximum {MAX_POST_LENGTH} characters allowed.</div>
              )}
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
                  whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                  className={`px-6 py-2 bg-blue-500 rounded-full font-bold hover:bg-blue-600 text-white ${isTooLong || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  type="submit"
                  disabled={isTooLong || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
