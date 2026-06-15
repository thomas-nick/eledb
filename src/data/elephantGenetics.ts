export type DataAccess = "public" | "government" | "research" | "none";

export interface RegistrationSystem {
  id: string;
  name: string;
  purpose: string;
  method: string;
  scope: string;
  access: DataAccess;
  accessNote: string;
  agencies?: string[];
}

export interface PublishedDataset {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: "captive" | "wild" | "both";
  access: "open" | "request";
  url: string;
  summary: string;
}

export interface ResearchInstitution {
  name: string;
  location: string;
  focus: string;
  url?: string;
}

export const registrationSystems: RegistrationSystem[] = [
  {
    id: "microchip-thailand",
    name: "Thai Microchip Registry",
    purpose:
      "Identify individual captive elephants and link them to registration papers — primarily to prevent wild calves from being laundered into tourism with fake captive-born documentation.",
    method: "RFID microchip implanted in the right shoulder, linked to a government registration card.",
    scope: "~3,800+ microchips registered for ~2,900 documented captive elephants (discrepancy itself flagged fraud concerns).",
    access: "government",
    accessNote: "Held by the Department of Livestock Development (DLD). Not searchable by the public.",
    agencies: [
      "Department of Livestock Development (DLD)",
      "Department of Provincial Administration",
      "Department of National Parks (DNP)",
    ],
  },
  {
    id: "dna-captive-thailand",
    name: "Thai Captive Elephant DNA Registry",
    purpose:
      "Verify parentage and origin of captive elephants. Used to catch cases where camps claim wild-caught juveniles are captive-born — DNA proved mismatches have already been documented.",
    method: "Blood samples analyzed for microsatellite DNA fingerprints. Parentage verified against claimed mother/father.",
    scope: "Mandatory for captive elephants since 2017 legislation. ~99% of documented captive population enrolled by late 2010s.",
    access: "government",
    accessNote:
      "Government enforcement database. Universities (Kasetsart, Chiang Mai) analyze samples but the master registry is not public.",
    agencies: ["DLD", "Kasetsart University", "Chiang Mai University Vet School"],
  },
  {
    id: "dna-wild-fecal",
    name: "Wild Elephant Genetics (Fecal DNA)",
    purpose:
      "Track wild herds without disturbing them — individual identification, family structure, migration routes, inbreeding risk, corridor use.",
    method: "Non-invasive fecal sampling along migration routes. Microsatellite genotyping creates genetic fingerprints from dung.",
    scope: "Fragmented projects across range states. No unified public database exists.",
    access: "research",
    accessNote:
      "Individual study datasets sometimes published on Dryad or in papers. No live public portal to query wild herd genetics.",
    agencies: ["DNP", "WWF", "University research labs"],
  },
  {
    id: "asean-registry",
    name: "ASEAN Captive Elephant Registry (proposed)",
    purpose:
      "Cross-border standardized registration with microchips, DNA, and photo ID — to combat illegal trade across range states.",
    method: "Microchip + DNA + photographic identification, shared via centralized database.",
    scope: "Proposed by FAO and Asian Elephant Specialist Group. Indonesia piloting via Asian Elephant SAFE / Species360.",
    access: "none",
    accessNote: "Does not fully exist yet. No public ASEAN-wide searchable registry as of 2025.",
    agencies: ["ASEAN Captive Elephant Working Group", "Asian Elephant SAFE"],
  },
];

export const thailandElephantAgencies = [
  {
    name: "Department of Livestock Development (DLD)",
    role: "Microchip implantation, health monitoring, movement permits, DNA sample collection for captive elephants.",
  },
  {
    name: "Department of Provincial Administration",
    role: "Registration of domesticated elephants under the Draught Animals Act (1939). Issues ownership papers.",
  },
  {
    name: "Department of National Parks (DNP)",
    role: "Wild elephant protection, DNA sampling of wild populations, anti-trafficking enforcement.",
  },
  {
    name: "National Elephant Institute (NEI), Lampang",
    role: "Government facility for confiscated/unregistered elephants. Royal white elephant tradition. Mahout training school.",
  },
  {
    name: "Chiang Mai University — Center of Elephant and Wildlife Health",
    role: "Elephant Genetics in Thailand project. Blood and fecal DNA analysis. Research partnerships with camps.",
    url: "https://www.asianelephantresearch.com/elephant-genetics/",
  },
];

export interface DataAvailabilityRow {
  data: string;
  holder: string;
  public: boolean | "partial";
  notes: string;
}

export const dataAvailability: DataAvailabilityRow[] = [
  {
    data: "Microchip numbers & registration cards",
    holder: "DLD / Interior Ministry",
    public: false,
    notes: "Operational government data. Used for enforcement, not research.",
  },
  {
    data: "Captive DNA fingerprints (parentage)",
    holder: "DLD + universities",
    public: false,
    notes: "Proved trafficking cases internally. Not released as open data.",
  },
  {
    data: "Wild fecal DNA genotypes",
    holder: "DNP + research labs",
    public: false,
    notes: "Study-by-study. Some published, no central query system.",
  },
  {
    data: "Published research genotypes",
    holder: "Universities / Dryad / GenBank",
    public: true,
    notes: "Tied to specific papers. Searchable on Dryad, NCBI, Semantic Scholar.",
  },
  {
    data: "Species360 / zoo records",
    holder: "Zoos & some ASEAN pilots",
    public: false,
    notes: "Institutional access only. Indonesia enhancing national registry.",
  },
  {
    data: "Corridor & habitat GIS layers",
    holder: "WWF, NGOs, governments",
    public: "partial" as const,
    notes: "Some WWF/GFW layers public. Fine-scale corridor maps often restricted.",
  },
];

export const publishedDatasets: PublishedDataset[] = [
  {
    id: "kasetsart-breeding",
    title: "Standard Identification Certificate for Thai Domestic Elephant Gene Pool",
    authors: "Kasetsart University et al.",
    year: 2022,
    type: "captive",
    access: "open",
    url: "https://www.mdpi.com/2071-1050/14/22/15355",
    summary:
      "Microsatellite genotyping of 158 captive elephants across NEI, Maetaeng, and Baan Chang camps. Genotype data deposited on Dryad. Focused on breeding line certification.",
  },
  {
    id: "fecal-identification-2025",
    title: "Non-invasive DNA-based Individual Identification in Thai Elephants",
    authors: "Chiang Mai University / Kasetsart (PMC, 2025)",
    year: 2025,
    type: "both",
    access: "open",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12068619/",
    summary:
      "Develops standardized microsatellite panels for blood and fecal samples. Argues Thailand needs a comprehensive reference database — which doesn't yet exist publicly.",
  },
  {
    id: "dryad-thai-captive",
    title: "Thai Captive Elephant Microsatellite Genotypes (Dryad)",
    authors: "Srikulnath et al.",
    year: 2022,
    type: "captive",
    access: "open",
    url: "https://datadryad.org",
    summary:
      "One of the few open genotype datasets from Thai captive elephants. Linked to MDPI sustainability paper on gene pool legislation.",
  },
];

export const geneticsMethods = {
  blood: {
    title: "Blood DNA (Captive / Regulatory)",
    usedFor: "Government registration, parentage verification, anti-trafficking enforcement.",
    pros: ["High DNA yield", "Reliable genotyping", "Required for legal compliance in Thailand"],
    cons: ["Invasive — requires vet and restraint", "Stressful for elephant", "Not suitable for wild monitoring"],
    context:
      "When government vet teams visit camps (including places like WFFT or tourist facilities), they're usually collecting blood for the national DNA registry — not research on your behalf.",
  },
  fecal: {
    title: "Fecal DNA (Wild / Research)",
    usedFor: "Wild population surveys, corridor use, dispersal tracking, inbreeding assessment — without ever touching the animal.",
    pros: ["Completely non-invasive", "Works for wild elephants", "Maps migration and gene flow"],
    cons: [
      "DNA degrades quickly in tropical heat",
      "Needs fresh samples and careful lab work",
      "Genotyping errors (allelic dropout) can inflate population counts if markers are insufficient",
    ],
    context:
      "This is the science behind corridor prioritization — proving a bull crossed 80km of farmland, or that two isolated herds haven't shared genes in three generations.",
  },
  microchip: {
    title: "Microchip (ID Only)",
    usedFor: "Individual identification linked to paperwork. Not genetics — just a unique number.",
    pros: ["Quick field ID", "Links to registration database", "Standard across ASEAN discussions"],
    cons: [
      "Chips can be transferred between elephants (documented problem in Thailand)",
      "Says nothing about genetics, health, or wild origin without paired DNA",
      "Doesn't work for wild elephants you can't approach",
    ],
    context:
      "Thailand reportedly had more registered microchips than living elephants at one point — which is why DNA was layered on top. Chip alone isn't enough.",
  },
};

export const scienceProcess = [
  {
    step: 1,
    title: "Field Collection",
    description:
      "Rangers or researchers identify fresh dung piles along known migration routes, or vets collect blood at registered camps during government compliance visits.",
  },
  {
    step: 2,
    title: "Lab Analysis",
    description:
      "Samples genotyped at university labs (Kasetsart, Chiang Mai) using microsatellite markers — 10–20+ loci to fingerprint individuals.",
  },
  {
    step: 3,
    title: "Parentage & Identity",
    description:
      "For captive elephants: DNA matched against claimed parents to catch laundering. For wild: individual IDs built over time from repeated fecal samples.",
  },
  {
    step: 4,
    title: "Conservation Use",
    description:
      "Findings inform corridor purchases, identify genetically isolated herds, guide anti-trafficking cases — but mostly stay in government or academic systems, not public dashboards.",
  },
];

export const honestDisclaimer = {
  title: "What doesn't exist yet",
  points: [
    "No public website where you can look up an elephant's DNA profile or microchip number.",
    "No live 'sponsor a kit and track your herd' portal — that's a concept, not a product anyone ships today.",
    "No unified ASEAN database across all 13 range states.",
    "Wild fecal DNA data is powerful but fragmented — published study by study, not queryable in real time.",
  ],
  closing:
    "The science is real and the government infrastructure in Thailand is further along than most countries. The gap is transparency and public access — which is exactly why corridors and genetics deserve more attention than they get.",
};
