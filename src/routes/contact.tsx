import { createFileRoute } from "@tanstack/react-router";
import { Bell, Mail, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Success Real Estate Concierge — Coimbatore" },
      {
        name: "description",
        content:
          "Reach a Success Real Estate advisor in Coimbatore, schedule a private tour, or set alerts for new listings and price drops.",
      },
      { property: "og:title", content: "Contact Success Real Estate Concierge" },
      {
        property: "og:description",
        content: "Talk to an advisor or set saved-search alerts. No long sign-up required.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://success-real-estate.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://success-real-estate.lovable.app/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: "Success Real Estate",
          url: "https://success-real-estate.lovable.app/",
          telephone: "+91 88077 39441",
          email: "concierge@successrealestate.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "NSK Street, Selvapuram, Perur Main Road, Near GM Bakery",
            addressLocality: "Coimbatore",
            addressRegion: "Tamil Nadu",
            addressCountry: "IN",
          },
          openingHours: "Mo-Sa 08:00-21:00",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://success-real-estate.lovable.app/" },
            {
              "@type": "ListItem",
              position: 2,
              name: "Contact",
              item: "https://success-real-estate.lovable.app/contact",
            },
          ],
        }),
      },
    ],
  }),

  component: ContactPage,
});

function ContactPage() {
  const [alerts, setAlerts] = useState({ newListings: true, priceDrops: true, savedSearch: false });

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <p className="eyebrow">Concierge desk</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Contact Success Real Estate Concierge</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message sent — an advisor will reply within the hour.");
          }}
          className="space-y-4 rounded-xl border border-gold/45 bg-card p-6 sm:p-8"
        >
          <h2 className="font-display text-2xl">Send an inquiry</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input required aria-label="Full name" placeholder="Full name" className="h-12 rounded-lg border border-border bg-background px-4 outline-none focus:border-gold" />
            <input required aria-label="Email or phone" placeholder="Email or phone" className="h-12 rounded-lg border border-border bg-background px-4 outline-none focus:border-gold" />
          </div>
          <select aria-label="What can we help you with?" className="h-12 w-full rounded-lg border border-border bg-background px-4 text-foreground outline-none focus:border-gold">
            <option>I'm looking to buy</option>
            <option>I'm looking to rent</option>
            <option>I'd like to sell</option>
            <option>Schedule a private tour</option>
          </select>
          <textarea
            rows={5}
            aria-label="Your message"
            placeholder="Tell us what you're looking for…"
            className="w-full rounded-lg border border-border bg-background p-4 text-sm outline-none focus:border-gold"
          />

          <button className="h-12 w-full rounded-lg bg-primary text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90">
            Send message
          </button>
        </form>

        <div className="space-y-6">
          <div className="rounded-xl border border-gold/35 bg-card p-6">
            <h2 className="font-display text-xl">Direct lines</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-3"><Phone className="h-4 w-4 text-gold" /> +91 88077 39441</p>
              <p className="inline-flex items-center gap-3"><Mail className="h-4 w-4 text-gold" /> concierge@successrealestate.com</p>
              <p className="inline-flex items-center gap-3"><MessageSquare className="h-4 w-4 text-gold" /> Live chat, 8am–9pm daily</p>
            </div>
          </div>

          <div className="rounded-xl border border-gold/35 bg-card p-6">
            <h2 className="font-display text-xl">Office address</h2>
            <address className="mt-4 not-italic text-sm leading-relaxed text-muted-foreground">
              NSK Street, Selvapuram,<br />
              Perur Main Road,<br />
              Near GM Bakery,<br />
              Coimbatore, Tamil Nadu
            </address>
          </div>

          <div className="rounded-xl border border-gold/35 bg-card p-6">
            <h2 className="inline-flex items-center gap-2 font-display text-xl">
              <Bell className="h-5 w-5 text-gold" /> Alerts
            </h2>
            <div className="mt-4 space-y-4">
              {(
                [
                  ["newListings", "New listings in my area"],
                  ["priceDrops", "Price drops on saved homes"],
                  ["savedSearch", "Weekly saved-search digest"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                  {label}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={alerts[key]}
                    onClick={() => setAlerts((a) => ({ ...a, [key]: !a[key] }))}
                    className={`h-6 w-11 shrink-0 rounded-full border transition-colors ${
                      alerts[key] ? "border-gold bg-gold/80" : "border-border bg-muted"
                    }`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-background transition-transform ${
                        alerts[key] ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
