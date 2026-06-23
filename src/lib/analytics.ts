/**
 * Lightweight, privacy-friendly analytics wrapper.
 *
 * Events are sent to Plausible (or any API-compatible script) only when
 * `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is configured. With no domain set, `track`
 * is a no-op, so analytics stays opt-in and the app works with zero config.
 */

type PlausibleFn = (
  event: string,
  options?: { props?: Record<string, string | number | boolean> }
) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

export function track(
  event: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Never let analytics break the UI.
  }
}
