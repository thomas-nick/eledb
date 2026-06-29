"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { GoogleAuthSection } from "@/components/auth/AuthHeaderActions";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Signup failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      router.push("/login");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container size="narrow" className="py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Join the community catalog on mahoot.xyz.</p>

          <div className="mt-8 space-y-4">
            <GoogleAuthSection />

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-forest focus:ring-1 focus:ring-forest"
                />
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-forest focus:ring-1 focus:ring-forest"
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-forest focus:ring-1 focus:ring-forest"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create account"}
              </button>
            </form>

            <p className="text-sm text-slate-500 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-forest font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
