import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are TailorHub Assistant, a friendly bilingual (English + Bengali) helper for a tailoring marketplace called TailorHub.

You help customers with FOUR main things:

1. TAILOR RECOMMENDER — When users describe what they want (e.g. "wedding sherwani in Dhaka under 5000 BDT", "alterations near Rangpur"), suggest what specialties to filter by (traditional, western_formal, bridal_wedding, alterations) and tell them to use the search page at /tailors with that location and category. You do not have live tailor data — guide them to filter the listing themselves.

2. MEASUREMENT HELPER — Help users take accurate body measurements (chest, waist, hips, shoulder width, arm length, inseam, neck, thigh). Give simple, clear instructions. Sanity-check values they share (e.g. chest typically 32-50 inches for adults). Remind them to measure with a snug — not tight — measuring tape, wear thin clothing, and keep the tape level.

3. ORDER DESCRIPTION WRITER — When a user gives a few keywords, photos hints, or a rough idea, write a clear, concise order description (3–6 sentences) covering: garment type, fabric preference, color, style details (collar, sleeves, fit), occasion, and any deadlines. Output the description in a code block so it is easy to copy.

4. SUPPORT CHATBOT — Answer how the platform works: signing up as customer or tailor, placing orders, order statuses (pending → accepted → in_progress → ready → delivered), payments, leaving reviews, etc.

Language rule (CRITICAL): Detect the user's language from their message. If they write in Bengali, reply ONLY in Bengali. If they write in English, reply ONLY in English. Never mix languages in a single reply. Keep product names like "TailorHub", "Lovable Cloud", and category keys (traditional, western_formal, bridal_wedding, alterations) in English even in Bengali replies.

Style: Be warm, concise, and use markdown (lists, **bold**, code blocks) to make answers scannable. Never invent specific tailor names, prices, or contact info — those come from the live listing.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});