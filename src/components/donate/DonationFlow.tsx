"use client";

import { useState, Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FundraisingChart } from "@/components/donate/FundraisingChart";
import { donationTiers } from "@/data/stats";
import { formatCurrency } from "@/lib/utils";

type Step = "amount" | "details" | "confirmation";
type Frequency = "one-time" | "monthly";

function DonationFlowInner() {
  const [step, setStep] = useState<Step>("amount");
  const [frequency, setFrequency] = useState<Frequency>("one-time");
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const finalAmount = customAmount ? parseInt(customAmount) || amount : amount;

  function handleConfirm() {
    setStep("confirmation");
  }

  if (step === "confirmation") {
    return (
      <Container size="narrow">
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif text-3xl font-bold text-forest mb-2">
            Thank You, {name || "Friend"}!
          </h2>
          <p className="text-muted mb-2">
            Your {frequency === "monthly" ? "monthly" : "one-time"} contribution of{" "}
            <strong className="text-forest">{formatCurrency(finalAmount)}</strong> has been
            recorded.
          </p>
          <Badge variant="warning" className="mb-8">
            Demo only — no payment was processed
          </Badge>

          <div className="mb-8">
            <h3 className="font-serif text-xl font-bold text-forest mb-4">
              2026 Fundraising Progress
            </h3>
            <FundraisingChart />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/corridors" variant="outline">
              View Corridors
            </Button>
            <Button href="/" variant="ghost">
              Back to Home
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="narrow">
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
        <p className="text-sm text-amber-800">
          <strong>Demo Mode:</strong> This is a UI demonstration. No real payment will be processed.
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {(["amount", "details"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s || (step === "details" && s === "amount")
                  ? "bg-forest text-ivory"
                  : "bg-border text-muted"
              }`}
            >
              {i + 1}
            </div>
            <span className="text-sm text-muted capitalize hidden sm:inline">{s}</span>
            {i < 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {step === "amount" && (
        <Card>
          <h2 className="font-serif text-2xl font-bold text-forest mb-6">
            Choose Your Impact
          </h2>

          <div className="flex gap-2 mb-8">
            {(["one-time", "monthly"] as Frequency[]).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                  frequency === f
                    ? "bg-forest text-ivory"
                    : "bg-border/50 text-muted hover:bg-border"
                }`}
              >
                {f === "one-time" ? "One-Time" : "Monthly"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {donationTiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => { setAmount(tier.amount); setCustomAmount(""); }}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  amount === tier.amount && !customAmount
                    ? "border-clay bg-clay/5"
                    : "border-border hover:border-clay/50"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-forest">{tier.name}</span>
                  <span className="font-serif text-xl font-bold text-clay">
                    ${tier.amount}
                  </span>
                </div>
                <p className="text-xs text-muted">{tier.description}</p>
              </button>
            ))}
          </div>

          <div className="mb-8">
            <label className="text-sm font-medium text-forest mb-2 block">
              Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-card text-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
          </div>

          <Button onClick={() => setStep("details")} className="w-full" size="lg">
            Continue — {formatCurrency(finalAmount)}{frequency === "monthly" ? "/mo" : ""}
          </Button>
        </Card>
      )}

      {step === "details" && (
        <Card>
          <h2 className="font-serif text-2xl font-bold text-forest mb-6">
            Your Details
          </h2>

          <div className="space-y-4 mb-8">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-forest mb-1 block">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-forest mb-1 block">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div className="bg-forest/5 rounded-xl p-4 mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Contribution</span>
              <span className="font-semibold text-forest">
                {formatCurrency(finalAmount)}{frequency === "monthly" ? "/month" : ""}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Frequency</span>
              <span className="font-medium text-forest capitalize">{frequency}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setStep("amount")} variant="outline" className="flex-1">
              Back
            </Button>
            <Button onClick={handleConfirm} className="flex-1" size="lg">
              Complete Donation
            </Button>
          </div>
        </Card>
      )}
    </Container>
  );
}

export function DonationFlow() {
  return (
    <Suspense fallback={<Container size="narrow"><Card className="text-center py-12 text-muted">Loading...</Card></Container>}>
      <DonationFlowInner />
    </Suspense>
  );
}
