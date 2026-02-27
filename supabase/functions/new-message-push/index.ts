// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Payload = {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  type: "dm" | "group";
  recipient_user_ids: string[];
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function isPushGloballyDisabled() {
  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "push_global_disabled")
    .maybeSingle();

  if (error || !data) return false;
  const value = data.value;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
  if (typeof value === "number") return value === 1;
  return false;
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const payload = (await req.json()) as Payload;
    const globalDisabled = await isPushGloballyDisabled();
    if (globalDisabled) {
      return new Response(JSON.stringify({ ok: true, skipped: "global_disabled" }), { status: 200 });
    }

    // debounce: prevent duplicate push for same message id
    const exists = await supabase
      .from("push_dispatch_logs")
      .select("message_id")
      .eq("message_id", payload.message_id)
      .maybeSingle();

    if (exists.data) {
      return new Response(JSON.stringify({ ok: true, skipped: "already_sent" }), { status: 200 });
    }

    const profileRes = await supabase
      .from("profiles")
      .select("id,notification_enabled,push_enabled")
      .in("id", payload.recipient_user_ids);

    if (profileRes.error) throw profileRes.error;

    const allowedRecipientIds = (profileRes.data || [])
      .filter((p) => p.push_enabled !== false && p.notification_enabled !== false)
      .map((p) => p.id);

    if (allowedRecipientIds.length === 0) {
      await supabase.from("push_dispatch_logs").insert({
        message_id: payload.message_id,
        conversation_id: payload.conversation_id,
      });
      return new Response(JSON.stringify({ ok: true, skipped: "disabled" }), { status: 200 });
    }

    const tokenRes = await supabase
      .from("push_tokens")
      .select("expo_push_token")
      .in("user_id", allowedRecipientIds)
      .eq("enabled", true);

    if (tokenRes.error) throw tokenRes.error;

    const tokens = [...new Set((tokenRes.data || []).map((t) => t.expo_push_token))];
    if (tokens.length === 0) {
      await supabase.from("push_dispatch_logs").insert({
        message_id: payload.message_id,
        conversation_id: payload.conversation_id,
      });
      return new Response(JSON.stringify({ ok: true, skipped: "no_tokens" }), { status: 200 });
    }

    const messages = tokens.map((to) => ({
      to,
      sound: "default",
      title: payload.type === "group" ? `Nouveau message dans ${payload.sender_name}` : payload.sender_name,
      body: payload.body,
      data: {
        type: payload.type,
        conversation_id: payload.conversation_id,
        url:
          payload.type === "group"
            ? `/messages/group/${payload.conversation_id}`
            : `/messages/${payload.conversation_id}`,
      },
    }));

    const pushRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });

    const pushJson = await pushRes.json();

    await supabase.from("push_dispatch_logs").insert({
      message_id: payload.message_id,
      conversation_id: payload.conversation_id,
    });

    console.log("push_sent", {
      message_id: payload.message_id,
      conversation_id: payload.conversation_id,
      recipients: allowedRecipientIds.length,
      tokens: tokens.length,
    });

    return new Response(JSON.stringify({ ok: true, result: pushJson }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("push_error", error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
