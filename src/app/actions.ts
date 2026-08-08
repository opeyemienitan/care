"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { run, get, all, id, nowIso } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { DocType, FundingSource } from "@/lib/types";
import { notify } from "@/lib/notifications";
import { triageSafeguardingReport, suggestTagsFromDescription } from "@/lib/ai";
import { saveUpload } from "@/lib/storage";
import { authorizePayment, releasePayment, refundPayment, connectPayoutAccount } from "@/lib/payments";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user!;
}

export async function completeFamilyOnboarding(formData: FormData) {
  const user = await requireUser();
  const conditions = formData.getAll("conditions").map(String);

  await run(
    `INSERT INTO family_profiles
      (id, user_id, care_recipient_name, conditions, location, budget_min, budget_max, funding_source, notes, created_at)
     VALUES ($id, $userId, $name, $conditions, $location, $budgetMin, $budgetMax, $fundingSource, $notes, $createdAt)`,
    {
      id: id("fam"),
      userId: user.id,
      name: String(formData.get("careRecipientName") || ""),
      conditions: JSON.stringify(conditions),
      location: String(formData.get("location") || ""),
      budgetMin: Number(formData.get("budgetMin") || 15),
      budgetMax: Number(formData.get("budgetMax") || 25),
      fundingSource: String(formData.get("fundingSource") || "SELF_FUNDED") as FundingSource,
      notes: String(formData.get("notes") || ""),
      createdAt: nowIso(),
    }
  );
  redirect("/dashboard/family");
}

export async function completeProfessionalOnboarding(formData: FormData) {
  const user = await requireUser();
  const tagKeys = formData.getAll("tagKeys").map(String);
  const professionalId = id("pro");

  await run(
    `INSERT INTO professional_profiles
      (id, user_id, headline, bio, hourly_rate, location, years_experience, identity_verified,
       references_verified, dbs_update_service_subscribed, verification_status, rating_avg, rating_count, created_at)
     VALUES ($id, $userId, $headline, $bio, $rate, $location, $years, 0, 0, $dbsUpd, 'PENDING', 0, 0, $createdAt)`,
    {
      id: professionalId,
      userId: user.id,
      headline: String(formData.get("headline") || ""),
      bio: String(formData.get("bio") || ""),
      rate: Number(formData.get("hourlyRate") || 18),
      location: String(formData.get("location") || ""),
      years: Number(formData.get("yearsExperience") || 0),
      dbsUpd: formData.get("dbsUpdateServiceSubscribed") === "on" ? 1 : 0,
      createdAt: nowIso(),
    }
  );

  for (const tagKey of tagKeys) {
    await run(
      `INSERT INTO professional_experiences (id, professional_id, tag_key, level) VALUES ($id, $pid, $tag, $level)`,
      {
        id: id("exp"),
        pid: professionalId,
        tag: tagKey,
        level: String(formData.get(`level_${tagKey}`) || "TRAINED"),
      }
    );
  }

  const addDoc = async (type: DocType, entry: FormDataEntryValue | null) => {
    if (!entry || typeof entry === "string" || entry.size === 0) return;
    const saved = await saveUpload(entry, `documents/${professionalId}`);
    const { checkDocument } = await import("@/lib/verification");
    const autoCheck = await checkDocument(type, saved.originalName);
    await run(
      `INSERT INTO documents (id, professional_id, type, file_name, storage_key, status, uploaded_at, auto_check_provider, auto_check_result, auto_check_confidence)
       VALUES ($id, $pid, $type, $name, $storageKey, $status, $uploadedAt, $provider, $result, $confidence)`,
      {
        id: id("doc"),
        pid: professionalId,
        type,
        name: saved.originalName,
        storageKey: saved.storageKey,
        status: autoCheck.autoDecision ?? "PENDING",
        uploadedAt: nowIso(),
        provider: autoCheck.provider,
        result: autoCheck.result,
        confidence: autoCheck.confidence,
      }
    );
  };
  await addDoc("DBS", formData.get("dbsFile"));
  await addDoc("REFERENCE", formData.get("referenceFile"));
  await addDoc("QUALIFICATION", formData.get("qualificationFile"));

  await recomputeProfessionalVerification(professionalId);
  redirect("/dashboard/professional");
}

export async function addCertificationAction(formData: FormData) {
  const user = await requireUser();
  const pro = await get("SELECT * FROM professional_profiles WHERE user_id = $uid", { uid: user.id });
  if (!pro) redirect("/onboarding/professional");

  const evidence = formData.get("evidenceFile");
  let evidenceFileName: string | null = null;
  let evidenceStorageKey: string | null = null;
  if (evidence && typeof evidence !== "string" && evidence.size > 0) {
    const saved = await saveUpload(evidence, `certifications/${pro!.id}`);
    evidenceFileName = saved.originalName;
    evidenceStorageKey = saved.storageKey;
  }

  await run(
    `INSERT INTO certifications
      (id, professional_id, title, issuing_body, credential_id, issued_at, expires_at, evidence_file_name, storage_key, status, created_at)
     VALUES ($id, $pid, $title, $issuer, $credId, $issuedAt, $expiresAt, $evidence, $storageKey, 'PENDING', $createdAt)`,
    {
      id: id("cert"),
      pid: pro!.id,
      title: String(formData.get("title") || ""),
      issuer: String(formData.get("issuingBody") || ""),
      credId: String(formData.get("credentialId") || "") || null,
      issuedAt: String(formData.get("issuedAt") || "") || null,
      expiresAt: String(formData.get("expiresAt") || "") || null,
      evidence: evidenceFileName,
      storageKey: evidenceStorageKey,
      createdAt: nowIso(),
    }
  );
  revalidatePath("/dashboard/professional");
}

export async function requestBookingAction(formData: FormData) {
  const user = await requireUser();
  const familyRow = await get("SELECT * FROM family_profiles WHERE user_id = $uid", { uid: user.id });
  if (!familyRow) redirect("/onboarding/family");

  const professionalId = String(formData.get("professionalId"));
  const proRow = await get("SELECT * FROM professional_profiles WHERE id = $pid", { pid: professionalId });
  if (!proRow) redirect("/search");

  const bookingId = id("bkg");
  const scheduleType = String(formData.get("scheduleType") || "ONE_OFF");
  const proposedStart = String(formData.get("proposedStart") || nowIso());
  const notes = String(formData.get("notes") || "");

  await run(
    `INSERT INTO bookings (id, family_id, professional_id, schedule_type, proposed_start, notes, rate_at_booking, status, created_at)
     VALUES ($id, $fid, $pid, $type, $start, $notes, $rate, 'REQUESTED', $createdAt)`,
    {
      id: bookingId,
      fid: familyRow.id,
      pid: professionalId,
      type: scheduleType,
      start: proposedStart,
      notes,
      rate: proRow.hourly_rate,
      createdAt: nowIso(),
    }
  );

  await authorizePayment(bookingId);

  let conversation = await get("SELECT * FROM conversations WHERE family_id = $fid AND professional_id = $pid", {
    fid: familyRow.id,
    pid: professionalId,
  });
  if (!conversation) {
    const conversationId = id("cnv");
    await run(`INSERT INTO conversations (id, family_id, professional_id, created_at) VALUES ($id, $fid, $pid, $createdAt)`, {
      id: conversationId,
      fid: familyRow.id,
      pid: professionalId,
      createdAt: nowIso(),
    });
    conversation = { id: conversationId };
  }
  await run(`INSERT INTO messages (id, conversation_id, sender_id, body, created_at) VALUES ($id, $cid, $sid, $body, $createdAt)`, {
    id: id("msg"),
    cid: conversation.id,
    sid: user.id,
    body: `Booking request sent: ${scheduleType.replace("_", " ").toLowerCase()} care starting ${new Date(
      proposedStart
    ).toLocaleDateString("en-GB")}. ${notes}`.trim(),
    createdAt: nowIso(),
  });

  await notify({
    userId: proRow.user_id,
    type: "booking_requested",
    title: "New booking request",
    body: `${familyRow.care_recipient_name} requested ${scheduleType.replace("_", " ").toLowerCase()} care.`,
    link: `/bookings/${bookingId}`,
  });

  redirect(`/bookings/${bookingId}`);
}

export async function respondBookingAction(formData: FormData) {
  await requireUser();
  const bookingId = String(formData.get("bookingId"));
  const status = String(formData.get("status"));
  const booking = await get("SELECT * FROM bookings WHERE id = $id", { id: bookingId });
  if (!booking) redirect("/dashboard/professional");

  await run("UPDATE bookings SET status = $status WHERE id = $id", { id: bookingId, status });

  if (status === "COMPLETED") {
    await releasePayment(bookingId);
  } else if (status === "DECLINED" || status === "CANCELLED") {
    await refundPayment(bookingId);
  }

  const family = await get("SELECT * FROM family_profiles WHERE id = $fid", { fid: booking.family_id });
  if (status === "ACCEPTED" || status === "DECLINED") {
    await notify({
      userId: family.user_id,
      type: "booking_status",
      title: `Booking ${status.toLowerCase()}`,
      body: `Your booking request has been ${status.toLowerCase()}.`,
      link: `/bookings/${bookingId}`,
    });
  }
  if (status === "COMPLETED") {
    await notify({
      userId: family.user_id,
      type: "booking_status",
      title: "Booking marked completed",
      body: `Your booking is complete — you can now leave a review.`,
      link: `/bookings/${bookingId}`,
    });
  }
  revalidatePath(`/bookings/${bookingId}`);
}

export async function sendMessageAction(formData: FormData) {
  const user = await requireUser();
  const conversationId = String(formData.get("conversationId"));
  const body = String(formData.get("body") || "").trim();
  if (!body) return;

  await run(`INSERT INTO messages (id, conversation_id, sender_id, body, created_at) VALUES ($id, $cid, $sid, $body, $createdAt)`, {
    id: id("msg"),
    cid: conversationId,
    sid: user.id,
    body,
    createdAt: nowIso(),
  });

  const conversation = await get("SELECT * FROM conversations WHERE id = $id", { id: conversationId });
  if (conversation) {
    const family = await get("SELECT * FROM family_profiles WHERE id = $fid", { fid: conversation.family_id });
    const pro = await get("SELECT * FROM professional_profiles WHERE id = $pid", { pid: conversation.professional_id });
    const recipientUserId = user.id === family.user_id ? pro.user_id : family.user_id;
    await notify({
      userId: recipientUserId,
      type: "new_message",
      title: "New message",
      body: body.length > 80 ? `${body.slice(0, 80)}…` : body,
      link: `/bookings`,
    });
  }

  revalidatePath(`/bookings`);
}

export async function postReviewAction(formData: FormData) {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId"));
  const targetId = String(formData.get("targetId"));
  const rating = Number(formData.get("rating") || 5);
  const comment = String(formData.get("comment") || "");

  await run(
    `INSERT INTO reviews (id, booking_id, author_id, target_id, rating, comment, created_at)
     VALUES ($id, $bid, $aid, $tid, $rating, $comment, $createdAt)`,
    { id: id("rev"), bid: bookingId, aid: user.id, tid: targetId, rating, comment, createdAt: nowIso() }
  );

  const pro = await get("SELECT * FROM professional_profiles WHERE user_id = $uid", { uid: targetId });
  if (pro) {
    const total = pro.rating_avg * pro.rating_count + rating;
    const newCount = pro.rating_count + 1;
    const newAvg = Number((total / newCount).toFixed(2));
    await run("UPDATE professional_profiles SET rating_avg = $avg, rating_count = $count WHERE id = $id", {
      id: pro.id,
      avg: newAvg,
      count: newCount,
    });
    await notify({
      userId: targetId,
      type: "new_review",
      title: "New review",
      body: `You received a ${rating}-star review.`,
      link: `/bookings/${bookingId}`,
    });
  }

  revalidatePath(`/bookings/${bookingId}`);
}

export async function checkInVisitAction(formData: FormData) {
  await requireUser();
  const bookingId = String(formData.get("bookingId"));
  const booking = await get("SELECT * FROM bookings WHERE id = $id", { id: bookingId });
  if (!booking) redirect("/dashboard/professional");

  await run(
    `INSERT INTO visit_logs (id, booking_id, professional_id, check_in_at) VALUES ($id, $bid, $pid, $checkInAt)`,
    { id: id("vlg"), bid: bookingId, pid: booking.professional_id, checkInAt: nowIso() }
  );
  revalidatePath(`/bookings/${bookingId}`);
}

export async function checkOutVisitAction(formData: FormData) {
  await requireUser();
  const visitId = String(formData.get("visitId"));
  const bookingId = String(formData.get("bookingId"));
  const notes = String(formData.get("notes") || "");

  await run("UPDATE visit_logs SET check_out_at = $checkOutAt, notes = $notes WHERE id = $id", {
    id: visitId,
    checkOutAt: nowIso(),
    notes,
  });
  revalidatePath(`/bookings/${bookingId}`);
}

export async function submitSafeguardingReportAction(formData: FormData) {
  const user = await requireUser();
  const aboutProfessionalId = String(formData.get("aboutProfessionalId") || "") || null;
  const aboutBookingId = String(formData.get("aboutBookingId") || "") || null;
  const category = String(formData.get("category") || "Other concern");
  const details = String(formData.get("details") || "").trim();
  const redirectTo = String(formData.get("redirectTo") || "/");

  if (!details) redirect(`${redirectTo}?report=error`);

  const { severity, summary } = await triageSafeguardingReport(details, category);

  await run(
    `INSERT INTO safeguarding_reports
      (id, reporter_id, about_professional_id, about_booking_id, category, details, status, severity, ai_summary, created_at)
     VALUES ($id, $rid, $proId, $bookingId, $category, $details, 'OPEN', $severity, $summary, $createdAt)`,
    {
      id: id("sgr"),
      rid: user.id,
      proId: aboutProfessionalId,
      bookingId: aboutBookingId,
      category,
      details,
      severity,
      summary,
      createdAt: nowIso(),
    }
  );
  redirect(`${redirectTo}?report=submitted`);
}

export async function resolveSafeguardingReportAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  const reportId = String(formData.get("reportId"));
  const status = String(formData.get("status"));
  await run("UPDATE safeguarding_reports SET status = $status WHERE id = $id", { id: reportId, status });
  revalidatePath("/admin");
}

export async function adminReviewDocumentAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  const docId = String(formData.get("docId"));
  const decision = String(formData.get("decision"));
  const doc = await get("SELECT * FROM documents WHERE id = $id", { id: docId });
  if (!doc) redirect("/admin");

  await run("UPDATE documents SET status = $status, reviewed_at = $reviewedAt WHERE id = $id", {
    id: docId,
    status: decision,
    reviewedAt: nowIso(),
  });

  await recomputeProfessionalVerification(doc.professional_id);
  revalidatePath("/admin");
}

export async function adminReviewCertificationAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  const certId = String(formData.get("certId"));
  const decision = String(formData.get("decision"));
  await run("UPDATE certifications SET status = $status, reviewed_at = $reviewedAt WHERE id = $id", {
    id: certId,
    status: decision,
    reviewedAt: nowIso(),
  });
  revalidatePath("/admin");
}

async function recomputeProfessionalVerification(professionalId: string) {
  const pro = await get("SELECT * FROM professional_profiles WHERE id = $id", { id: professionalId });
  if (!pro) return;
  const docList = await all("SELECT * FROM documents WHERE professional_id = $pid", { pid: professionalId });
  const dbsDoc = docList.find((d: any) => d.type === "DBS");
  const refDoc = docList.find((d: any) => d.type === "REFERENCE");
  const qualDoc = docList.find((d: any) => d.type === "QUALIFICATION");

  const referencesVerified = refDoc?.status === "VERIFIED" ? 1 : 0;
  let verificationStatus = pro.verification_status;
  if (dbsDoc?.status === "REJECTED" || refDoc?.status === "REJECTED" || qualDoc?.status === "REJECTED") {
    verificationStatus = "REJECTED";
  } else if (dbsDoc?.status === "VERIFIED" && refDoc?.status === "VERIFIED" && qualDoc?.status === "VERIFIED") {
    verificationStatus = "VERIFIED";
  } else if (docList.some((d: any) => d.status === "VERIFIED")) {
    verificationStatus = "IN_REVIEW";
  }

  await run(
    "UPDATE professional_profiles SET identity_verified = 1, references_verified = $refs, verification_status = $status WHERE id = $id",
    { id: professionalId, refs: referencesVerified, status: verificationStatus }
  );

  if (verificationStatus === "VERIFIED" && pro.verification_status !== "VERIFIED") {
    await notify({
      userId: pro.user_id,
      type: "verification_status",
      title: "You're verified!",
      body: "All your documents have been verified — your profile is now fully live.",
      link: "/dashboard/professional",
    });
  }
}

export async function suggestTagsAction(description: string) {
  if (!description || description.trim().length < 8) return { tagKeys: [] as string[], source: "keyword" as const };
  return suggestTagsFromDescription(description);
}

export async function connectPayoutAccountAction() {
  const user = await requireUser();
  const pro = await get("SELECT * FROM professional_profiles WHERE user_id = $uid", { uid: user.id });
  if (!pro) redirect("/onboarding/professional");
  await connectPayoutAccount(pro.id);
  await notify({
    userId: user.id,
    type: "payout_account_connected",
    title: "Payout account connected",
    body: "You're all set to receive payouts for completed bookings.",
    link: "/dashboard/professional",
  });
  revalidatePath("/dashboard/professional");
}
