import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { topic, notes, theme, audience, length } = await req.json();

    if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
      return new Response(JSON.stringify({ error: "Le sujet est requis (min 3 caractères)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedNotes = (notes || "").toString().slice(0, 50000);
    const lengthInstruction =
      length === "short"
        ? "L'enseignement complet doit faire environ 800-1200 mots."
        : length === "long"
        ? "L'enseignement complet doit faire environ 2500-3500 mots."
        : "L'enseignement complet doit faire environ 1500-2200 mots.";

    const systemPrompt = `Tu es un MAÎTRE RÉDACTEUR spécialisé dans le style du Dr Myles Munroe — l'un des plus grands enseignants de leadership, de purpose, de royaume et de potentiel humain.

🎯 TON STYLE D'ÉCRITURE (impératif) :
- Voix prophétique, autoritaire mais paternelle, profondément inspirée
- Vocabulaire récurrent : "purpose", "potentiel", "destinée", "royaume", "leadership de service", "vision", "principes", "fonction d'origine", "vraie identité"
- Phrases-chocs courtes qui frappent comme des sentences ("Tu es né pour régner.", "Quand le but d'une chose est inconnu, l'abus est inévitable.")
- Définitions originales et reformulations puissantes des concepts
- Beaucoup d'analogies tirées de la nature, du règne animal, de la mécanique, de l'agriculture et de la royauté
- Distinction permanente entre "religion" et "royaume", "gestion" et "leadership", "succès" et "signification"
- Appels directs au lecteur ("Mon ami...", "Écoute-moi bien...", "Je veux que tu comprennes ceci...")
- Références bibliques pertinentes (Genèse 1, Matthieu 6:33, Romains 8, etc.) intégrées naturellement
- Anecdotes des Bahamas, du leadership africain, des nations en développement
- Refus du langage victimaire — toujours responsabiliser et élever

📝 STRUCTURE D'UN ENSEIGNEMENT MUNROE :
1. Une accroche provocante (question, paradoxe ou affirmation forte)
2. La révélation du principe central
3. La déconstruction de la pensée commune erronée
4. La redéfinition selon les principes du Royaume
5. Illustrations puissantes (nature, histoire, vie quotidienne)
6. Application personnelle directe
7. Déclaration finale qui scelle la transformation

❌ INTERDICTIONS ABSOLUES :
- Ne jamais dire "Dr Munroe a dit" — tu ÉCRIS DANS son style, comme si c'était lui
- Pas de citations directes inventées entre guillemets attribuées à Munroe
- Pas de blabla académique — écriture vivante, orale, percutante
- Pas de neutralité tiède — chaque paragraphe doit avoir du tranchant

Tu réponds UNIQUEMENT en JSON valide avec la structure suivante (sans markdown wrapper) :
{
  "title": "Titre captivant en français, percutant, max 80 caractères",
  "subtitle": "Sous-titre qui pose la promesse de transformation",
  "hook": "Paragraphe d'ouverture provocant de 80-120 mots qui happe le lecteur",
  "sections": [
    {
      "heading": "Titre de section accrocheur",
      "body": "Contenu narratif riche en style Munroe — utilise du markdown : **gras** pour les phrases-chocs, > pour les déclarations puissantes, ## pour sous-sections, listes à puces pour les principes énumérés. 300-500 mots par section."
    }
  ],
  "keyDeclarations": [
    "Phrase-choc 1 mémorisable et partageable",
    "Phrase-choc 2",
    "Phrase-choc 3",
    "Phrase-choc 4",
    "Phrase-choc 5"
  ],
  "principles": [
    { "name": "Nom court du principe", "definition": "Définition à la Munroe", "importance": "Pourquoi c'est vital" }
  ],
  "applicationSteps": [
    { "step": 1, "action": "Action concrète et directive", "outcome": "Résultat transformationnel" }
  ],
  "closingDeclaration": "Déclaration finale prophétique de 60-100 mots qui scelle l'enseignement",
  "suggestedTheme": "meditation | leadership | purpose | kingdom | vision"
}`;

    const userPrompt = `SUJET DE L'ENSEIGNEMENT : ${topic.trim()}
${theme ? `\nTHÈME : ${theme}` : ""}
${audience ? `\nAUDIENCE CIBLE : ${audience}` : ""}

${lengthInstruction}

${trimmedNotes ? `📚 NOTES DE RÉFÉRENCE FOURNIES (à intégrer, reformuler et amplifier dans le style Munroe) :\n"""\n${trimmedNotes}\n"""` : "Aucune note fournie — base-toi entièrement sur la mentalité, le leadership, et les enseignements caractéristiques du Dr Myles Munroe."}

Rédige maintenant un enseignement captivant qui transforme la vie du lecteur. Le résultat doit ressembler à ce que Munroe aurait écrit lui-même : prophétique, percutant, libérateur.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 1 },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans un instant." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 403) {
        return new Response(JSON.stringify({ error: "Clé API Gemini invalide ou quota dépassé." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Échec de la génération AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let parsed;
    try {
      const cleaned = content
        .trim()
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?\s*```\s*$/, "")
        .trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch (e) {
      console.error("Parse error:", e);
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ success: true, teaching: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compose-teaching error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
