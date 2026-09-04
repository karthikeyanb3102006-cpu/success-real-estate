import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import crest from "@/assets/logo-crest.png";
import { useSession } from "@/lib/auth";

const PUBLIC_PREFIXES = ["/auth", "/sitemap.xml", "/mcp", "/.well-known", "/.lovable"];

export function AuthGate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [guest, setGuest] = useState(false);
  const { user, loading } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMounted(true);
    try {
      setGuest(sessionStorage.getItem("sre-guest") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const bypass = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!mounted || loading || bypass || user || guest) return <>{children}</>;

  const next = pathname === "/" ? undefined : pathname;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-16 text-center">
      <img src={crest} alt="Success Real Estate crest" width={72} height={72} className="h-18 w-18" />
      <h1 className="mt-6 font-display text-4xl text-gilded">Success Real Estate</h1>
      <p className="mt-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
        Your Dream • Our Priority
      </p>
      <p className="mt-6 max-w-md text-sm text-muted-foreground">
        Sign in to browse Coimbatore homes, save favourites to your collection and book private tours.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link
          to="/auth"
          search={next ? { next } : {}}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Sign in / Sign up
        </Link>
        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.setItem("sre-guest", "1");
            } catch {
              /* ignore */
            }
            setGuest(true);
          }}
          className="inline-flex h-12 items-center justify-center rounded-lg border border-gold/60 text-sm text-gold transition-colors hover:bg-accent"
        >
          Browse as guest
        </button>
      </div>
    </div>
  );
}
