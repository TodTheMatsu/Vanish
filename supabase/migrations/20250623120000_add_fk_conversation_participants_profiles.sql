-- Add a foreign key from conversation_participants.user_id to profiles.user_id
ALTER TABLE conversation_participants
ADD CONSTRAINT fk_participant_profile
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

-- Optional: Check for orphaned user_ids before running this migration
-- SELECT user_id FROM conversation_participants WHERE user_id NOT IN (SELECT user_id FROM profiles);
