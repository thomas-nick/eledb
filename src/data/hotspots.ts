export interface Hotspot {
  id: string;
  name: string;
  country: string;
  countryId: string;
  lat: number;
  lng: number;
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
    lat: 26.2,
    lng: 91.75,
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
    lat: 12.05,
    lng: 99.65,
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
    lat: 7.45,
    lng: 80.55,
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
    lat: 28.2,
    lng: 81.5,
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
    lat: -5.05,
    lng: 105.55,
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
    lat: 13.0,
    lng: 76.1,
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
    label: "India–Nepal",
    path: [
      [26.5, 84.5],
      [27.2, 83.2],
      [28.0, 81.5],
    ] as [number, number][],
  },
  {
    id: "corridor-2",
    label: "Myanmar–Thailand",
    path: [
      [19.0, 97.5],
      [17.5, 98.0],
      [16.0, 98.5],
    ] as [number, number][],
  },
  {
    id: "corridor-3",
    label: "Thailand–Malaysia",
    path: [
      [6.8, 100.2],
      [5.8, 100.8],
      [4.5, 101.2],
    ] as [number, number][],
  },
  {
    id: "corridor-4",
    label: "Malaysia–Sumatra",
    path: [
      [2.2, 102.0],
      [1.2, 103.0],
      [0.5, 104.0],
    ] as [number, number][],
  },
  {
    id: "corridor-5",
    label: "Sri Lanka corridor",
    path: [
      [7.5, 80.2],
      [7.3, 80.8],
      [7.0, 81.2],
    ] as [number, number][],
  },
];
