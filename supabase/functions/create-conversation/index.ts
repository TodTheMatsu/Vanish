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
        role: 'admin'
      },
      ...participantIds
        .filter((id: string) => id !== created_by)
        .map((userId: string) => ({
          conversation_id: conversation.id,
          user_id: userId,
          role: 'member'
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
