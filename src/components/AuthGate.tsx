import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import crest from "@/assets/logo-crest.png";
import { useSession } from "@/lib/auth";

// Only auth and machine-facing files stay public; every visitor must sign up
// before viewing any page content.
const PUBLIC_PREFIXES = ["/auth", "/sitemap.xml", "/mcp", "/.well-known", "/.lovable"];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMounted(true);
  }, []);

  const publicPath = isPublicPath(pathname);

  if (!mounted || loading || publicPath || user) return <>{children}</>;

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
          Sign up to continue
        </Link>
      </div>
    </div>
  );
}
