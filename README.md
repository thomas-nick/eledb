# Asian Elephant Conservation

A digital resource platform for Asian elephant conservation — connecting community-driven data, immersive education, and direct, transparent action across 13 range states.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

```bash
npm run build   # Production build
npm start       # Serve production build
```

## Architecture

Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. Content is served from typed local data files in `src/data/` — designed as drop-in replacements for a headless CMS.

### Three Pillars

| Pillar | Route | Description |
|--------|-------|-------------|
| A — Coexistence Map | `/coexistence` | Interactive SVG map of 13 range states with migration corridors and coexistence hotspot case studies |
| B — Sanctuary Guide | `/sanctuaries` | Searchable welfare-matrix registry + "Before You Book" decision tree |
| C — Adopt a Corridor | `/corridors` | Corridor funding portal + DNA sampling kit sponsorship |

### Additional Routes

- `/` — Home with hero, stats, pillar overview, latest resources
- `/donate` — UI-only multi-step donation flow (demo mode)
- `/resources` — Editorial field notes and science articles
- `/about` — Mission and 13 range state population table

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                 # Design system primitives
│   ├── layout/             # Header, Footer
│   ├── map/                # RangeMap, HotspotPanel
│   ├── sanctuaries/        # SanctuaryCard
│   ├── corridors/          # CorridorCard, DnaExplainer
│   ├── donate/             # DonationFlow, FundraisingChart
│   ├── home/               # Hero, Stats, PillarCards
│   └── tools/              # DecisionTree
├── data/                   # Typed local data (CMS stand-in)
│   ├── rangeStates.ts
│   ├── hotspots.ts
│   ├── sanctuaries.ts
│   ├── corridors.ts
│   ├── dna.ts
│   ├── articles.ts
│   └── stats.ts
└── lib/
    └── utils.ts
```

## Future Integration Points

### Strapi CMS
Replace imports from `src/data/*.ts` with API calls to Strapi content types:
- `range-state`, `hotspot`, `sanctuary`, `corridor`, `dna-kit`, `article`

Each data file exports typed interfaces — keep these as your API response types.

### Algolia / Typesense
The sanctuary registry (`/sanctuaries`) uses client-side fuzzy search. Swap the filter logic in `src/app/sanctuaries/page.tsx` with an instant search client:

```typescript
// Example: Typesense integration point
const results = await typesenseClient
  .collections("sanctuaries")
  .documents()
  .search({ q: searchQuery, query_by: "name,country,region" });
```

### Stripe Payments
The donation flow (`/donate`) is structured for Stripe Checkout:
1. Replace `handleConfirm()` in `src/components/donate/DonationFlow.tsx` with a server action that creates a Stripe Checkout Session
2. Pass `intent` and `id` query params as metadata for corridor/DNA kit attribution
3. Add a webhook handler at `src/app/api/webhooks/stripe/route.ts` for fulfillment

### Mapbox / MapLibre GIS
The stylized SVG map in `src/components/map/RangeMap.tsx` can be replaced with a real GIS layer. Hotspot coordinates in `src/data/hotspots.ts` are already structured as `{ x, y }` — convert to `{ lat, lng }` for Mapbox.

## Design System

- **Palette:** Forest green (`#1a3a2a`), ivory (`#f7f4ef`), clay (`#c47d5a`)
- **Typography:** Playfair Display (headings) + Source Sans 3 (body)
- **Primitives:** Button, Card, Badge, Stat, SectionHeading, Container in `src/components/ui/`

## License

Built for Asian elephant conservation. All placeholder data is fictional and for demonstration purposes.
