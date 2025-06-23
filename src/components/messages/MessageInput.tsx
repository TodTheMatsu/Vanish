import React, { useState } from 'react';

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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 resize-none text-sm sm:text-base backdrop-blur-sm transition-all duration-200"
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              height: 'auto'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        </div>

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 sm:p-3 rounded-xl transition-all duration-200 ${
            showSettings 
              ? 'bg-white text-black shadow-lg' 
              : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white hover:border-neutral-600'
          }`}
          title="Message Settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-3 sm:px-4 py-2 sm:py-3 bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:cursor-not-allowed text-black disabled:text-neutral-500 rounded-xl transition-all duration-200 shadow-lg hover:shadow-white/25 disabled:shadow-none"
        >
          {disabled ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>

      {/* Current expiration display */}
      {!showSettings && (
        <div className="mt-2 text-xs sm:text-sm text-neutral-400 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Messages expire in {expirationOptions.find(o => o.value === expirationHours)?.label || '24 hours'}
        </div>
      )}
    </div>
  );
};
