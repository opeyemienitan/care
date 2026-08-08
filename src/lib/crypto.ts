import crypto from "crypto";

// In production, set SESSION_SECRET (e.g. `openssl rand -hex 32`). Falls back
// to a fixed dev-only value so local development works with zero setup —
// but sessions signed with the dev secret should never be trusted in prod.
const SECRET =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        console.warn(
          "[marram-care] SESSION_SECRET is not set in production — using an insecure default. Set SESSION_SECRET in your environment."
        );
        return "marram-care-dev-secret-change-in-production";
      })()
    : "marram-care-dev-secret-change-in-production");

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(8).toString("hex");
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const check = crypto.scryptSync(password, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(check));
}

export function sign(value: string): string {
  const h = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${h}`;
}

export function unsign(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  if (sig.length !== expected.length) return null;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? value : null;
}

export function generateReferralCode(name: string): string {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${initials || "CB"}-${random}`;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
