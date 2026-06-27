import type { Instrumentation } from "next";

function mysqlEnvConfigured(): boolean {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_DATABASE &&
      process.env.MYSQL_HOST !== "disabled"
  );
}

/** Load `.env.production` for any vars missing from hPanel (e.g. MYSQL_*). */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.AUTH_SECRET && mysqlEnvConfigured()) return;

  const { config } = await import("dotenv");
  const { resolve } = await import("node:path");
  config({ path: resolve(process.cwd(), ".env.production") });
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
