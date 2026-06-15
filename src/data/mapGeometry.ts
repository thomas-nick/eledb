export const MAP_VIEWBOX = "0 0 800 520";

/** Stylized South & Southeast Asia — readable geography without Mapbox */
export const mapPaths = {
  india:
    "M 88 158 L 168 138 L 248 142 L 268 178 L 262 218 L 228 252 L 198 292 L 172 312 L 148 302 L 128 262 L 108 218 L 92 182 Z",
  nepal: "M 218 118 L 248 112 L 256 140 L 224 146 Z",
  bhutan: "M 256 114 L 284 108 L 292 134 L 262 140 Z",
  bangladesh: "M 262 162 L 296 154 L 304 188 L 268 196 Z",
  sriLanka: "M 168 322 L 192 316 L 200 346 L 176 352 Z",
  myanmar:
    "M 298 98 L 372 88 L 386 132 L 378 188 L 362 248 L 332 278 L 298 268 L 282 220 L 286 158 Z",
  china:
    "M 372 88 L 448 78 L 458 118 L 432 142 L 388 132 Z",
  thailand:
    "M 328 238 L 392 228 L 402 272 L 382 304 L 342 300 L 322 268 Z",
  laos: "M 392 192 L 442 184 L 452 232 L 432 262 L 402 254 L 394 218 Z",
  cambodia: "M 428 268 L 472 260 L 480 298 L 438 306 Z",
  vietnam:
    "M 444 168 L 492 158 L 506 212 L 498 268 L 478 306 L 458 296 L 448 244 L 442 200 Z",
  malaysia:
    "M 348 302 L 404 292 L 414 336 L 388 368 L 348 362 L 336 328 Z",
  indonesia:
    "M 308 378 L 398 368 L 412 408 L 398 448 L 328 458 L 302 418 Z",
} as const;

export const mapLabels: Record<string, { x: number; y: number; anchor?: "start" | "middle" | "end" }> = {
  india: { x: 175, y: 220, anchor: "middle" },
  nepal: { x: 238, y: 132, anchor: "middle" },
  bhutan: { x: 276, y: 126, anchor: "middle" },
  bangladesh: { x: 284, y: 178, anchor: "middle" },
  "sri-lanka": { x: 184, y: 338, anchor: "middle" },
  myanmar: { x: 332, y: 185, anchor: "middle" },
  china: { x: 418, y: 112, anchor: "middle" },
  thailand: { x: 362, y: 272, anchor: "middle" },
  laos: { x: 422, y: 228, anchor: "middle" },
  cambodia: { x: 454, y: 286, anchor: "middle" },
  vietnam: { x: 478, y: 238, anchor: "middle" },
  malaysia: { x: 374, y: 338, anchor: "middle" },
  indonesia: { x: 355, y: 418, anchor: "middle" },
};

export const regionLabels = [
  { text: "South Asia", x: 175, y: 95 },
  { text: "Southeast Asia", x: 400, y: 95 },
  { text: "Indian Ocean", x: 120, y: 400 },
  { text: "Bay of Bengal", x: 280, y: 280 },
];
