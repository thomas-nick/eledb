export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: "field-notes" | "science" | "community" | "policy";
  author: string;
  date: string;
  readTime: number;
  image: string;
  content: string[];
}

export const articles: Article[] = [
  {
    slug: "mahouts-and-culture-thailand",
    title: "Mahouts, Sacred Elephants, and What Western Tourists Get Wrong",
    excerpt:
      "In Thailand, elephants aren't just animals — they're cultural icons. A look at mahout tradition, why feeding and bathing isn't what you think, and how camps actually survive.",
    category: "field-notes",
    author: "Field Notes",
    date: "2026-06-01",
    readTime: 7,
    image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80",
    content: [
      "Walk into any elephant camp in Chiang Mai or Mae Taeng and you'll see mahouts riding their elephants along forest paths. Western tourists often photograph this and post about cruelty. What they're usually seeing is a 60-kilogram man on a 5,000-kilogram animal — a completely different proposition than a person on a horse.",
      "Mahoutship in Thailand is often generational. A father teaches a son; a mahout may care for the same elephant for twenty years. The relationship is closer to partnership than employment. When logging was banned and trekking tourism collapsed, these families didn't have many options. Tourism — including the feeding and bathing that Western guides call 'red flags' — became how elephants get fed.",
      "In Thai culture, the elephant (chang, ช้าง) is sacred. White elephants are royal symbols, tied to the monarchy and Buddhist tradition. The Thai Elephant Conservation Center in Lampang is a royal institution. This isn't a country that treats elephants as disposable entertainment — it's a country with a 4,000-year relationship with these animals that Western frameworks often flatten into a simple good/bad binary.",
      "Places like Patara Elephant Farm outside Chiang Mai keep elephants that were rescued from logging. Visitors bathe and feed them not as a circus trick but as participation in daily care — the same routines mahouts perform every morning. The camp operates on thin margins. The mahout's wage depends on visitors showing up.",
      "That doesn't mean every camp is equal. Some are better than others. Some welfare concerns are real. But the narrative that mahouts don't care — that a Dutch tourist with a conscience understands elephant welfare better than a Karen hill-tribe mahout who's worked with the same animal for fifteen years — doesn't match what you'll see on the ground.",
      "If hands-off observation is your preference, Thailand has excellent options: Phuket Elephant Sanctuary, Boon Lott's, Kindred Spirit. If you want to understand mahout culture firsthand, the hands-on camps offer something those sanctuaries can't. This site lists both, tags them honestly, and lets you decide.",
    ],
  },
  {
    slug: "beehive-fencing-assam",
    title: "How Beehive Fences Are Saving Crops and Elephants in Assam",
    excerpt:
      "In northeastern India, a simple idea — hanging beehives along farm borders — is transforming human-elephant conflict into coexistence.",
    category: "community",
    author: "Dr. Priya Sharma",
    date: "2026-05-15",
    readTime: 8,
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
    content: [
      "The rolling tea gardens and rice paddies of Assam's Golaghat district have long been a flashpoint for human-elephant conflict. Each year, wild elephants emerging from Kaziranga National Park raid crops, and frustrated farmers respond with firecrackers, trenches, and sometimes poison.",
      "But in eight villages along the park's southern boundary, something remarkable has happened. Crop raids have dropped by 92% — not through barriers that harm elephants, but through beehive fences.",
      "The concept is elegantly simple. Elephants have a natural aversion to bees. Researchers at Oxford University first demonstrated this in Kenya, and conservationists in Assam adapted the technique for Asian elephants. Beehives are suspended every 10 meters along a wire fence. When an elephant disturbs the fence, the hives swing and agitate the bees.",
      "What makes the Assam model special is the economic incentive. Farmers don't just protect their crops — they harvest honey. The eight pilot villages produced over 2,400 kg of organic honey last season, generating supplementary income that exceeds what they lost to crop damage in previous years.",
      "Mitali Das, a rice farmer in Difolu village, told us: 'Before the bees, we dreaded November. Now November is honey season.'",
      "The project is scaling. With support from WWF India and state forest department grants, 12 more villages are installing beehive fences this monsoon season. Each fence costs approximately $3,000 to install and serves 15-20 farming families.",
    ],
  },
  {
    slug: "sumatra-genetic-crisis",
    title: "Sumatra's Elephants Face a Genetic Tipping Point",
    excerpt:
      "New DNA analysis reveals that isolated Sumatran herds are just two generations from genetic collapse. Corridors aren't optional — they're urgent.",
    category: "science",
    author: "Dr. Ahmad Wijaya",
    date: "2026-04-22",
    readTime: 12,
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
    content: [
      "Sumatra's elephants are running out of time — not just in terms of habitat loss, but at the genetic level. Our latest analysis of fecal DNA samples from the Way Kambas population reveals heterozygosity levels that are among the lowest ever recorded in any elephant population.",
      "Using microsatellite markers, we fingerprinted 18 individuals from the Lampung herd. The results are sobering: effective population size is estimated at just 12 breeding adults, and we detected signatures of inbreeding depression in two calves.",
      "This isn't surprising when you look at the map. The Lampung herd is isolated in a forest fragment of approximately 1,300 square kilometers, cut off from the larger Riau population by a 40-kilometer gap of palm oil plantations and settlements.",
      "Without a genetic connection to the Riau herd within the next 5-10 years, the Lampung population will likely experience what conservation biologists call an extinction vortex — declining fertility, increased calf mortality, and eventual population collapse.",
      "The Bukit Tigapuluh Wildlife Corridor is the single most important conservation action we can take. Securing even 2,400 of the 8,000 hectares needed would create a narrow but viable genetic bridge. Our models suggest this would increase effective population size from 12 to approximately 45 within two elephant generations.",
      "Fecal DNA monitoring — the same non-invasive method used across the range — is how researchers will know if a corridor connection is working. When gene flow shows up between previously isolated herds, that's proof the land bridge is doing more than protecting habitat.",
    ],
  },
  {
    slug: "tourist-guide-ethical-elephants",
    title: "Choosing an Elephant Experience in Thailand & Cambodia",
    excerpt:
      "Hands-on or hands-off? Wild safari or mahout culture? A practical guide to experience types — with welfare tags if you want them, no lecture if you don't.",
    category: "field-notes",
    author: "Sarah Chen",
    date: "2026-03-10",
    readTime: 6,
    image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80",
    content: [
      "You've booked Thailand or Cambodia. You want to see elephants. The internet will give you a hundred conflicting opinions — most from people who've never been.",
      "Start with what you actually want. If you want to feed, bathe, and walk alongside elephants, hands-on camps are the right fit — and they're how many Thai families keep their animals fed since logging work ended. If you want zero contact, observation-only sanctuaries like Phuket Elephant Sanctuary or Boon Lott's exist and are excellent. If you want wild elephants, national park safaris in Minneriya or Kui Buri are the real deal.",
      "Western welfare frameworks (WAP, ACES) are useful reference points if hands-off matters to you. They're one perspective — often from organizations that have never paid a mahout's wage. We tag them on our directory so you can filter for them without treating them as gospel.",
      "Questions worth asking any camp directly: How many hours do elephants spend foraging vs. in visitor sessions? Are elephants chained overnight? Is there a vet on staff? What's the mahout-to-elephant ratio? The answers matter more than the marketing word 'sanctuary.'",
      "Riding is a separate question from bathing. A mahout riding to steer on a forest path is traditional practice — different from tourist riding circuits. If that distinction matters to you, look for camps tagged 'mahout culture' rather than 'hands-on tourism.'",
      "Our directory tags every listing by experience type. Use the finder tool, filter by country, and read the local context notes. Then book what fits your trip — not what fits someone else's conscience.",
    ],
  },
  {
    slug: "sms-warning-sri-lanka",
    title: "Zero Fatalities: How SMS Alerts Are Saving Lives in Sri Lanka",
    excerpt:
      "A simple text message system has eliminated human fatalities from elephant encounters in 14 Sri Lankan villages.",
    category: "community",
    author: "Nimal Perera",
    date: "2026-02-18",
    readTime: 7,
    image: "https://images.unsplash.com/photo-1581349485608-946aab6fcef7?w=800&q=80",
    content: [
      "Sri Lanka has one of the highest rates of human-elephant conflict in Asia. With 5,900 elephants sharing an island with 22 million people, encounters are inevitable. For decades, the response was reactive — and often deadly for both humans and elephants.",
      "In 2019, a coalition of wildlife officials, telecom companies, and community leaders launched a deceptively simple intervention: an SMS early warning system.",
      "Here's how it works. Community scouts and park rangers patrol known elephant corridors. When elephants are detected approaching a village — typically 2-3 hours before arrival — they send a coded SMS to a village contact list. The message includes the elephant's approximate location, group size, and estimated arrival time.",
      "Villagers then secure livestock in reinforced enclosures, ensure children are indoors, and remove food attractants from outdoor areas. Park rangers are simultaneously dispatched to monitor the elephants' passage.",
      "The results speak for themselves. In 14 pilot villages across the Anuradhapura and Polonnaruwa districts, there have been zero human fatalities since the system launched. Elephant deaths from retaliatory action have dropped by 73%.",
      "The system costs approximately $200 per village per year to maintain — mostly mobile credit for scouts and basic training. Scaling to all high-conflict villages in Sri Lanka would cost less than $50,000 annually.",
      "Technology doesn't have to be complex to be transformative. Sometimes, the most powerful conservation tool is a text message.",
    ],
  },
];

export const categoryLabels: Record<Article["category"], string> = {
  "field-notes": "Field Notes",
  science: "Science",
  community: "Community",
  policy: "Policy",
};
