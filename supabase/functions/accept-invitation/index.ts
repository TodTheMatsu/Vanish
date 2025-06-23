// Accept Invitation Edge Function
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { headers: corsHeaders });
  }
  const { conversation_id } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing authorization header" }),
      { status: 401, headers: corsHeaders }
    );
  }
  const jwt = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(jwt);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Invalid user" }), {
      status: 401,
      headers: corsHeaders,
    });
  }
  if (!conversation_id) {
    return new Response(JSON.stringify({ error: "Missing conversation_id" }), {
      status: 400,
      headers: corsHeaders,
    });
  }
  // Update the participant's status to 'accepted'
  const { error: updateError } = await supabase
    .from("conversation_participants")
    .update({ status: "accepted" })
    .eq("conversation_id", conversation_id)
    .eq("user_id", user.id)
    .eq("status", "pending");
  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: corsHeaders,
  });
});
