export type Role = "FAMILY" | "PROFESSIONAL" | "AGENCY" | "ADMIN";

export type VerificationStatus = "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED";
export type ExperienceLevel = "TRAINED" | "ONE_PLUS" | "FIVE_PLUS";
export type ScheduleType = "ONE_OFF" | "RECURRING" | "LIVE_IN";
export type BookingStatus = "REQUESTED" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "CANCELLED";
export type DocType = "DBS" | "QUALIFICATION" | "REFERENCE" | "ID_CHECK";
export type DocStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  name: string;
  referralCode: string;
  referredBy?: string;
  emailVerified: boolean;
  createdAt: string;
}

export type FundingSource = "SELF_FUNDED" | "LOCAL_AUTHORITY_DIRECT_PAYMENT" | "NHS_CHC_PHB" | "FAMILY_OTHER";

export interface FamilyProfile {
  id: string;
  userId: string;
  careRecipientName: string;
  conditions: string[];
  location: string;
  budgetMin: number;
  budgetMax: number;
  fundingSource: FundingSource;
  notes?: string;
  createdAt: string;
}

export interface ExperienceEntry {
  tagKey: string;
  level: ExperienceLevel;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  headline: string;
  bio: string;
  hourlyRate: number;
  location: string;
  yearsExperience: number;
  identityVerified: boolean;
  referencesVerified: boolean;
  dbsUpdateServiceSubscribed: boolean;
  payoutAccountConnected: boolean;
  verificationStatus: VerificationStatus;
  ratingAvg: number;
  ratingCount: number;
  experiences: ExperienceEntry[];
  agencyId?: string;
  createdAt: string;
}

export type AgencyVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface AgencyProfile {
  id: string;
  userId: string;
  companyName: string;
  description: string;
  location: string;
  website?: string;
  companyNumber?: string;
  cqcRegistered: boolean;
  cqcNumber?: string;
  verificationStatus: AgencyVerificationStatus;
  createdAt: string;
}

export type AgencyInviteStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface AgencyInvite {
  id: string;
  agencyId: string;
  email: string;
  token: string;
  status: AgencyInviteStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface ExperienceTag {
  key: string;
  label: string;
  category: string;
}

export interface VerificationDocument {
  id: string;
  professionalId: string;
  type: DocType;
  fileName: string;
  storageKey?: string;
  status: DocStatus;
  expiresAt?: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface Booking {
  id: string;
  familyId: string;
  professionalId: string;
  scheduleType: ScheduleType;
  proposedStart: string;
  proposedEnd?: string;
  notes?: string;
  rateAtBooking: number;
  status: BookingStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  familyId: string;
  professionalId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  authorId: string;
  targetId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  email: string;
  role: "FAMILY" | "PROFESSIONAL" | "UNSPECIFIED";
  source: string;
  createdAt: string;
}

export type SafeguardingStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export type SafeguardingSeverity = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

export interface SafeguardingReport {
  id: string;
  reporterId: string;
  aboutProfessionalId?: string;
  aboutBookingId?: string;
  category: string;
  details: string;
  status: SafeguardingStatus;
  severity?: SafeguardingSeverity;
  aiSummary?: string;
  createdAt: string;
}

export interface VisitLog {
  id: string;
  bookingId: string;
  professionalId: string;
  checkInAt: string;
  checkOutAt?: string;
  notes?: string;
}

export type CertificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface Certification {
  id: string;
  professionalId: string;
  title: string;
  issuingBody: string;
  credentialId?: string;
  issuedAt?: string;
  expiresAt?: string;
  evidenceFileName?: string;
  storageKey?: string;
  status: CertificationStatus;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface EmailOutboxEntry {
  id: string;
  toEmail: string;
  subject: string;
  body: string;
  provider: string;
  status: string;
  createdAt: string;
}

export interface DB {
  users: User[];
  familyProfiles: FamilyProfile[];
  professionalProfiles: ProfessionalProfile[];
  tags: ExperienceTag[];
  documents: VerificationDocument[];
  bookings: Booking[];
  conversations: Conversation[];
  messages: Message[];
  reviews: Review[];
  leads: Lead[];
  safeguardingReports: SafeguardingReport[];
  visitLogs: VisitLog[];
}
