import { cookies } from "next/headers";
import { get, mapUser } from "./db";
import type { User } from "./types";
import { sign, unsign } from "./crypto";
export { hashPassword, verifyPassword } from "./crypto";

const SESSION_COOKIE = "cb_session";

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const userId = unsign(token);
  if (!userId) return null;
  const row = await get("SELECT * FROM users WHERE id = $id", { id: userId });
  return row ? mapUser(row) : null;
}
