"use server";

import { redirect } from "next/navigation";
import { run, get, id, nowIso } from "@/lib/db";
import { hashPassword, verifyPassword, generateReferralCode, generateToken } from "@/lib/crypto";
import { setSession, clearSession, getCurrentUser } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { sendEmail } from "@/lib/notifications";
import { SITE_URL } from "@/lib/seo";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h for verification + reset links

export async function signupAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "FAMILY") as Role;

  if (!name || !email || password.length < 6) {
    redirect(`/signup?role=${role}&error=${encodeURIComponent("Please fill in every field (password 6+ characters).")}`);
  }

  const existing = await get("SELECT id FROM users WHERE email = $email", { email });
  if (existing) {
    redirect(`/signup?role=${role}&error=${encodeURIComponent("An account with that email already exists.")}`);
  }

  const refCode = String(formData.get("ref") || "").trim().toUpperCase();
  const referrer = refCode ? await get("SELECT id FROM users WHERE referral_code = $code", { code: refCode }) : undefined;

  const userId = id("usr");
  const verificationToken = generateToken();
  const verificationExpires = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  await run(
    `INSERT INTO users (id, email, password_hash, role, name, referral_code, referred_by, email_verified, verification_token, verification_token_expires, created_at)
     VALUES ($id, $email, $hash, $role, $name, $refCode, $referredBy, 0, $vToken, $vExpires, $createdAt)`,
    {
      id: userId,
      email,
      hash: hashPassword(password),
      role,
      name,
      refCode: generateReferralCode(name),
      referredBy: referrer?.id ?? null,
      vToken: verificationToken,
      vExpires: verificationExpires,
      createdAt: nowIso(),
    }
  );
  await setSession(userId);

  await sendEmail({
    to: email,
    subject: "Verify your Marram Care email address",
    body: `Hi ${name.split(" ")[0]},\n\nWelcome to Marram Care. Please verify your email address:\n\n${SITE_URL}/verify-email?token=${verificationToken}\n\nThis link expires in 24 hours. If you didn't create this account, you can ignore this email.\n\n— Marram Care`,
  });

  if (role === "FAMILY") redirect("/onboarding/family");
  if (role === "AGENCY") redirect("/onboarding/agency");
  redirect("/onboarding/professional");
}

export async function verifyEmailAction(token: string): Promise<"verified" | "expired" | "invalid"> {
  const user = await get("SELECT * FROM users WHERE verification_token = $token", { token });
  if (!user) return "invalid";
  if (user.verification_token_expires && new Date(user.verification_token_expires) < new Date()) {
    return "expired";
  }
  await run(
    "UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = $id",
    { id: user.id }
  );
  return "verified";
}

export async function resendVerificationAction() {
  const current = await getCurrentUser();
  if (!current || current.emailVerified) return;

  const verificationToken = generateToken();
  const verificationExpires = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  await run(
    "UPDATE users SET verification_token = $token, verification_token_expires = $expires WHERE id = $id",
    { id: current.id, token: verificationToken, expires: verificationExpires }
  );
  await sendEmail({
    to: current.email,
    subject: "Verify your Marram Care email address",
    body: `Hi ${current.name.split(" ")[0]},\n\nHere's your verification link again:\n\n${SITE_URL}/verify-email?token=${verificationToken}\n\nThis link expires in 24 hours.\n\n— Marram Care`,
  });
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const user = await get("SELECT * FROM users WHERE email = $email", { email });

  // Always redirect to the same confirmation screen whether or not the email
  // exists, so this endpoint can't be used to enumerate registered accounts.
  if (user) {
    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
    await run("UPDATE users SET reset_token = $token, reset_token_expires = $expires WHERE id = $id", {
      id: user.id,
      token: resetToken,
      expires: resetExpires,
    });
    await sendEmail({
      to: email,
      subject: "Reset your Marram Care password",
      body: `Hi ${user.name.split(" ")[0]},\n\nSomeone requested a password reset for this account. Reset it here:\n\n${SITE_URL}/reset-password?token=${resetToken}\n\nThis link expires in 24 hours. If you didn't request this, you can ignore this email — your password won't change.\n\n— Marram Care`,
    });
  }
  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");

  if (password.length < 6) {
    redirect(`/reset-password?token=${token}&error=${encodeURIComponent("Password must be at least 6 characters.")}`);
  }

  const user = await get("SELECT * FROM users WHERE reset_token = $token", { token });
  if (!user || !user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
    redirect(`/reset-password?token=${token}&error=${encodeURIComponent("This reset link is invalid or has expired. Request a new one.")}`);
  }

  await run("UPDATE users SET password_hash = $hash, reset_token = NULL, reset_token_expires = NULL WHERE id = $id", {
    id: user!.id,
    hash: hashPassword(password),
  });
  redirect("/login?reset=1");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await get("SELECT * FROM users WHERE email = $email", { email });
  if (!user || !verifyPassword(password, user.password_hash)) {
    redirect(`/login?error=${encodeURIComponent("Incorrect email or password.")}`);
  }

  await setSession(user!.id);

  if (user!.role === "ADMIN") redirect("/admin");
  if (user!.role === "FAMILY") {
    const fam = await get("SELECT id FROM family_profiles WHERE user_id = $uid", { uid: user!.id });
    redirect(fam ? "/dashboard/family" : "/onboarding/family");
  } else if (user!.role === "AGENCY") {
    const agency = await get("SELECT id FROM agency_profiles WHERE user_id = $uid", { uid: user!.id });
    redirect(agency ? "/dashboard/agency" : "/onboarding/agency");
  } else {
    const pro = await get("SELECT id FROM professional_profiles WHERE user_id = $uid", { uid: user!.id });
    redirect(pro ? "/dashboard/professional" : "/onboarding/professional");
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
