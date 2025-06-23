import React from 'react';
import ReactDOM from 'react-dom';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-xs mx-4 shadow-2xl">
        {title && <div className="text-lg font-semibold mb-2 text-white">{title}</div>}
        <div className="mb-4 text-neutral-200">{message}</div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500 transition-colors"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
