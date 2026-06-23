import { mkdir, readFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const DEFAULT_UPLOAD_DIR = "uploads";

export function getUploadDir(): string {
  const configured = process.env.UPLOAD_DIR;
  if (configured) return configured;
  return path.join(/* turbopackIgnore: true */ process.cwd(), DEFAULT_UPLOAD_DIR);
}

export function publicUploadUrl(relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, "");
  return `/api/uploads/${normalized}`;
}

export function resolveUploadPath(...segments: string[]): string {
  const base = getUploadDir();
  const resolved = path.resolve(base, ...segments);
  if (!resolved.startsWith(path.resolve(base))) {
    throw new Error("Invalid upload path");
  }
  return resolved;
}

export async function processAndSavePhoto(
  file: File,
  elephantId: string
): Promise<{ filePath: string; publicUrl: string }> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 8MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomUUID();
  const relative = path.join("elephants", elephantId, `${id}.webp`);
  const absolute = resolveUploadPath(relative);

  await mkdir(path.dirname(absolute), { recursive: true });

  await sharp(buffer)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(absolute);

  return { filePath: relative.replace(/\\/g, "/"), publicUrl: publicUploadUrl(relative) };
}

export async function readUploadFile(relativePath: string): Promise<Buffer> {
  const absolute = resolveUploadPath(relativePath);
  return readFile(absolute);
}

export async function deleteUploadFile(relativePath: string): Promise<void> {
  try {
    const absolute = resolveUploadPath(relativePath);
    await unlink(absolute);
  } catch {
    // file may already be gone
  }
}

export function uploadContentType(filePath: string): string {
  if (filePath.endsWith(".webp")) return "image/webp";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}
