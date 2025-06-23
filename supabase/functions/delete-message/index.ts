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
  const { messageId, userId } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // Get the conversation_id before deleting
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('conversation_id')
      .eq('id', messageId)
      .single();
    if (fetchError || !message) throw fetchError || new Error('Message not found');

    // Delete the message
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
    if (error) throw error;

    // Broadcast the deletion event
    await supabase.channel(`messages:${message.conversation_id}`)
      .send({
        type: 'broadcast',
        event: 'message_deleted',
        payload: {
          messageId,
          conversationId: message.conversation_id
        }
      });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 400, headers: corsHeaders });
  }
});
