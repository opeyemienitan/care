/**
 * File storage adapter.
 *
 * Mock/dev mode (default): uploaded bytes are written to a private local
 * directory (data/uploads/) — NOT under /public, so nothing is served
 * unless it goes through the access-controlled route at
 * /api/uploads/[...path], which checks the requester owns the document (or
 * is an admin) before streaming the file back. This is a real, working
 * upload pipeline, not a stub — it's just local-disk rather than S3.
 *
 * Production swap-in: set STORAGE_PROVIDER=s3 plus the usual AWS/R2
 * credentials (S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 * or the R2 equivalents) and replace the two functions below with S3
 * PutObject/GetObject (signed URL) calls — the call sites in actions.ts
 * don't need to change, they just call saveUpload()/readUpload().
 *
 * Note: like the local SQLite driver, local disk storage does not persist
 * reliably on Vercel's serverless filesystem — for a real deployment, set
 * STORAGE_PROVIDER=s3 (or R2) before going live. Local mode is for dev only.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "data", "uploads");

export interface SavedUpload {
  storageKey: string;
  originalName: string;
  size: number;
}

export async function saveUpload(file: File, category: string): Promise<SavedUpload> {
  if (process.env.STORAGE_PROVIDER === "s3") {
    throw new Error(
      "STORAGE_PROVIDER=s3 is set but the S3 adapter isn't implemented in this build — see src/lib/storage.ts for the swap-in point."
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeExt = path.extname(file.name).slice(0, 8).replace(/[^a-zA-Z0-9.]/g, "");
  const storageKey = `${category}/${crypto.randomUUID()}${safeExt}`;
  const fullPath = path.join(UPLOAD_ROOT, storageKey);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, bytes);

  return { storageKey, originalName: file.name, size: bytes.length };
}

export async function readUpload(storageKey: string): Promise<Buffer | null> {
  const fullPath = path.join(UPLOAD_ROOT, storageKey);
  const resolved = path.resolve(fullPath);
  if (!resolved.startsWith(path.resolve(UPLOAD_ROOT))) return null; // path traversal guard
  if (!fs.existsSync(resolved)) return null;
  return fs.readFileSync(resolved);
}
