-- Add 'status' column to conversation_participants
ALTER TABLE conversation_participants
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

-- Optional: Add a check constraint for valid statuses
ALTER TABLE conversation_participants
ADD CONSTRAINT status_check CHECK (status IN ('pending', 'accepted', 'declined'));

-- Set all existing participants to 'accepted' (for backward compatibility)
UPDATE conversation_participants SET status = 'accepted';
