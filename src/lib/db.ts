import { dbAll, dbGet, dbRun, id, nowIso, b, bb } from "./sqlite";
import type {
  User,
  FamilyProfile,
  ProfessionalProfile,
  ExperienceEntry,
  VerificationDocument,
  Booking,
  Conversation,
  Message,
  Review,
  Certification,
  Lead,
  Notification,
  EmailOutboxEntry,
  SafeguardingReport,
  VisitLog,
  AgencyProfile,
  AgencyInvite,
} from "./types";

export { id, nowIso };

// ---------- row -> object mappers ----------

export function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    name: row.name,
    referralCode: row.referral_code,
    referredBy: row.referred_by ?? undefined,
    emailVerified: bb(row.email_verified),
    createdAt: row.created_at,
  };
}

export function mapFamily(row: any): FamilyProfile {
  return {
    id: row.id,
    userId: row.user_id,
    careRecipientName: row.care_recipient_name,
    conditions: JSON.parse(row.conditions),
    location: row.location,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    fundingSource: row.funding_source,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapExperiences(rows: any[]): ExperienceEntry[] {
  return rows.map((r) => ({ tagKey: r.tag_key, level: r.level }));
}

export function mapProfessional(row: any, experiences: ExperienceEntry[]): ProfessionalProfile {
  return {
    id: row.id,
    userId: row.user_id,
    headline: row.headline,
    bio: row.bio,
    hourlyRate: row.hourly_rate,
    location: row.location,
    yearsExperience: row.years_experience,
    identityVerified: bb(row.identity_verified),
    referencesVerified: bb(row.references_verified),
    dbsUpdateServiceSubscribed: bb(row.dbs_update_service_subscribed),
    payoutAccountConnected: bb(row.payout_account_connected),
    verificationStatus: row.verification_status,
    ratingAvg: row.rating_avg,
    ratingCount: row.rating_count,
    experiences,
    agencyId: row.agency_id ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapAgency(row: any): AgencyProfile {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    description: row.description,
    location: row.location,
    website: row.website ?? undefined,
    companyNumber: row.company_number ?? undefined,
    cqcRegistered: bb(row.cqc_registered),
    cqcNumber: row.cqc_number ?? undefined,
    verificationStatus: row.verification_status,
    createdAt: row.created_at,
  };
}

export function mapAgencyInvite(row: any): AgencyInvite {
  return {
    id: row.id,
    agencyId: row.agency_id,
    email: row.email,
    token: row.token,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at ?? undefined,
  };
}

export function mapDocument(row: any): VerificationDocument {
  return {
    id: row.id,
    professionalId: row.professional_id,
    type: row.type,
    fileName: row.file_name,
    storageKey: row.storage_key ?? undefined,
    status: row.status,
    expiresAt: row.expires_at ?? undefined,
    uploadedAt: row.uploaded_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewNote: row.review_note ?? undefined,
  };
}

export function mapBooking(row: any): Booking {
  return {
    id: row.id,
    familyId: row.family_id,
    professionalId: row.professional_id,
    scheduleType: row.schedule_type,
    proposedStart: row.proposed_start,
    proposedEnd: row.proposed_end ?? undefined,
    notes: row.notes ?? undefined,
    rateAtBooking: row.rate_at_booking,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapConversation(row: any): Conversation {
  return {
    id: row.id,
    familyId: row.family_id,
    professionalId: row.professional_id,
    createdAt: row.created_at,
  };
}

export function mapMessage(row: any): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export function mapCertification(row: any): Certification {
  return {
    id: row.id,
    professionalId: row.professional_id,
    title: row.title,
    issuingBody: row.issuing_body,
    credentialId: row.credential_id ?? undefined,
    issuedAt: row.issued_at ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    evidenceFileName: row.evidence_file_name ?? undefined,
    storageKey: row.storage_key ?? undefined,
    status: row.status,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewNote: row.review_note ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapReview(row: any): Review {
  return {
    id: row.id,
    bookingId: row.booking_id,
    authorId: row.author_id,
    targetId: row.target_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link ?? undefined,
    read: bb(row.read),
    createdAt: row.created_at,
  };
}

export function mapEmailOutbox(row: any): EmailOutboxEntry {
  return {
    id: row.id,
    toEmail: row.to_email,
    subject: row.subject,
    body: row.body,
    provider: row.provider,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapLead(row: any): Lead {
  return { id: row.id, email: row.email, role: row.role, source: row.source, createdAt: row.created_at };
}

export function mapSafeguardingReport(row: any): SafeguardingReport {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    aboutProfessionalId: row.about_professional_id ?? undefined,
    aboutBookingId: row.about_booking_id ?? undefined,
    category: row.category,
    details: row.details,
    status: row.status,
    severity: row.severity ?? undefined,
    aiSummary: row.ai_summary ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapVisitLog(row: any): VisitLog {
  return {
    id: row.id,
    bookingId: row.booking_id,
    professionalId: row.professional_id,
    checkInAt: row.check_in_at,
    checkOutAt: row.check_out_at ?? undefined,
    notes: row.notes ?? undefined,
  };
}

// ---------- generic helpers ----------
// All three are async: the local dev driver (node:sqlite) resolves
// immediately, the production driver (Turso/libSQL) makes a real network
// call. Every caller in this app already awaits these.

function prefix(params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    out[k.startsWith("$") ? k : `$${k}`] = v;
  }
  return out;
}

export async function all(sql: string, params: Record<string, unknown> = {}): Promise<any[]> {
  return dbAll(sql, prefix(params));
}

export async function get(sql: string, params: Record<string, unknown> = {}): Promise<any> {
  return dbGet(sql, prefix(params));
}

export async function run(sql: string, params: Record<string, unknown> = {}): Promise<void> {
  await dbRun(sql, prefix(params));
}

export function boolParam(v: boolean) {
  return b(v);
}
