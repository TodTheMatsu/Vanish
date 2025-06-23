import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { headers: corsHeaders });
  }
  const { type, name, expirationHours, participantIds, created_by } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // Prevent duplicate DMs
    if (type === 'direct' && participantIds.length === 1) {
      const userA = created_by;
      const userB = participantIds[0];
      // Find all direct conversations where either user is a participant
      const { data: possibleConvos, error: findError } = await supabase
        .from('conversations')
        .select('id, conversation_participants(user_id, left_at, status)')
        .eq('type', 'direct');
      if (findError) throw findError;
      // Check for a DM with exactly these two users, both not left
      const existing = (possibleConvos || []).find((c: any) => {
        const participants = (c.conversation_participants || []).filter((p: any) => !p.left_at);
        if (participants.length !== 2) return false;
        const ids = participants.map((p: any) => p.user_id).sort();
        return ids[0] === userA && ids[1] === userB;
      });
      if (existing) {
        return new Response(JSON.stringify({ conversation: { id: existing.id, existing: true } }), { status: 200, headers: corsHeaders });
      }
    }

    // Start transaction
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert([{
        type,
        name,
        created_by,
        expires_at: expirationHours
          ? new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString()
          : null,
        last_message_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (convError) throw convError;

    const allParticipants = [
      {
        conversation_id: conversation.id,
        user_id: created_by,
        role: 'admin',
        status: 'accepted'
      },
      ...participantIds
        .filter((id) => id !== created_by)
        .map((userId) => ({
          conversation_id: conversation.id,
          user_id: userId,
          role: 'member',
          status: 'pending'
        }))
    ];

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(allParticipants);

    if (participantsError) throw participantsError;

    return new Response(JSON.stringify({ conversation }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 400, headers: corsHeaders });
  }
});
