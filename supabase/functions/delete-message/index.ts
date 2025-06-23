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
    // Fetch message and conversation type
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('conversation_id,sender_id')
      .eq('id', messageId)
      .single();
    if (fetchError || !message) throw fetchError || new Error('Message not found');

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('type')
      .eq('id', message.conversation_id)
      .single();
    if (convError || !conversation) throw convError || new Error('Conversation not found');

    // If direct message, only allow sender to delete
    if (conversation.type === 'direct' && message.sender_id !== userId) {
      return new Response(JSON.stringify({ error: 'You can only delete your own messages in direct conversations.' }), { status: 403, headers: corsHeaders });
    }

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
