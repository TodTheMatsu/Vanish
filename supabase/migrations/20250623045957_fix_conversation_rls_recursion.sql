-- Fix circular dependency in RLS policies that causes infinite recursion
-- when creating conversations with participants

-- Drop the problematic policies that create circular dependency
DROP POLICY IF EXISTS "conversation_participants_policy" ON "public"."conversation_participants";
DROP POLICY IF EXISTS "conversations_select_policy" ON "public"."conversations";

-- Recreate conversation_participants policy without circular dependency
-- Allow users to access their own participant records or records where they are the conversation creator
CREATE POLICY "conversation_participants_access" 
ON "public"."conversation_participants" 
FOR ALL 
USING (
  -- User can access their own participant record
  auth.uid() = user_id 
  OR 
  -- User can access participant records for conversations they created
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = conversation_participants.conversation_id 
    AND conversations.created_by = auth.uid()
  )
);

-- Recreate conversations select policy without circular dependency
-- Allow users to view conversations where they are either the creator or an active participant
CREATE POLICY "conversations_participant_access" 
ON "public"."conversations" 
FOR SELECT 
USING (
  -- User created the conversation
  created_by = auth.uid() 
  OR 
  -- User is an active participant (using the function to avoid recursion)
  is_conversation_participant(id, auth.uid())
);

-- Keep the existing specific policies for insert/update/delete operations
-- These don't have circular dependencies and work correctly
