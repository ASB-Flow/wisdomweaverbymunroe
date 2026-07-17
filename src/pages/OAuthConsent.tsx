import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, X } from "lucide-react";

// Local typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{
    data: {
      client?: { name?: string; client_uri?: string; redirect_uris?: string[] };
      scope?: string;
      redirect_url?: string;
      redirect_to?: string;
    } | null;
    error: { message: string } | null;
  }>;
  approveAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
  denyAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
};

function oauth(): OAuthApi {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase.auth as any).oauth as OAuthApi;
}

interface AuthzDetails {
  client?: { name?: string; client_uri?: string; redirect_uris?: string[] };
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthzDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Paramètre authorization_id manquant.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      setUserEmail(sess.session.user.email ?? null);
      const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const res = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (res.error) {
      setBusy(false);
      setError(res.error.message);
      return;
    }
    const target = res.data?.redirect_url ?? res.data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Aucune URL de redirection renvoyée par le serveur OAuth.");
      return;
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy-light to-navy p-6">
        <div className="max-w-md w-full bg-cream rounded-2xl p-8 shadow-xl">
          <h1 className="font-display text-2xl font-bold text-navy mb-2">Autorisation impossible</h1>
          <p className="text-navy/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy-light to-navy">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  const clientName = details.client?.name ?? "cette application";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy-light to-navy p-6">
      <div className="max-w-md w-full bg-cream rounded-2xl p-8 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center mb-6">
          <ShieldCheck className="w-7 h-7 text-navy" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy mb-2">
          Connecter {clientName} à Teachings Hub
        </h1>
        <p className="text-navy/70 text-sm mb-6">
          {clientName} pourra utiliser les outils de Teachings Hub en votre nom pendant que vous êtes connecté.
        </p>

        <div className="bg-navy/5 rounded-xl p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-navy/60">Compte</span>
            <span className="text-navy font-medium">{userEmail ?? "—"}</span>
          </div>
          {details.client?.redirect_uris?.[0] && (
            <div className="flex justify-between gap-2">
              <span className="text-navy/60 shrink-0">Redirection</span>
              <span className="text-navy/80 font-mono text-xs truncate">
                {details.client.redirect_uris[0]}
              </span>
            </div>
          )}
          {details.scope && (
            <div className="flex justify-between gap-2">
              <span className="text-navy/60 shrink-0">Permissions</span>
              <span className="text-navy/80 text-xs">{details.scope}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-navy/60 mb-6">
          Cela ne contourne pas les autorisations de l'application : les règles d'accès et la RLS s'appliquent
          normalement.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            disabled={busy}
            onClick={() => decide(false)}
          >
            <X className="w-4 h-4" />
            Refuser
          </Button>
          <Button
            variant="gold"
            className="flex-1 gap-2"
            disabled={busy}
            onClick={() => decide(true)}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Approuver
          </Button>
        </div>
      </div>
    </div>
  );
}
