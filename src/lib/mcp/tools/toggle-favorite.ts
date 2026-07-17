declare const process: { env: Record<string, string | undefined> };
import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "toggle_favorite",
  title: "Ajouter/retirer un favori",
  description: "Ajoute ou retire un enseignement des favoris de l'utilisateur connecté.",
  inputSchema: {
    teaching_id: z.string().uuid().describe("UUID de l'enseignement à basculer."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false },
  handler: async ({ teaching_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Authentification requise." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("teaching_id", teaching_id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      return {
        content: [{ type: "text", text: "Favori retiré." }],
        structuredContent: { favorited: false },
      };
    }
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, teaching_id });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: "Ajouté aux favoris." }],
      structuredContent: { favorited: true },
    };
  },
});
