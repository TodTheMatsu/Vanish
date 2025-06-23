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

  try {
    const { conversationId } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get the user from the JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: corsHeaders });
    }
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user' }), { status: 401, headers: corsHeaders });
    }

    // Set left_at for this user in the conversation
    const { error } = await supabase
      .from('conversation_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    }

    // Broadcast member left event
    await supabase.channel(`conversations:${conversationId}`)
      .send({
        type: 'broadcast',
        event: 'member_left',
        payload: {
          conversationId,
          userId: user.id,
          timestamp: new Date().toISOString()
        }
      });

    // Check number of active participants (left_at is null)
    const { count, error: countError } = await supabase
      .from('conversation_participants')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .is('left_at', null);

    if (countError) {
      return new Response(JSON.stringify({ error: countError.message }), { status: 400, headers: corsHeaders });
    }

    if (count <= 1) {
      // Delete the conversation (CASCADE will remove participants/messages)
      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), { status: 400, headers: corsHeaders });
      }
      // Broadcast conversation deleted event
      await supabase.channel(`conversations:${conversationId}`)
        .send({
          type: 'broadcast',
          event: 'conversation_deleted',
          payload: {
            conversationId,
            timestamp: new Date().toISOString()
          }
        });
      return new Response(JSON.stringify({ success: true, deleted: true }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, deleted: false }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err.toString() }), { status: 400, headers: corsHeaders });
  }
});
