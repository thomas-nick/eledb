import { sanctuaries } from "./sanctuaries";

export const populationStats = [
  {
    value: "~52,000",
    label: "Wild Asian Elephants",
    description: "Across 13 range states",
  },
  {
    value: "13",
    label: "Range States",
    description: "India to Indonesia",
  },
  {
    value: `${sanctuaries.length}+`,
    label: "Camps & Sanctuaries",
    description: "In our directory",
  },
  {
    value: "5",
    label: "Wild Corridors",
    description: "Tracked on the map",
  },
];

export const fundraisingMilestones = [
  { month: "Jan", amount: 120000 },
  { month: "Feb", amount: 185000 },
  { month: "Mar", amount: 240000 },
  { month: "Apr", amount: 310000 },
  { month: "May", amount: 420000 },
  { month: "Jun", amount: 535000 },
];

export const donationTiers = [
  { id: "seedling", name: "Seedling", amount: 25, description: "Fund a week of ranger patrols in a critical corridor" },
  { id: "guardian", name: "Guardian", amount: 100, description: "Support a month of beehive fence maintenance" },
  { id: "steward", name: "Steward", amount: 250, description: "Support field research and ranger patrols" },
  { id: "champion", name: "Champion", amount: 500, description: "Help secure one hectare of corridor land" },
  { id: "patron", name: "Patron", amount: 1000, description: "Fund a complete coexistence hotspot program" },
];
