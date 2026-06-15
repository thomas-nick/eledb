export interface Corridor {
  id: string;
  name: string;
  countries: string[];
  description: string;
  hectares: number;
  hectaresSecured: number;
  urgency: "critical" | "high" | "moderate";
  elephantPopulation: number;
  threat: string;
  image: string;
  geneticContext: string;
  organizations: string[];
  status: string;
}

export const corridors: Corridor[] = [
  {
    id: "terai-arc",
    name: "Terai Arc Landscape Corridor",
    countries: ["India", "Nepal"],
    description:
      "An 810km forest landscape connecting protected areas across the India-Nepal border. Would reunite three genetically isolated elephant populations in the Terai.",
    hectares: 12000,
    hectaresSecured: 7200,
    urgency: "critical",
    elephantPopulation: 850,
    threat: "Agricultural expansion and highway construction fragmenting migration routes",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    geneticContext:
      "Fecal DNA studies in the Terai have identified distinct matrilines on either side of the border — corridor connection would restore gene flow documented in pre-fragmentation samples.",
    organizations: ["WWF Terai Arc", "NTNC Nepal", "Wildlife Trust of India"],
    status: "Active — partial securing through community forestry and land purchase",
  },
  {
    id: "kui-buri",
    name: "Kui Buri Forest Corridor",
    countries: ["Thailand"],
    description:
      "Connects Kui Buri National Park to Kaeng Krachan. Elephants need this route for seasonal water access; pineapple plantations block both flanks.",
    hectares: 3500,
    hectaresSecured: 1400,
    urgency: "high",
    elephantPopulation: 320,
    threat: "Pineapple plantations blocking traditional migration paths",
    image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80",
    geneticContext:
      "Kui Buri's ~320 elephants are genetically distinct from the larger Kaeng Krachan population. DNP fecal sampling programs monitor both herds separately.",
    organizations: ["DNP Thailand", "Freeland Foundation", "Local community forestry groups"],
    status: "Community land purchase negotiations ongoing",
  },
  {
    id: "bukit-tigapuluh",
    name: "Bukit Tigapuluh Wildlife Corridor",
    countries: ["Indonesia"],
    description:
      "The last forest bridge between two Sumatran elephant populations in Riau and Jambi provinces. Genetic isolation is already measurable.",
    hectares: 8000,
    hectaresSecured: 2400,
    urgency: "critical",
    elephantPopulation: 180,
    threat: "Palm oil expansion and illegal logging",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
    geneticContext:
      "Way Kambas/Lampung herd shows critically low heterozygosity. Without this corridor, effective breeding population may be below viability within 2–3 elephant generations.",
    organizations: ["WWF Indonesia", "BKSDA Sumatra", "Frankfurt Zoological Society"],
    status: "Critical — palm oil concessions threaten remaining forest bridge",
  },
  {
    id: "western-ghats",
    name: "Western Ghats Elephant Corridor",
    countries: ["India"],
    description:
      "India has identified 88 elephant corridors in the Western Ghats. The Periyar-Agasthyamalai link is among the most important for India's largest tusker population.",
    hectares: 5500,
    hectaresSecured: 3850,
    urgency: "moderate",
    elephantPopulation: 1200,
    threat: "Tea estate expansion and power line construction",
    image: "https://images.unsplash.com/photo-1581349485608-946aab6fcef7?w=800&q=80",
    geneticContext:
      "Long-term fecal DNA monitoring shows male dispersal across corridors when intact — and genetic bottlenecks when blocked by estates.",
    organizations: ["Project Elephant (GoI)", "Wildlife Trust of India", "Nature Conservation Foundation"],
    status: "Partially secured — 88 corridors identified, varying protection levels",
  },
  {
    id: "cardamom-corridor",
    name: "Cardamom Mountain Corridor",
    countries: ["Cambodia", "Thailand"],
    description:
      "Cross-border forest through the Cardamom Mountains. One of the last routes connecting Cambodia's shrinking elephant population with Thailand's western forests.",
    hectares: 15000,
    hectaresSecured: 4500,
    urgency: "high",
    elephantPopulation: 250,
    threat: "Hydropower dam construction and land concessions",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    geneticContext:
      "Cambodia's wild elephant population is small and isolated. Genetic connectivity with Thailand's western populations has not been confirmed in decades.",
    organizations: ["Wildlife Alliance", "Fauna & Flora International", "Mondulkiri Project"],
    status: "Community forest agreements in progress; dam threats active",
  },
];
