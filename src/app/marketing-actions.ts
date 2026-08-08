"use server";

import { redirect } from "next/navigation";
import { run, get, id, nowIso } from "@/lib/db";

export async function subscribeLeadAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const source = String(formData.get("source") || "unknown");
  const redirectTo = String(formData.get("redirectTo") || "/");
  const roleRaw = String(formData.get("role") || "UNSPECIFIED");
  const role = roleRaw === "FAMILY" || roleRaw === "PROFESSIONAL" ? roleRaw : "UNSPECIFIED";

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valid) {
    redirect(`${redirectTo}?subscribed=error`);
  }

  const existing = await get("SELECT id FROM leads WHERE email = $email AND source = $source", { email, source });
  if (!existing) {
    await run(`INSERT INTO leads (id, email, role, source, created_at) VALUES ($id, $email, $role, $source, $createdAt)`, {
      id: id("lead"),
      email,
      role,
      source,
      createdAt: nowIso(),
    });
  }

  redirect(`${redirectTo}?subscribed=true`);
}
