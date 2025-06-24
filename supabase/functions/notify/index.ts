import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

Deno.serve(async (req) => {
  const payload = await req.json();
  console.log("Received JSON payload:", JSON.stringify(payload, null, 2));

  if (payload.record) {
    const conversationId = payload.record.conversation_id;
    const senderId = payload.record.sender_id;
    const content = payload.record.content || "New message";

    // Query all participants except the sender and those who left
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: participants, error: participantsError } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .is("left_at", null);
    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch recipients" }),
        { status: 500 }
      );
    }
    const recipientIds = (participants || [])
      .map((p: any) => p.user_id)
      .filter((id: string) => id !== senderId);
    if (recipientIds.length === 0) {
      return new Response(
        JSON.stringify({ status: "no recipients" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch sender's display name
    let senderName = "Someone";
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", senderId)
      .single();
    if (senderProfile && senderProfile.display_name) {
      senderName = senderProfile.display_name;
    }

    // Build OneSignal notification body
    const oneSignalBody = {
      app_id: Deno.env.get("ONESIGNAL_APP_ID")!,
      include_external_user_ids: recipientIds,
      contents: { en: `New message from ${senderName}: ${content}` },
      headings: { en: "New Message" },
      data: {
        conversationId,
        senderId,
      },
    };

    try {
      const response = await fetch(
        "https://onesignal.com/api/v1/notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Deno.env.get("ONESIGNAL_REST_API_KEY")!}`,
          },
          body: JSON.stringify(oneSignalBody),
        }
      );
      const responseData = await response.json();
      console.log("OneSignal API Response:", responseData);
      return new Response(
        JSON.stringify({
          message: "Notification sent",
          oneSignalResponse: responseData,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error making OneSignal API request:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send notification to OneSignal" }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }
  } else {
    console.error("Payload is missing the 'record' field");
    return new Response(
      JSON.stringify({ error: "Payload is missing the 'record' field" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }
});
