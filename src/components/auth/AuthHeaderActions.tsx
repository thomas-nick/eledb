"use client";

import Link from "next/link";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { isModerator } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function AuthHeaderActions() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return <div className="w-16 h-8 rounded-md bg-slate-100 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-slate-600 hover:text-forest transition-colors"
      >
        Sign in
      </Link>
    );
  }

  const initials =
    session.user.name?.slice(0, 1).toUpperCase() ??
    session.user.email?.slice(0, 1).toUpperCase() ??
    "?";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm hover:border-slate-300"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden sm:inline max-w-[120px] truncate text-slate-700">
          {session.user.name ?? session.user.email}
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <Link
              href="/contributions"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              My contributions
            </Link>
            {isModerator(session.user.role) && (
              <Link
                href="/admin/contributions"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Moderation queue
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className={cn("block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50")}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function GoogleSignInButton({ callbackUrl = "/" }: { callbackUrl?: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      Continue with Google
    </button>
  );
}

/**
 * Google sign-in button plus the "or" divider. Renders only when the Google
 * provider is actually configured on the server, so neither the button (which
 * would error on click) nor an orphaned divider appear when OAuth is unset.
 */
export function GoogleAuthSection({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    getProviders()
      .then((providers) => {
        if (active) setEnabled(Boolean(providers?.google));
      })
      .catch(() => {
        if (active) setEnabled(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <GoogleSignInButton callbackUrl={callbackUrl} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-50 px-2 text-slate-400">or</span>
        </div>
      </div>
    </>
  );
}
