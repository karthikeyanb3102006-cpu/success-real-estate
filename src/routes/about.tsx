import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, HeartHandshake, Star, Users } from "lucide-react";
import { useState } from "react";

import { testimonials } from "@/data/properties";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Why Success Real Estate — 22 Years of Trusted Closings" },
      {
        name: "description",
        content:
          "Experience, reviews and success stories behind Success Real Estate — a concierge approach to buying, renting and selling.",
      },
      { property: "og:title", content: "Why Success Real Estate" },
      {
        property: "og:description",
        content: "22 years, 1,400+ closings, and a 4.9/5 client rating.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const [i, setI] = useState(0);
  const t = testimonials[i] ?? testimonials[0]!;

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <p className="eyebrow">Why Success</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">
        A five-star concierge, not a listing portal
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        For 22 years we've represented families, first-time buyers and investors with the same
        standard of care. The crown in our crest is a promise: excellence at every price point.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Award, title: "22 years", copy: "Serving buyers and sellers since 2004." },
          { icon: Users, title: "1,400+", copy: "Successful closings across 11 markets." },
          { icon: Star, title: "4.9 / 5", copy: "Verified average client rating." },
          { icon: HeartHandshake, title: "0 pressure", copy: "Advice first. Always." },
        ].map((s) => (
          <div key={s.title} className="rounded-xl border border-gold/35 bg-card p-6">
            <s.icon className="h-7 w-7 text-gold" />
            <p className="mt-4 font-display text-2xl text-gilded">{s.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.copy}</p>
          </div>
        ))}
      </div>

      <section className="mt-16 rounded-xl border border-gold/45 bg-card p-8 sm:p-12">
        <p className="eyebrow">Success stories</p>
        <blockquote className="mt-6 font-display text-2xl leading-relaxed sm:text-3xl">
          “{t.quote}”
        </blockquote>
        <p className="mt-6 text-lg text-gold">{t.name}</p>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{t.role}</p>
        <div className="mt-8 flex gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Testimonial ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === i ? "w-8 bg-gold" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
      </section>

      <div className="mt-14 text-center">
        <Link
          to="/contact"
          className="inline-flex h-13 items-center rounded-lg bg-primary px-10 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Talk to an advisor
        </Link>
      </div>
    </div>
  );
}
