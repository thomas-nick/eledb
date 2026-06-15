"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1920&q=80"
        alt="Asian elephant in natural habitat"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/70 to-forest/30" />

      <Container className="relative z-10 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <p className="text-clay-light text-sm font-semibold uppercase tracking-widest mb-6">
            Revered Across Asia
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-ivory leading-[1.1]">
            Everything Asian Elephants
          </h1>
          <p className="mt-6 text-lg md:text-xl text-ivory/80 leading-relaxed max-w-xl">
            A resource for people who love Asian elephants — where to see them, how to visit camps 
            and sanctuaries in Thailand and Cambodia, wild corridors worth knowing about, and field 
            notes from across 13 range states.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/sanctuaries" variant="secondary" size="lg">
              Browse Sanctuaries
            </Button>
            <Button href="/corridors" variant="outline" size="lg" className="border-ivory text-ivory hover:bg-ivory hover:text-forest">
              Wild Corridors
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
