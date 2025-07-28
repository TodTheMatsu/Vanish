import React, { useState, useRef } from 'react';
import { IoCloseOutline, IoTimeOutline, IoSendOutline } from 'react-icons/io5';
import { ImSpinner8 } from 'react-icons/im';

interface MessageInputProps {
  onSend: (content: string, expirationHours?: number) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "Type a message..."
}) => {
  const [message, setMessage] = useState('');
  const [expirationHours, setExpirationHours] = useState(24);
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim(), expirationHours);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const expirationOptions = [
    { value: 1, label: '1 hour' },
    { value: 6, label: '6 hours' },
    { value: 12, label: '12 hours' },
    { value: 24, label: '24 hours' },
    { value: 48, label: '2 days' },
    { value: 168, label: '1 week' }
  ];

  return (
    <div className="border-t border-neutral-800 p-3 sm:p-4 bg-neutral-900/80 backdrop-blur-sm">
      {/* Expiration Settings */}
      {showSettings && (
        <div className="mb-3 p-3 bg-neutral-800/50 border border-neutral-700 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-300">Message Expiration</span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-neutral-400 hover:text-white hover:bg-neutral-700 p-1 rounded-lg transition-all duration-200"
            >
              <IoCloseOutline className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {expirationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setExpirationHours(option.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  expirationHours === option.value
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex items-start space-x-2">
        {/* Settings Button */}
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0 ${
            showSettings 
              ? 'bg-white text-black shadow-lg' 
              : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white hover:border-neutral-600'
          }`}
          title="Message Settings"
        >
          <IoTimeOutline className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-3 sm:px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl
             text-white placeholder-neutral-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 resize-none text-sm sm:text-base
              backdrop-blur-sm transition-all duration-200 overflow-hidden"
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              height: '48px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = '48px';
              const newHeight = Math.min(Math.max(target.scrollHeight, 48), 120);
              target.style.height = newHeight + 'px';
            }}
            onFocus={() => {
              // Scroll input into view on mobile
              if (window.innerWidth < 768 && inputRef.current) {
                setTimeout(() => {
                  inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }
            }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="w-12 h-12 flex items-center justify-center bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:cursor-not-allowed text-black disabled:text-neutral-500 rounded-xl transition-all duration-200 shadow-lg hover:shadow-white/25 disabled:shadow-none flex-shrink-0"
        >
          {disabled ? (
            <ImSpinner8 className="w-5 h-5 animate-spin" />
          ) : (
            <IoSendOutline className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Current expiration display */}
      {!showSettings && (
        <div className="mt-2 text-xs sm:text-sm text-neutral-400 flex items-center">
          <IoTimeOutline className="w-3 h-3 mr-1" />
          Messages expire in {expirationOptions.find(o => o.value === expirationHours)?.label || '24 hours'}
        </div>
      )}
    </div>
  );
};
