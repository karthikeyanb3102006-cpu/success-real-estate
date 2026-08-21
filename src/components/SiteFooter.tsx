import { Link } from "@tanstack/react-router";

import crest from "@/assets/logo-crest.png";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3">
        <div>
          <img src={crest} alt="Success Real Estate crest" loading="lazy" width={44} height={44} className="h-11 w-11" />
          <p className="mt-4 font-display text-xl text-gilded">Success Real Estate</p>
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Your Dream • Our Priority
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="eyebrow">Explore</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/properties" className="hover:text-gold">Buy & Rent</Link>
            <Link to="/collection" className="hover:text-gold">My Collection</Link>
            <Link to="/about" className="hover:text-gold">Why Success</Link>
            <Link to="/contact" className="hover:text-gold">Talk to an advisor</Link>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="eyebrow">Concierge desk</p>
          <p className="mt-4">+1 (800) 555-0199</p>
          <p>concierge@successrealestate.com</p>
          <p className="mt-4">Mon–Sat, 8am – 9pm local time</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Success Real Estate. All rights reserved.
      </div>
    </footer>
  );
}
