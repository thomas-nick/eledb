import { mapPaths, mapLabels } from "./mapGeometry";

export interface RangeState {
  id: string;
  name: string;
  shortName: string;
  population: number;
  populationTrend: "declining" | "stable" | "increasing";
  hecIncidents: number;
  svgPath: string;
  label: { x: number; y: number; anchor?: "start" | "middle" | "end" };
}

export const rangeStates: RangeState[] = [
  {
    id: "india",
    name: "India",
    shortName: "India",
    population: 29964,
    populationTrend: "stable",
    hecIncidents: 2400,
    svgPath: mapPaths.india,
    label: mapLabels.india,
  },
  {
    id: "nepal",
    name: "Nepal",
    shortName: "Nepal",
    population: 121,
    populationTrend: "increasing",
    hecIncidents: 85,
    svgPath: mapPaths.nepal,
    label: mapLabels.nepal,
  },
  {
    id: "bhutan",
    name: "Bhutan",
    shortName: "Bhutan",
    population: 651,
    populationTrend: "stable",
    hecIncidents: 12,
    svgPath: mapPaths.bhutan,
    label: mapLabels.bhutan,
  },
  {
    id: "bangladesh",
    name: "Bangladesh",
    shortName: "Bangladesh",
    population: 268,
    populationTrend: "declining",
    hecIncidents: 45,
    svgPath: mapPaths.bangladesh,
    label: mapLabels.bangladesh,
  },
  {
    id: "sri-lanka",
    name: "Sri Lanka",
    shortName: "Sri Lanka",
    population: 5913,
    populationTrend: "stable",
    hecIncidents: 320,
    svgPath: mapPaths.sriLanka,
    label: mapLabels["sri-lanka"],
  },
  {
    id: "myanmar",
    name: "Myanmar",
    shortName: "Myanmar",
    population: 2000,
    populationTrend: "declining",
    hecIncidents: 180,
    svgPath: mapPaths.myanmar,
    label: mapLabels.myanmar,
  },
  {
    id: "thailand",
    name: "Thailand",
    shortName: "Thailand",
    population: 3500,
    populationTrend: "stable",
    hecIncidents: 210,
    svgPath: mapPaths.thailand,
    label: mapLabels.thailand,
  },
  {
    id: "laos",
    name: "Laos",
    shortName: "Laos",
    population: 500,
    populationTrend: "declining",
    hecIncidents: 35,
    svgPath: mapPaths.laos,
    label: mapLabels.laos,
  },
  {
    id: "cambodia",
    name: "Cambodia",
    shortName: "Cambodia",
    population: 400,
    populationTrend: "declining",
    hecIncidents: 28,
    svgPath: mapPaths.cambodia,
    label: mapLabels.cambodia,
  },
  {
    id: "vietnam",
    name: "Vietnam",
    shortName: "Vietnam",
    population: 100,
    populationTrend: "declining",
    hecIncidents: 15,
    svgPath: mapPaths.vietnam,
    label: mapLabels.vietnam,
  },
  {
    id: "malaysia",
    name: "Malaysia",
    shortName: "Malaysia",
    population: 1500,
    populationTrend: "declining",
    hecIncidents: 95,
    svgPath: mapPaths.malaysia,
    label: mapLabels.malaysia,
  },
  {
    id: "indonesia",
    name: "Indonesia (Sumatra)",
    shortName: "Sumatra",
    population: 2400,
    populationTrend: "declining",
    hecIncidents: 120,
    svgPath: mapPaths.indonesia,
    label: mapLabels.indonesia,
  },
  {
    id: "china",
    name: "China (Yunnan)",
    shortName: "Yunnan",
    population: 300,
    populationTrend: "increasing",
    hecIncidents: 8,
    svgPath: mapPaths.china,
    label: mapLabels.china,
  },
];

export const totalPopulation = rangeStates.reduce((sum, s) => sum + s.population, 0);

export const trendColors = {
  declining: { fill: "#a85d42", hover: "#8f4a32" },
  stable: { fill: "#1a3a2a", hover: "#2d5a42" },
  increasing: { fill: "#3d6b52", hover: "#4a8264" },
} as const;
