// Supabase Edge Function: ask-policy
// Grounded RAG Policy Q&A over policy_chunks using Free-Tier AI (Google Gemini 1.5 Flash) or direct excerpting
// Server-side only: API keys are never exposed to the client.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AskRequest {
  question: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    // Authenticate the user request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: AskRequest = await req.json();
    const question = body.question?.trim();
    if (!question) {
      return new Response(JSON.stringify({ error: "Question cannot be empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch published policy documents and chunks
    const { data: policies, error: policyError } = await supabase
      .from("policies")
      .select("id, title, section, body")
      .eq("status", "Published");

    if (policyError || !policies || policies.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "No policies are published in the system right now, so I can't verify an answer. Please contact People Operations directly.",
          fallback: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Match relevant policy sections by keyword/text similarity
    const qLower = question.toLowerCase();
    let bestMatch = policies.find((p) => {
      const titleLower = p.title.toLowerCase();
      const sectionLower = p.section.toLowerCase();
      const bodyLower = p.body.toLowerCase();
      if (qLower.includes("remote") || qLower.includes("work from home") || qLower.includes("location")) {
        return titleLower.includes("work") || titleLower.includes("remote");
      }
      if (qLower.includes("time off") || qLower.includes("vacation") || qLower.includes("leave") || qLower.includes("sick")) {
        return titleLower.includes("time away") || titleLower.includes("time off");
      }
      if (qLower.includes("security") || qLower.includes("password") || qLower.includes("information") || qLower.includes("data")) {
        return titleLower.includes("information") || titleLower.includes("security");
      }
      return titleLower.includes(qLower) || sectionLower.includes(qLower) || bodyLower.includes(qLower);
    });

    if (!bestMatch) {
      // Find the policy with highest word overlap
      const words = qLower.split(/\W+/).filter((w: string) => w.length > 3);
      let highestCount = 0;
      for (const p of policies) {
        const text = `${p.title} ${p.section} ${p.body}`.toLowerCase();
        const matches = words.filter((w: string) => text.includes(w)).length;
        if (matches > highestCount) {
          highestCount = matches;
          bestMatch = p;
        }
      }
      if (highestCount === 0) {
        bestMatch = undefined;
      }
    }

    // If no relevant context found, return strict honest fallback
    if (!bestMatch) {
      return new Response(
        JSON.stringify({
          answer: "I couldn't find a confident answer in the available policy excerpts. Please contact People Operations directly for help with this question.",
          fallback: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are ComplyPilot, an AI employee onboarding & compliance policy assistant.
STRICT GROUNDING RULES:
1. ONLY answer using the exact policy context provided below.
2. If the policy context does not clearly and directly answer the question, respond: "I couldn't find a confident answer in the available policy excerpts. Please contact People Operations directly for help with this question."
3. Do not extrapolate, invent rules, or guess.
4. Keep the response concise, clear, and professional.

Policy Context:
Title: ${bestMatch.title}
Section: ${bestMatch.section}
Content: ${bestMatch.body}

Question: ${question}`;

    // 2. Free Tier LLM Option: Google Gemini 1.5 Flash (Free at aistudio.google.com)
    if (geminiApiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
              generationConfig: {
                maxOutputTokens: 300,
                temperature: 0.2,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const answerText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answerText) {
            return new Response(
              JSON.stringify({
                answer: answerText.trim(),
                sourceId: bestMatch.id,
                sourceTitle: bestMatch.title,
                sourceSection: bestMatch.section,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (err) {
        console.error("Gemini API invocation error, falling back to direct excerpt:", err);
      }
    }

    // 3. Optional Anthropic Claude fallback if configured
    if (anthropicApiKey) {
      try {
        const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicApiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 300,
            messages: [{ role: "user", content: systemPrompt }],
          }),
        });

        if (claudeRes.ok) {
          const claudeData = await claudeRes.json();
          const answerText = claudeData.content?.[0]?.text;
          if (answerText) {
            return new Response(
              JSON.stringify({
                answer: answerText.trim(),
                sourceId: bestMatch.id,
                sourceTitle: bestMatch.title,
                sourceSection: bestMatch.section,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (err) {
        console.error("Claude API invocation error, using direct policy text fallback:", err);
      }
    }

    // 4. Zero-cost default fallback (Works even without ANY API key!)
    return new Response(
      JSON.stringify({
        answer: `According to “${bestMatch.title}” (${bestMatch.section}): ${bestMatch.body}`,
        sourceId: bestMatch.id,
        sourceTitle: bestMatch.title,
        sourceSection: bestMatch.section,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
