import React from 'react';
import { createPortal } from 'react-dom';
import { usePendingInvitations, useAcceptInvitation } from '../../hooks/useMessages';
import { IoMailOpenOutline } from 'react-icons/io5';
import { AnimatePresence, motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';

interface PendingInvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PendingInvitationsModal: React.FC<PendingInvitationsModalProps> = ({ isOpen, onClose }) => {
  const { data: pendingInvitations, isLoading, refetch, isFetching } = usePendingInvitations();
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
            <div className="flex justify-center mb-3">
              <button
              className="bg-neutral-800 text-white px-3 py-1 rounded hover:bg-neutral-700 font-medium text-sm disabled:opacity-60 flex items-center gap-2"
              onClick={() => refetch()}
              disabled={isFetching}
              >
              <FiRefreshCw
                className={`text-lg ${isFetching ? 'animate-spin' : ''}`}
              />
              {isFetching ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {isLoading ? (
              <div className="text-neutral-400 text-center">Loading...</div>
            ) : pendingInvitations && pendingInvitations.length > 0 ? (
              <div className="space-y-3">
                {pendingInvitations.map((inv) => {
                  // Find inviter (admin or created_by)
                  const inviter = inv.conversation_participants?.find(
                    p => p.role === 'admin' && p.user
                  );
                  return (
                    <div key={inv.id} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        {inviter?.user?.profile_picture ? (
                          <img
                            src={inviter.user.profile_picture}
                            alt={inviter.user.display_name || inviter.user.username}
                            className="w-8 h-8 rounded-full object-cover border border-white/20"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-lg font-bold">
                            {inviter?.user?.display_name?.[0] || inviter?.user?.username?.[0] || '?'}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-white font-medium">
                            {inv.name || inviter?.user?.display_name || inviter?.user?.username || 'Direct Message'}
                          </span>
                          {inviter?.user?.username && (
                            <span className="text-xs text-neutral-400">@{inviter.user.username}</span>
                          )}
                        </div>
                      </div>
                      <button
                        className="bg-white text-black px-4 py-1 rounded hover:bg-neutral-200 font-semibold disabled:opacity-60"
                        disabled={acceptInvitation.isPending}
                        onClick={() => acceptInvitation.mutate(inv.id)}
                      >
                        {acceptInvitation.isPending ? 'Accepting...' : 'Accept'}
                      </button>
                    </div>
                  );
                })}
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
