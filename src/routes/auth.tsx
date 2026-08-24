import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import crest from "@/assets/logo-crest.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s['next'] === "string" ? s['next'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create Your Account — Success Real Estate" },
      {
        name: "description",
        content:
          "Register with Success Real Estate to save homes, track private tours and receive listing alerts.",
      },
      { property: "og:title", content: "Create Your Account — Success Real Estate" },
      {
        property: "og:description",
        content: "Sign up in seconds to save properties and connect with an advisor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().min(6, "Please enter a valid phone number").max(20),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Enter your password").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { next } = Route.useSearch();
  // Only same-origin relative paths may be used as a post-auth return target.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  const returnUrl = () =>
    safeNext && typeof window !== "undefined" ? window.location.origin + safeNext : undefined;
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (session) {
      if (safeNext) window.location.replace(safeNext);
      else navigate({ to: "/", replace: true });
    }
  }, [session, navigate, safeNext]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: returnUrl ?? window.location.origin,
            data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        setSent(true);
        toast.success("Check your inbox to confirm your email.");
      } else {
        const parsed = signInSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Welcome back.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: returnUrl ?? window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    if (safeNext) window.location.replace(safeNext);
    else navigate({ to: "/", replace: true });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <img src={crest} alt="Success Real Estate crest" width={64} height={64} className="mx-auto h-16 w-16" />
      <h1 className="mt-6 text-center font-display text-4xl">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Save homes, compare listings and book private tours.
      </p>

      {sent ? (
        <div className="mt-10 rounded-xl border border-gold/45 bg-card p-8 text-center">
          <h2 className="font-display text-2xl">Confirm your email</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="text-gold">{form.email}</span>. Click it to
            activate your account, then sign in.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setMode("signin");
            }}
            className="mt-6 text-sm text-gold hover:underline"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-gold/45 bg-card p-6 sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg border border-border p-1">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md py-2 text-sm transition-colors ${
                  mode === m ? "bg-accent text-gold" : "text-muted-foreground hover:text-gold"
                }`}
              >
                {m === "signup" ? "Sign up" : "Sign in"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" ? (
              <>
                <input
                  value={form.fullName}
                  onChange={set("fullName")}
                  placeholder="Full name"
                  autoComplete="name"
                  className="h-12 w-full rounded-lg border border-border bg-background px-4 outline-none focus:border-gold"
                />
                <input
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="Phone number"
                  autoComplete="tel"
                  className="h-12 w-full rounded-lg border border-border bg-background px-4 outline-none focus:border-gold"
                />
              </>
            ) : null}
            <input
              value={form.email}
              onChange={set("email")}
              type="email"
              placeholder="Email address"
              autoComplete="email"
              className="h-12 w-full rounded-lg border border-border bg-background px-4 outline-none focus:border-gold"
            />
            <input
              value={form.password}
              onChange={set("password")}
              type="password"
              placeholder="Password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="h-12 w-full rounded-lg border border-border bg-background px-4 outline-none focus:border-gold"
            />
            <button
              disabled={busy}
              className="h-12 w-full rounded-lg bg-primary text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="h-12 w-full rounded-lg border border-gold/60 text-sm text-gold transition-colors hover:bg-accent disabled:opacity-60"
          >
            Continue with Google
          </button>
        </div>
      )}
    </div>
  );
}
