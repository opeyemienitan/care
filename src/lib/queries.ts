import {
  all,
  get,
  mapUser,
  mapFamily,
  mapProfessional,
  mapDocument,
  mapBooking,
  mapConversation,
  mapMessage,
  mapReview,
  mapCertification,
  mapLead,
  mapNotification,
  mapSafeguardingReport,
  mapVisitLog,
  mapAgency,
  mapAgencyInvite,
} from "./db";
import type { ExperienceEntry, ProfessionalProfile } from "./types";

async function experiencesFor(professionalId: string): Promise<ExperienceEntry[]> {
  const rows = await all("SELECT * FROM professional_experiences WHERE professional_id = $pid", { pid: professionalId });
  return rows.map((r) => ({ tagKey: r.tag_key, level: r.level }));
}

async function professionalFromRow(row: any): Promise<ProfessionalProfile> {
  return mapProfessional(row, await experiencesFor(row.id));
}

export async function getUserById(userId: string) {
  const row = await get("SELECT * FROM users WHERE id = $id", { id: userId });
  return row ? mapUser(row) : undefined;
}

export async function getFamilyByUserId(userId: string) {
  const row = await get("SELECT * FROM family_profiles WHERE user_id = $uid", { uid: userId });
  return row ? mapFamily(row) : undefined;
}

export async function getProfessionalByUserId(userId: string) {
  const row = await get("SELECT * FROM professional_profiles WHERE user_id = $uid", { uid: userId });
  return row ? professionalFromRow(row) : undefined;
}

export async function getProfessionalById(id: string) {
  const row = await get("SELECT * FROM professional_profiles WHERE id = $id", { id });
  if (!row) return undefined;
  const profile = await professionalFromRow(row);
  const user = await getUserById(row.user_id);
  return { profile, user };
}

export async function getFamilyById(id: string) {
  const row = await get("SELECT * FROM family_profiles WHERE id = $id", { id });
  if (!row) return undefined;
  const profile = mapFamily(row);
  const user = await getUserById(row.user_id);
  return { profile, user };
}

export async function listProfessionals(): Promise<ProfessionalProfile[]> {
  const rows = await all("SELECT * FROM professional_profiles ORDER BY created_at DESC");
  return Promise.all(rows.map(professionalFromRow));
}

export async function listDocuments(professionalId: string) {
  const rows = await all("SELECT * FROM documents WHERE professional_id = $pid ORDER BY uploaded_at DESC", {
    pid: professionalId,
  });
  return rows.map(mapDocument);
}

export async function listPendingDocuments() {
  const rows = await all("SELECT * FROM documents WHERE status = 'PENDING' ORDER BY uploaded_at ASC");
  const out = [];
  for (const d of rows) {
    const proRow = await get("SELECT * FROM professional_profiles WHERE id = $pid", { pid: d.professional_id });
    if (!proRow) continue;
    out.push({
      doc: mapDocument(d),
      professional: await professionalFromRow(proRow),
      user: mapUser(await get("SELECT * FROM users WHERE id = $uid", { uid: proRow.user_id })),
    });
  }
  return out;
}

export async function listCertifications(professionalId: string) {
  const rows = await all("SELECT * FROM certifications WHERE professional_id = $pid ORDER BY created_at DESC", {
    pid: professionalId,
  });
  return rows.map(mapCertification);
}

export async function listPendingCertifications() {
  const rows = await all("SELECT * FROM certifications WHERE status = 'PENDING' ORDER BY created_at ASC");
  const out = [];
  for (const c of rows) {
    const proRow = await get("SELECT * FROM professional_profiles WHERE id = $pid", { pid: c.professional_id });
    if (!proRow) continue;
    out.push({
      cert: mapCertification(c),
      professional: await professionalFromRow(proRow),
      user: mapUser(await get("SELECT * FROM users WHERE id = $uid", { uid: proRow.user_id })),
    });
  }
  return out;
}

export async function getBookingsForFamily(familyId: string) {
  const rows = await all("SELECT * FROM bookings WHERE family_id = $fid ORDER BY created_at DESC", { fid: familyId });
  const out = [];
  for (const b of rows) {
    const proRow = await get("SELECT * FROM professional_profiles WHERE id = $pid", { pid: b.professional_id });
    out.push({ booking: mapBooking(b), professional: await professionalFromRow(proRow) });
  }
  return out;
}

export async function getBookingsForProfessional(professionalId: string) {
  const rows = await all("SELECT * FROM bookings WHERE professional_id = $pid ORDER BY created_at DESC", {
    pid: professionalId,
  });
  const out = [];
  for (const b of rows) {
    const famRow = await get("SELECT * FROM family_profiles WHERE id = $fid", { fid: b.family_id });
    out.push({ booking: mapBooking(b), family: mapFamily(famRow) });
  }
  return out;
}

export async function getBookingById(id: string) {
  const row = await get("SELECT * FROM bookings WHERE id = $id", { id });
  if (!row) return undefined;
  const booking = mapBooking(row);
  const family = mapFamily(await get("SELECT * FROM family_profiles WHERE id = $fid", { fid: booking.familyId }));
  const professional = await professionalFromRow(
    await get("SELECT * FROM professional_profiles WHERE id = $pid", { pid: booking.professionalId })
  );
  const familyUser = mapUser(await get("SELECT * FROM users WHERE id = $uid", { uid: family.userId }));
  const proUser = mapUser(await get("SELECT * FROM users WHERE id = $uid", { uid: professional.userId }));
  const reviewRow = await get("SELECT * FROM reviews WHERE booking_id = $bid", { bid: id });
  return { booking, family, professional, familyUser, proUser, review: reviewRow ? mapReview(reviewRow) : undefined };
}

export async function getOrCreateConversationLookup(familyId: string, professionalId: string) {
  const row = await get("SELECT * FROM conversations WHERE family_id = $fid AND professional_id = $pid", {
    fid: familyId,
    pid: professionalId,
  });
  return row ? mapConversation(row) : undefined;
}

export async function getConversationById(id: string) {
  const row = await get("SELECT * FROM conversations WHERE id = $id", { id });
  if (!row) return undefined;
  const conversation = mapConversation(row);
  const messageRows = await all("SELECT * FROM messages WHERE conversation_id = $cid ORDER BY created_at ASC", {
    cid: id,
  });
  const messages = messageRows.map(mapMessage);
  const family = mapFamily(await get("SELECT * FROM family_profiles WHERE id = $fid", { fid: conversation.familyId }));
  const professional = await professionalFromRow(
    await get("SELECT * FROM professional_profiles WHERE id = $pid", { pid: conversation.professionalId })
  );
  return { conversation, messages, family, professional };
}

export async function listVisitLogs(bookingId: string) {
  const rows = await all("SELECT * FROM visit_logs WHERE booking_id = $bid ORDER BY check_in_at DESC", {
    bid: bookingId,
  });
  return rows.map(mapVisitLog);
}

export async function countReferralsByUserId(userId: string) {
  const row = await get("SELECT COUNT(*) as c FROM users WHERE referred_by = $uid", { uid: userId });
  return row.c as number;
}

export async function listSafeguardingReports() {
  const rows = await all("SELECT * FROM safeguarding_reports ORDER BY created_at DESC");
  const out = [];
  for (const r of rows) {
    out.push({
      report: mapSafeguardingReport(r),
      reporter: mapUser(await get("SELECT * FROM users WHERE id = $uid", { uid: r.reporter_id })),
      professional: r.about_professional_id
        ? await professionalFromRow(
            await get("SELECT * FROM professional_profiles WHERE id = $pid", { pid: r.about_professional_id })
          )
        : undefined,
    });
  }
  return out;
}

export async function listLeads() {
  const rows = await all("SELECT * FROM leads ORDER BY created_at DESC");
  return rows.map(mapLead);
}

export async function listNotifications(userId: string, limit = 20) {
  const rows = await all("SELECT * FROM notifications WHERE user_id = $uid ORDER BY created_at DESC LIMIT $limit", {
    uid: userId,
    limit,
  });
  return rows.map(mapNotification);
}

export async function countUnreadNotifications(userId: string) {
  const row = await get("SELECT COUNT(*) as c FROM notifications WHERE user_id = $uid AND read = 0", { uid: userId });
  return row.c as number;
}

export async function getReviewsForTarget(userId: string) {
  const rows = await all("SELECT * FROM reviews WHERE target_id = $uid", { uid: userId });
  return rows.map(mapReview);
}

// ---------- platform-wide counts (admin metrics) ----------

export async function countFamilies() {
  return (await get("SELECT COUNT(*) as c FROM family_profiles")).c as number;
}
export async function countAllProfessionals() {
  return (await get("SELECT COUNT(*) as c FROM professional_profiles")).c as number;
}
export async function countAllBookings() {
  return (await get("SELECT COUNT(*) as c FROM bookings")).c as number;
}
export async function listAllBookingsRaw() {
  const rows = await all("SELECT * FROM bookings");
  return rows.map(mapBooking);
}

// ---------- payments / revenue ----------

export async function getPaymentsSummaryForProfessional(professionalId: string) {
  const rows = await all("SELECT status, professional_payout_amount FROM payments WHERE professional_id = $pid", {
    pid: professionalId,
  });
  let authorized = 0;
  let released = 0;
  for (const r of rows) {
    if (r.status === "AUTHORIZED") authorized += r.professional_payout_amount;
    if (r.status === "RELEASED") released += r.professional_payout_amount;
  }
  return { authorized, released };
}

export async function getPlatformRevenueSummary() {
  const rows = await all("SELECT status, gross_amount, platform_fee_amount FROM payments");
  let grossAuthorized = 0;
  let grossReleased = 0;
  let feeRealized = 0;
  let feePipeline = 0;
  for (const r of rows) {
    if (r.status === "AUTHORIZED") {
      grossAuthorized += r.gross_amount;
      feePipeline += r.platform_fee_amount;
    }
    if (r.status === "RELEASED") {
      grossReleased += r.gross_amount;
      feeRealized += r.platform_fee_amount;
    }
  }
  return { grossAuthorized, grossReleased, feeRealized, feePipeline, paymentCount: rows.length };
}

// ---------- agencies ----------

export async function getAgencyByUserId(userId: string) {
  const row = await get("SELECT * FROM agency_profiles WHERE user_id = $uid", { uid: userId });
  return row ? mapAgency(row) : undefined;
}

export async function getAgencyById(id: string) {
  const row = await get("SELECT * FROM agency_profiles WHERE id = $id", { id });
  return row ? mapAgency(row) : undefined;
}

export async function listRosterForAgency(agencyId: string): Promise<ProfessionalProfile[]> {
  const rows = await all("SELECT * FROM professional_profiles WHERE agency_id = $aid ORDER BY created_at DESC", {
    aid: agencyId,
  });
  return Promise.all(rows.map(professionalFromRow));
}

export async function listAgencyInvites(agencyId: string) {
  const rows = await all("SELECT * FROM agency_invites WHERE agency_id = $aid ORDER BY created_at DESC", {
    aid: agencyId,
  });
  return rows.map(mapAgencyInvite);
}

export async function getAgencyInviteByToken(token: string) {
  const row = await get("SELECT * FROM agency_invites WHERE token = $token", { token });
  return row ? mapAgencyInvite(row) : undefined;
}

export async function getBookingsForAgencyRoster(agencyId: string) {
  const rows = await all(
    `SELECT b.* FROM bookings b
     JOIN professional_profiles p ON p.id = b.professional_id
     WHERE p.agency_id = $aid
     ORDER BY b.created_at DESC`,
    { aid: agencyId }
  );
  return rows.map(mapBooking);
}

export async function getAgencyRevenueSummary(agencyId: string) {
  const rows = await all(
    `SELECT pay.status, pay.professional_payout_amount FROM payments pay
     JOIN professional_profiles p ON p.id = pay.professional_id
     WHERE p.agency_id = $aid`,
    { aid: agencyId }
  );
  let held = 0;
  let paidOut = 0;
  for (const r of rows) {
    if (r.status === "AUTHORIZED") held += r.professional_payout_amount;
    if (r.status === "RELEASED") paidOut += r.professional_payout_amount;
  }
  return { held, paidOut };
}

export async function listPendingAgencyVerifications() {
  const rows = await all("SELECT * FROM agency_profiles WHERE verification_status = 'PENDING' ORDER BY created_at ASC");
  const out = [];
  for (const row of rows) {
    const agency = mapAgency(row);
    const user = await getUserById(row.user_id);
    out.push({ agency, user: user! });
  }
  return out;
}

export async function countAgencies() {
  return (await get("SELECT COUNT(*) as c FROM agency_profiles")).c as number;
}

export async function listPendingInvitesForEmail(email: string) {
  const rows = await all("SELECT * FROM agency_invites WHERE email = $email AND status = 'PENDING' ORDER BY created_at DESC", {
    email,
  });
  return rows.map(mapAgencyInvite);
}
