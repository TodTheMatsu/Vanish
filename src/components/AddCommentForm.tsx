import { useState } from 'react';
import { motion } from 'framer-motion';

interface AddCommentFormProps {
  onSubmit: (content: string, parentCommentId?: number) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  isSubmitting?: boolean;
  autoFocus?: boolean;
  parentCommentId?: number;
}

export function AddCommentForm({
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  isSubmitting = false,
  autoFocus = false,
  parentCommentId,
}: AddCommentFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      await onSubmit(content.trim(), parentCommentId);
      setContent('');
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="mt-3"
    >
      <div className="flex space-x-3">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSubmitting}
            autoFocus={autoFocus}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 resize-none focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={parentCommentId ? 2 : 3}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-neutral-500">
              {content.length}/500
            </span>
            <div className="flex space-x-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-3 py-1 text-xs text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              <motion.button
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-4 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : parentCommentId ? 'Reply' : 'Comment'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
