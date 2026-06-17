/**
 * Manual elephant.se ID overrides when auto-match fails.
 * Key: `source:slug` or `source:normalized-name`
 * Empty string = intentionally unlinked (not on elephant.se yet).
 */
export const manualElephantIdOverrides: Record<string, string> = {
  // ENP — not on elephant.se
  "elephant-nature-park:manao-มะนาว": "",
  "elephant-nature-park:warunee": "",

  "elephant-nature-park:diploh": "11700",
  "elephant-nature-park:thong-suk-jungle-boy-ทองสุข": "1232",
  "elephant-nature-park:mae-baitoey-แม่ใบเตย": "4366",
  "elephant-nature-park:kaavan": "2269",

  // Phuket
  "phuket-elephant-sanctuary:ampan": "5404",
  "phuket-elephant-sanctuary:fah-mui": "11844",

  // Wildlife SOS
  "wildlife-sos:phoolkali": "13307",
};
