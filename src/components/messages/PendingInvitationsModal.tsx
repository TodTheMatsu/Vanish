import React from 'react';
import { createPortal } from 'react-dom';
import { usePendingInvitations, useAcceptInvitation } from '../../hooks/useMessages';
import { IoMailOpenOutline } from 'react-icons/io5';
import { AnimatePresence, motion } from 'framer-motion';

interface PendingInvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PendingInvitationsModal: React.FC<PendingInvitationsModalProps> = ({ isOpen, onClose }) => {
  const { data: pendingInvitations, isLoading } = usePendingInvitations();
  const acceptInvitation = useAcceptInvitation();

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              className="absolute top-3 right-3 text-neutral-400 hover:text-white text-2xl"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex items-center justify-center mb-4">
              <IoMailOpenOutline className="text-3xl text-white mr-2" />
              <h2 className="text-2xl font-bold text-white">Pending Invitations</h2>
            </div>
            {isLoading ? (
              <div className="text-neutral-400 text-center">Loading...</div>
            ) : pendingInvitations && pendingInvitations.length > 0 ? (
              <div className="space-y-3">
                {pendingInvitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                    <span className="text-white font-medium">
                      {inv.name || inv.conversation_participants?.find(p => p.user)?.user?.display_name || 'Direct Message'}
                    </span>
                    <button
                      className="bg-white text-black px-4 py-1 rounded hover:bg-neutral-200 font-semibold disabled:opacity-60"
                      disabled={acceptInvitation.isPending}
                      onClick={() => acceptInvitation.mutate(inv.id)}
                    >
                      {acceptInvitation.isPending ? 'Accepting...' : 'Accept'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-neutral-400 text-center">No pending invitations.</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
