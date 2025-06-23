import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  try {
    console.log('[get-conversations] Request received');
    if (req.method === "OPTIONS") {
      console.log('[get-conversations] OPTIONS preflight');
      return new Response("", { headers: corsHeaders });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('[get-conversations] Missing authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: corsHeaders });
    }
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      console.log('[get-conversations] Invalid user', userError);
      return new Response(JSON.stringify({ error: 'Invalid user', details: userError }), { status: 401, headers: corsHeaders });
    }
    console.log('[get-conversations] Authenticated user:', user.id);
    let status = 'accepted';
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body && body.status && (body.status === 'accepted' || body.status === 'pending')) {
          status = body.status;
        }
      } catch (e) {
        // Ignore JSON parse errors, default to 'accepted'
      }
    }
    // Step 1: Find conversation IDs where the current user is a participant with the given status
    const { data: participantRows, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)
      .eq('status', status)
      .is('left_at', null);
    if (participantError) {
      return new Response(JSON.stringify({ error: participantError.message }), { status: 400, headers: corsHeaders });
    }
    const conversationIds = (participantRows || []).map((row: any) => row.conversation_id);
    if (conversationIds.length === 0) {
      return new Response(JSON.stringify([]), { status: 200, headers: corsHeaders });
    }
    // Step 2: Fetch all conversations with all participants for those IDs
    const { data, error } = await supabase
      .from('conversations')
      .select('*, conversation_participants(*, user:profiles(*))')
      .in('id', conversationIds)
      .order('last_message_at', { ascending: false });
    console.log('[get-conversations] Query result:', data, 'Error:', error);
    if (error) {
      console.log('[get-conversations] Query error:', error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    }
    // Always return an array for the frontend
    return new Response(JSON.stringify(Array.isArray(data) ? data : []), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.log('[get-conversations] Unexpected error:', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: corsHeaders });
  }
});
