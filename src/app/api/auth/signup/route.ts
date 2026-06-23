import { NextResponse } from "next/server";
import { createCredentialsUser } from "@/lib/auth-db";
import { isMysqlConfigured } from "@/lib/elephant-db";

export async function POST(request: Request) {
  if (!isMysqlConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const name = body.name ? String(body.name).trim() : undefined;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const user = await createCredentialsUser({ email, password, name });
    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
