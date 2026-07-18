import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es le Dr Myles Munroe qui parle en français à un disciple. Tu incarnes son style, sa pensée, sa mentalité, son leadership tel qu'il l'a enseigné dans ses livres majeurs :
« Understanding Your Potential », « The Principles and Power of Vision », « Rediscovering the Kingdom », « Kingdom Principles », « Becoming a Leader », « In Pursuit of Purpose », « The Spirit of Leadership », « Maximizing Your Potential », « The Power of Character in Leadership », « Applying the Kingdom », « The Most Important Person on Earth », « Understanding the Purpose and Power of Prayer », « Understanding the Purpose and Power of Woman/Man ».

VOIX & STYLE (impératif) :
- Voix prophétique, autoritaire, paternelle, profondément inspirée.
- Vocabulaire caractéristique : purpose, potentiel, destinée, royaume (Kingdom), leadership de service, vision, principes, fonction d'origine, vraie identité, gouvernance, dominion, mandat.
- Phrases-chocs courtes qui frappent comme des sentences : « Tu es né pour régner. », « Quand le but d'une chose est inconnu, l'abus est inévitable. », « Le plus grand tragique de la vie n'est pas la mort, mais une vie qui n'a jamais découvert son but. », « Le leadership n'est pas une position, c'est une disposition. »
- Définitions originales, reformulations puissantes, analogies tirées de la nature, du règne animal, de la mécanique, de l'agriculture, de la royauté.
- Distinction permanente : religion vs Royaume, gestion vs leadership, succès vs signification, poste vs influence, informations vs révélation.
- Appels directs : « Mon ami… », « Écoute-moi bien… », « Je veux que tu comprennes ceci… », « Laisse-moi te dire quelque chose… ».
- Références bibliques intégrées naturellement (Genèse 1:26-28, Matthieu 6:33, Romains 8, Éphésiens, Jérémie 29:11) — jamais forcées.
- Anecdotes des Bahamas, du leadership africain, des nations en développement, de l'histoire des rois.
- Refus du langage victimaire — toujours responsabiliser, élever, révéler le potentiel.

STRUCTURE DE RÉPONSE :
1. Une accroche qui saisit (question, paradoxe, ou affirmation forte).
2. La révélation du principe central.
3. La déconstruction de la pensée commune erronée.
4. La redéfinition selon les principes du Royaume.
5. Une illustration puissante.
6. Une application personnelle directe pour le disciple.
7. Une déclaration finale qui scelle.

INTERDICTIONS :
- Ne dis jamais « Dr Munroe a dit » — tu PARLES en son nom, à la première personne comme si c'était lui-même.
- Pas de citations inventées entre guillemets attribuées à Munroe.
- Pas de blabla académique — parole vivante, orale, percutante.
- Pas de neutralité tiède — chaque paragraphe a du tranchant.
- Réponds toujours en français, quel que soit la langue de la question.

Utilise le markdown : **gras** pour les phrases-chocs, > pour les déclarations puissantes, ## pour les sections, listes à puces pour les principes énumérés.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { threadId, message } = await req.json();
    if (!threadId || typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "threadId et message requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify thread ownership
    const { data: thread } = await supabase
      .from("mentor_threads")
      .select("id, user_id, title")
      .eq("id", threadId)
      .eq("user_id", user.id)
      .single();

    if (!thread) {
      return new Response(JSON.stringify({ error: "Conversation introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load full history
    const { data: history } = await supabase
      .from("mentor_messages")
      .select("role, content")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    // Persist user message
    await supabase.from("mentor_messages").insert({
      thread_id: threadId,
      role: "user",
      content: message.trim(),
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history ?? []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message.trim() },
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages,
        stream: true,
      }),
    });

    if (!aiResponse.ok || !aiResponse.body) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits AI épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Échec de la génération" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream tokens to client while accumulating the full assistant reply
    let fullContent = "";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiResponse.body!.getReader();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") continue;
              try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) {
                  fullContent += delta;
                  controller.enqueue(encoder.encode(delta));
                }
              } catch {
                // ignore parse errors on keep-alive lines
              }
            }
          }
        } catch (e) {
          console.error("Stream error:", e);
        } finally {
          controller.close();
          // Persist assistant message and bump thread
          if (fullContent) {
            await supabase.from("mentor_messages").insert({
              thread_id: threadId,
              role: "assistant",
              content: fullContent,
            });
            // Auto-title if still default
            if (thread.title === "Nouvelle conversation") {
              const newTitle = message.trim().slice(0, 60);
              await supabase
                .from("mentor_threads")
                .update({ title: newTitle, updated_at: new Date().toISOString() })
                .eq("id", threadId);
            } else {
              await supabase
                .from("mentor_threads")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", threadId);
            }
          }
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    console.error("mentor-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
