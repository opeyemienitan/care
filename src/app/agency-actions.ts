"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { run, get, id, nowIso } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify, sendEmail } from "@/lib/notifications";
import { generateToken } from "@/lib/crypto";
import { SITE_URL } from "@/lib/seo";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user!;
}

export async function completeAgencyOnboardingAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "AGENCY") redirect("/");

  const existing = await get("SELECT id FROM agency_profiles WHERE user_id = $uid", { uid: user.id });
  if (existing) redirect("/dashboard/agency");

  const companyName = String(formData.get("companyName") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const website = String(formData.get("website") || "").trim() || null;
  const companyNumber = String(formData.get("companyNumber") || "").trim() || null;
  const cqcRegistered = formData.get("cqcRegistered") === "on" ? 1 : 0;
  const cqcNumber = String(formData.get("cqcNumber") || "").trim() || null;

  if (!companyName || !description || !location) {
    redirect(`/onboarding/agency?error=${encodeURIComponent("Please fill in company name, description and location.")}`);
  }

  await run(
    `INSERT INTO agency_profiles
      (id, user_id, company_name, description, location, website, company_number, cqc_registered, cqc_number, verification_status, created_at)
     VALUES ($id, $uid, $companyName, $description, $location, $website, $companyNumber, $cqcRegistered, $cqcNumber, 'PENDING', $createdAt)`,
    {
      id: id("agy"),
      uid: user.id,
      companyName,
      description,
      location,
      website,
      companyNumber,
      cqcRegistered,
      cqcNumber,
      createdAt: nowIso(),
    }
  );

  redirect("/dashboard/agency");
}

export async function inviteStaffAction(formData: FormData) {
  const user = await requireUser();
  const agency = await get("SELECT * FROM agency_profiles WHERE user_id = $uid", { uid: user.id });
  if (!agency) redirect("/onboarding/agency");

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return;

  const token = generateToken();
  await run(
    `INSERT INTO agency_invites (id, agency_id, email, token, status, created_at)
     VALUES ($id, $aid, $email, $token, 'PENDING', $createdAt)`,
    { id: id("inv"), aid: agency.id, email, token, createdAt: nowIso() }
  );

  await sendEmail({
    to: email,
    subject: `${agency.company_name} invited you to join Marram Care`,
    body: `Hi,\n\n${agency.company_name} has invited you to join their roster on Marram Care, the specialist complex care matching platform.\n\nIf you already have a professional account, accept the invite here:\n${SITE_URL}/join-agency?token=${token}\n\nIf you don't have an account yet, create one first (as a professional) and then open the link above to join ${agency.company_name}'s roster:\n${SITE_URL}/signup?role=PROFESSIONAL\n\n— Marram Care`,
  });

  revalidatePath("/dashboard/agency");
}

export async function acceptAgencyInviteAction(formData: FormData) {
  const user = await requireUser();
  const token = String(formData.get("token") || "");

  const invite = await get("SELECT * FROM agency_invites WHERE token = $token", { token });
  if (!invite || invite.status !== "PENDING") redirect("/dashboard/professional");

  const pro = await get("SELECT * FROM professional_profiles WHERE user_id = $uid", { uid: user.id });
  if (!pro) redirect("/onboarding/professional");

  await run("UPDATE professional_profiles SET agency_id = $aid WHERE id = $id", { id: pro.id, aid: invite.agency_id });
  await run("UPDATE agency_invites SET status = 'ACCEPTED', resolved_at = $resolvedAt WHERE id = $id", {
    id: invite.id,
    resolvedAt: nowIso(),
  });

  const agency = await get("SELECT * FROM agency_profiles WHERE id = $id", { id: invite.agency_id });
  if (agency) {
    await notify({
      userId: agency.user_id,
      type: "agency_invite_accepted",
      title: "Roster invite accepted",
      body: `${user.name} has joined your roster.`,
      link: "/dashboard/agency",
    });
  }

  redirect("/dashboard/professional");
}

export async function declineAgencyInviteAction(formData: FormData) {
  await requireUser();
  const token = String(formData.get("token") || "");
  await run("UPDATE agency_invites SET status = 'DECLINED', resolved_at = $resolvedAt WHERE token = $token", {
    token,
    resolvedAt: nowIso(),
  });
  redirect("/dashboard/professional");
}

export async function leaveAgencyAction() {
  const user = await requireUser();
  const pro = await get("SELECT * FROM professional_profiles WHERE user_id = $uid", { uid: user.id });
  if (!pro) redirect("/dashboard/professional");
  await run("UPDATE professional_profiles SET agency_id = NULL WHERE id = $id", { id: pro.id });
  revalidatePath("/dashboard/professional");
}

export async function adminReviewAgencyAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");

  const agencyId = String(formData.get("agencyId"));
  const decision = String(formData.get("decision")); // VERIFIED | REJECTED
  const agency = await get("SELECT * FROM agency_profiles WHERE id = $id", { id: agencyId });
  if (!agency) redirect("/admin");

  await run("UPDATE agency_profiles SET verification_status = $status WHERE id = $id", { id: agencyId, status: decision });

  await notify({
    userId: agency.user_id,
    type: "agency_verification",
    title: decision === "VERIFIED" ? "Your agency is verified" : "Agency verification update",
    body:
      decision === "VERIFIED"
        ? "Your agency profile is verified and live — families can now discover your roster."
        : "We couldn't verify your agency profile with the details provided. Check your dashboard for next steps.",
    link: "/dashboard/agency",
  });

  revalidatePath("/admin");
}
