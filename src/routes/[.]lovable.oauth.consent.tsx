import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import crest from "@/assets/logo-crest.png";
import { supabase } from "@/integrations/supabase/client";

type OAuthAuthorizationDetails = {
  client?: { name?: string; client_name?: string; redirect_uri?: string } | null;
  scope?: string | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: OAuthAuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: OAuthAuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: OAuthAuthorizationDetails | null; error: { message: string } | null }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    const { data: userData } = await supabase.auth.getUser();
    return { details: data, email: userData.user?.email ?? null };
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md px-5 py-20 text-center">
      <h1 className="font-display text-3xl">Authorization unavailable</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const { details, email } = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "an app";
  const scopes = (details?.scope ?? "").split(" ").filter(Boolean);

  const scopeLabel = (scope: string) => {
    if (scope === "profile" || scope === "openid") return "Share your basic profile";
    if (scope === "email") return "Share your email address";
    return `Additional permission requested: ${scope}`;
  };

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error: err } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-5 py-16">
      <img
        src={crest}
        alt="Success Real Estate crest"
        width={64}
        height={64}
        className="mx-auto h-16 w-16"
      />
      <div className="mt-8 rounded-xl border border-gold/45 bg-card p-6 sm:p-8">
        <h1 className="font-display text-3xl">Connect {clientName} to Success Real Estate</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {clientName} will be able to call this app&apos;s enabled tools while you are signed in.
        </p>
        {email ? (
          <p className="mt-4 text-sm">
            Signed in as <span className="text-gold">{email}</span>
          </p>
        ) : null}
        {details?.client?.redirect_uri ? (
          <p className="mt-2 break-all text-xs text-muted-foreground">
            Redirects to {details.client.redirect_uri}
          </p>
        ) : null}
        {scopes.length ? (
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            {scopes.map((s) => (
              <li key={s}>• {scopeLabel(s)}</li>
            ))}
          </ul>
        ) : null}
        <p className="mt-5 text-xs text-muted-foreground">
          This does not bypass this app&apos;s permissions or backend policies.
        </p>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="mt-7 space-y-3">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="h-12 w-full rounded-lg bg-primary text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="h-12 w-full rounded-lg border border-gold/60 text-sm text-gold transition-colors hover:bg-accent disabled:opacity-60"
          >
            Cancel connection
          </button>
        </div>
      </div>
    </main>
  );
}
