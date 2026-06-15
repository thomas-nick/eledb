export interface Hotspot {
  id: string;
  name: string;
  country: string;
  countryId: string;
  x: number;
  y: number;
  technique: string;
  techniqueType: "bio-fencing" | "early-warning" | "community" | "habitat";
  description: string;
  impact: string;
  yearStarted: number;
  communitySize: number;
}

export const hotspots: Hotspot[] = [
  {
    id: "assam-beehive",
    name: "Assam Beehive Fencing",
    country: "India",
    countryId: "india",
    x: 248,
    y: 168,
    technique: "Beehive Fencing",
    techniqueType: "bio-fencing",
    description:
      "Communities in Assam installed beehive fences along 12km of farmland borders. Elephants avoid the hives, and farmers harvest honey as an additional income source.",
    impact: "92% reduction in crop raids across 8 villages",
    yearStarted: 2018,
    communitySize: 2400,
  },
  {
    id: "chili-thailand",
    name: "Chili Fence Initiative",
    country: "Thailand",
    countryId: "thailand",
    x: 368,
    y: 268,
    technique: "Chili Fencing",
    techniqueType: "bio-fencing",
    description:
      "Rope fences soaked in chili-garlic paste create a sensory barrier elephants avoid. Local women's cooperatives maintain the fences and produce the paste.",
    impact: "78% fewer elephant incursions in Kui Buri corridor",
    yearStarted: 2016,
    communitySize: 850,
  },
  {
    id: "sms-sri-lanka",
    name: "SMS Early Warning System",
    country: "Sri Lanka",
    countryId: "sri-lanka",
    x: 186,
    y: 334,
    technique: "SMS Early Warning",
    techniqueType: "early-warning",
    description:
      "Rangers and community scouts send real-time SMS alerts when elephants approach villages. Residents secure livestock and children before elephants arrive.",
    impact: "Zero human fatalities in pilot villages since 2019",
    yearStarted: 2019,
    communitySize: 1200,
  },
  {
    id: "nepal-corridor",
    name: "Terai Arc Corridor",
    country: "Nepal",
    countryId: "nepal",
    x: 236,
    y: 128,
    technique: "Community Forest Corridors",
    techniqueType: "habitat",
    description:
      "Community-managed forest patches connect two national parks, giving elephants safe passage. Locals earn ecotourism income from guided corridor walks.",
    impact: "Connected 3 fragmented herds across 45km corridor",
    yearStarted: 2015,
    communitySize: 5600,
  },
  {
    id: "sumatra-community",
    name: "Human-Elephant Response Units",
    country: "Indonesia",
    countryId: "indonesia",
    x: 358,
    y: 408,
    technique: "Community Response Teams",
    techniqueType: "community",
    description:
      "Trained local teams use noise deterrents and trained mahouts to gently redirect elephants away from plantations, replacing lethal control methods.",
    impact: "65% reduction in retaliatory killings in Way Kambas",
    yearStarted: 2017,
    communitySize: 3200,
  },
  {
    id: "karnataka-solar",
    name: "Solar-Powered Deterrents",
    country: "India",
    countryId: "india",
    x: 188,
    y: 248,
    technique: "Solar Flashing Lights",
    techniqueType: "early-warning",
    description:
      "Solar-powered flashing lights along corridor edges create visual barriers at night. Combined with community watch groups for 24-hour monitoring.",
    impact: "Reduced night raids by 85% in Hassan district",
    yearStarted: 2020,
    communitySize: 980,
  },
];

export const migrationCorridors = [
  {
    id: "corridor-1",
    from: { x: 220, y: 200 },
    to: { x: 236, y: 128 },
    label: "India-Nepal",
  },
  {
    id: "corridor-2",
    from: { x: 332, y: 185 },
    to: { x: 362, y: 272 },
    label: "Myanmar-Thailand",
  },
  {
    id: "corridor-3",
    from: { x: 362, y: 272 },
    to: { x: 374, y: 338 },
    label: "Thailand-Malaysia",
  },
  {
    id: "corridor-4",
    from: { x: 374, y: 338 },
    to: { x: 355, y: 418 },
    label: "Malaysia-Sumatra",
  },
  {
    id: "corridor-5",
    from: { x: 186, y: 334 },
    to: { x: 200, y: 240 },
    label: "Sri Lanka corridor",
  },
];
