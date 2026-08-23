import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, LogOut, Menu } from "lucide-react";
import { useState } from "react";

import crest from "@/assets/logo-crest.png";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";

const nav = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/collection", label: "My Collection" },
  { to: "/about", label: "Why Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { ids } = useFavorites();
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }


  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={crest} alt="Success Real Estate crest" width={40} height={40} className="h-10 w-10" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-wide text-gilded">
              Success Real Estate
            </span>
            <span className="block text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Your Dream • Our Priority
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/collection"
            className="relative inline-flex items-center gap-2 rounded-full border border-gold/60 px-4 py-2 text-sm text-gold transition-colors hover:bg-accent"
          >
            <Heart className="h-4 w-4" />
            {ids.length}
          </Link>
        </nav>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold/50 text-gold md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open ? (
        <nav className="flex flex-col gap-1 border-t border-border/70 px-5 pb-4 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-base text-muted-foreground hover:text-gold"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
