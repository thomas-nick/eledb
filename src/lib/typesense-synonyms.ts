import type { Client } from "typesense";
import type { SynonymItemSchema } from "typesense/lib/Typesense/SynonymSets";
import { MAHOOT_SYNONYM_SET } from "@/lib/typesense";

/** Synonym items for the shared mahoot synonym set (Typesense v30+). */
const SYNONYM_ITEMS: SynonymItemSchema[] = [
  { id: "elephant-variants", synonyms: ["elephant", "elephants", "elefant", "elefants"] },
  { id: "camp-facility", synonyms: ["camp", "camps", "sanctuary", "sanctuaries", "kraal", "facility"] },
  { id: "enp-alias", root: "Elephant Nature Park", synonyms: ["ENP", "elephant nature park", "elefant nature"] },
  { id: "thailand-alias", root: "Thailand", synonyms: ["Siam", "Thai"] },
  { id: "chip-alias", synonyms: ["chip", "chip id", "microchip", "rfid"] },
];

export async function upsertTypesenseSynonyms(client: Client): Promise<void> {
  try {
    await client.synonymSets(MAHOOT_SYNONYM_SET).upsert({ items: SYNONYM_ITEMS });
    console.log(`Upserted synonym set "${MAHOOT_SYNONYM_SET}" (${SYNONYM_ITEMS.length} items)`);
  } catch (err) {
    console.warn("Synonym set upsert failed (search still works without synonyms):", err);
  }
}
