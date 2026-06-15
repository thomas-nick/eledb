import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DonationFlow } from "@/components/donate/DonationFlow";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Demo donation flow — UI only, no real payments processed.",
};

export default function DonatePage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-forest text-ivory">
        <Container>
          <SectionHeading
            eyebrow="Demo"
            title="Support Conservation Work"
            description="This is a UI demonstration only — no real payment is processed. For real corridor and genetics context, see the Corridors page."
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <DonationFlow />
      </section>
    </>
  );
}
