import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { config } = await import("dotenv");
    const { resolve } = await import("node:path");
    const cwd = process.cwd();

    if (process.env.NODE_ENV === "development") {
      // Local dev: .env.local only (Next.js also loads it; avoid .env.production overriding AUTH_URL etc.)
      config({ path: resolve(cwd, ".env.local") });
    } else {
      // Production: bootstrap from bundled .env.production (overrides hPanel if malformed)
      config({ path: resolve(cwd, ".env.production"), override: true });
    }
  } catch {
    // dotenv/path unavailable — env must come from hPanel
  }
}

/**
 * Captures server-side errors (RSC render, route handlers, server actions).
 * Always logs a structured line; when `ERROR_WEBHOOK_URL` is set it also
 * forwards the error to an external sink. This is the integration point for
 * Sentry or another provider — swap the fetch for the vendor SDK if desired.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  const error = err as Error & { digest?: string };

  console.error("[onRequestError]", {
    message: error.message,
    digest: error.digest,
    stack: error.stack,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  });

  const webhook = process.env.ERROR_WEBHOOK_URL;
  if (!webhook) return;

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        request: { path: request.path, method: request.method },
        context,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Never let error reporting throw inside the error handler.
  }
};
