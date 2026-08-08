import fs from "fs";
import path from "path";
import { run, id } from "./db";
import { hashPassword, generateReferralCode, generateToken } from "./crypto";

// Fresh start every time this script runs (local file driver only — running
// seed against a remote Turso database will simply add to what's there).
if (!process.env.TURSO_DATABASE_URL) {
  const DB_FILE = path.join(process.cwd(), "data", "carebridge.db");
  for (const suffix of ["", "-wal", "-shm"]) {
    const p = `${DB_FILE}${suffix}`;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

async function main() {
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

async function addUser(name: string, email: string, role: "FAMILY" | "PROFESSIONAL" | "AGENCY" | "ADMIN") {
  const userId = id("usr");
  await run(
    `INSERT INTO users (id, email, password_hash, role, name, referral_code, email_verified, created_at)
     VALUES ($id, $email, $hash, $role, $name, $refCode, 1, $createdAt)`,
    { id: userId, email, hash: hashPassword("password123"), role, name, refCode: generateReferralCode(name), createdAt: daysAgo(60) }
  );
  return userId;
}

await addUser("Priya Nathan", "admin@marramcare.co.uk", "ADMIN");

const familySeed = [
  { name: "Grace Oyelaran", email: "grace@family.demo", careRecipientName: "Mum (Adaeze)", conditions: ["complex_health", "peg_feeding", "palliative"], location: "Manchester", budgetMin: 18, budgetMax: 26, fundingSource: "NHS_CHC_PHB", notes: "Needs overnight cover 3x/week, recently discharged from Wythenshawe Hospital." },
  { name: "Daniel Kowalski", email: "daniel@family.demo", careRecipientName: "Son (Oskar, 9)", conditions: ["autism", "learning_disability", "behavioural_support"], location: "Leeds", budgetMin: 15, budgetMax: 20, fundingSource: "LOCAL_AUTHORITY_DIRECT_PAYMENT", notes: "After-school support, sensory-friendly approach essential." },
  { name: "Fatima Al-Sayed", email: "fatima@family.demo", careRecipientName: "Dad (Hassan)", conditions: ["physical_disability", "community_care", "medication"], location: "Birmingham", budgetMin: 16, budgetMax: 22, fundingSource: "SELF_FUNDED", notes: "Stroke recovery, needs mobility support and medication prompts twice daily." },
];

const families = await Promise.all(familySeed.map(async (f) => {
  const userId = await addUser(f.name, f.email, "FAMILY");
  const famId = id("fam");
  await run(
    `INSERT INTO family_profiles (id, user_id, care_recipient_name, conditions, location, budget_min, budget_max, funding_source, notes, created_at)
     VALUES ($id, $uid, $name, $conditions, $loc, $bmin, $bmax, $funding, $notes, $createdAt)`,
    { id: famId, uid: userId, name: f.careRecipientName, conditions: JSON.stringify(f.conditions), loc: f.location, bmin: f.budgetMin, bmax: f.budgetMax, funding: f.fundingSource, notes: f.notes, createdAt: daysAgo(45) }
  );
  return { userId, famId, ...f };
}));

type ProSeed = {
  name: string; email: string; headline: string; bio: string; hourlyRate: number; location: string;
  yearsExperience: number; status: string; identityVerified: boolean; referencesVerified: boolean;
  dbsUpdateServiceSubscribed: boolean; experiences: { tagKey: string; level: string }[]; rating: number; ratingCount: number;
};

const proSeed: ProSeed[] = [
  { name: "Marcus Bailey", email: "marcus@pro.demo", headline: "Registered Nursing Associate — complex & palliative care", bio: "8 years in community complex care, including PEG feeding, tracheostomy care and end-of-life support. NMC registered.", hourlyRate: 24, location: "Manchester", yearsExperience: 8, status: "VERIFIED", identityVerified: true, referencesVerified: true, dbsUpdateServiceSubscribed: true, experiences: [{ tagKey: "complex_health", level: "FIVE_PLUS" }, { tagKey: "peg_feeding", level: "FIVE_PLUS" }, { tagKey: "tracheostomy", level: "ONE_PLUS" }, { tagKey: "palliative", level: "FIVE_PLUS" }, { tagKey: "medication", level: "FIVE_PLUS" }], rating: 4.9, ratingCount: 37 },
  { name: "Sade Adeyemi", email: "sade@pro.demo", headline: "Complex care support worker — PEG & palliative experience", bio: "Home care specialist supporting families through hospital-to-home transitions. Trained in PEG feeding and end-of-life care.", hourlyRate: 19, location: "Manchester", yearsExperience: 4, status: "VERIFIED", identityVerified: true, referencesVerified: true, dbsUpdateServiceSubscribed: true, experiences: [{ tagKey: "complex_health", level: "ONE_PLUS" }, { tagKey: "peg_feeding", level: "ONE_PLUS" }, { tagKey: "palliative", level: "TRAINED" }, { tagKey: "community_care", level: "FIVE_PLUS" }], rating: 4.7, ratingCount: 22 },
  { name: "Callum Reid", email: "callum@pro.demo", headline: "Autism & learning disability support specialist", bio: "PBS-trained support worker, 6 years working with autistic children and young people in home and school settings.", hourlyRate: 18, location: "Leeds", yearsExperience: 6, status: "VERIFIED", identityVerified: true, referencesVerified: true, dbsUpdateServiceSubscribed: true, experiences: [{ tagKey: "autism", level: "FIVE_PLUS" }, { tagKey: "learning_disability", level: "FIVE_PLUS" }, { tagKey: "behavioural_support", level: "FIVE_PLUS" }, { tagKey: "paediatric_complex", level: "ONE_PLUS" }], rating: 4.8, ratingCount: 41 },
  { name: "Aisha Rahman", email: "aisha@pro.demo", headline: "Mental health & behavioural support worker", bio: "Background in CAMHS support services, now working 1:1 with families needing mental health and behavioural support at home.", hourlyRate: 17, location: "Leeds", yearsExperience: 3, status: "IN_REVIEW", identityVerified: true, referencesVerified: false, dbsUpdateServiceSubscribed: false, experiences: [{ tagKey: "mental_health", level: "ONE_PLUS" }, { tagKey: "behavioural_support", level: "ONE_PLUS" }, { tagKey: "autism", level: "TRAINED" }], rating: 4.5, ratingCount: 9 },
  { name: "Josephine Achebe", email: "josephine@pro.demo", headline: "Domiciliary carer — stroke recovery & mobility support", bio: "Experienced domiciliary carer supporting stroke recovery, medication management and community mobility across Birmingham.", hourlyRate: 18, location: "Birmingham", yearsExperience: 5, status: "VERIFIED", identityVerified: true, referencesVerified: true, dbsUpdateServiceSubscribed: true, experiences: [{ tagKey: "physical_disability", level: "FIVE_PLUS" }, { tagKey: "community_care", level: "FIVE_PLUS" }, { tagKey: "medication", level: "ONE_PLUS" }], rating: 4.9, ratingCount: 55 },
  { name: "Tom Whitfield", email: "tom@pro.demo", headline: "Newly qualified support worker — community care", bio: "Recently completed Care Certificate, keen to build experience in community and complex care settings.", hourlyRate: 14, location: "Birmingham", yearsExperience: 1, status: "PENDING", identityVerified: false, referencesVerified: false, dbsUpdateServiceSubscribed: false, experiences: [{ tagKey: "community_care", level: "TRAINED" }, { tagKey: "physical_disability", level: "TRAINED" }], rating: 0, ratingCount: 0 },
];

const pros = await Promise.all(proSeed.map(async (p) => {
  const userId = await addUser(p.name, p.email, "PROFESSIONAL");
  const proId = id("pro");
  await run(
    `INSERT INTO professional_profiles
      (id, user_id, headline, bio, hourly_rate, location, years_experience, identity_verified, references_verified,
       dbs_update_service_subscribed, verification_status, rating_avg, rating_count, created_at)
     VALUES ($id, $uid, $headline, $bio, $rate, $loc, $years, $idv, $refv, $dbsUpd, $status, $rating, $ratingCount, $createdAt)`,
    { id: proId, uid: userId, headline: p.headline, bio: p.bio, rate: p.hourlyRate, loc: p.location, years: p.yearsExperience, idv: p.identityVerified ? 1 : 0, refv: p.referencesVerified ? 1 : 0, dbsUpd: p.dbsUpdateServiceSubscribed ? 1 : 0, status: p.status, rating: p.rating, ratingCount: p.ratingCount, createdAt: daysAgo(30) }
  );

  for (const exp of p.experiences) {
    await run(`INSERT INTO professional_experiences (id, professional_id, tag_key, level) VALUES ($id, $pid, $tag, $level)`, {
      id: id("exp"), pid: proId, tag: exp.tagKey, level: exp.level,
    });
  }

  const docStatus = (base: string) => (p.status === "VERIFIED" ? "VERIFIED" : base);
  const docs: { type: string; suffix: string; status: string; expiresAt?: string }[] = [
    { type: "DBS", suffix: "DBS_certificate.pdf", status: p.status === "VERIFIED" ? "VERIFIED" : p.status === "REJECTED" ? "REJECTED" : "PENDING", expiresAt: p.name === "Sade Adeyemi" ? daysFromNow(35) : daysFromNow(365) },
    { type: "REFERENCE", suffix: "reference_1.pdf", status: p.referencesVerified ? "VERIFIED" : "PENDING" },
    { type: "QUALIFICATION", suffix: "care_certificate.pdf", status: docStatus("PENDING") },
  ];
  for (const d of docs) {
    await run(
      `INSERT INTO documents (id, professional_id, type, file_name, status, expires_at, uploaded_at, reviewed_at)
       VALUES ($id, $pid, $type, $fileName, $status, $expiresAt, $uploadedAt, $reviewedAt)`,
      {
        id: id("doc"), pid: proId, type: d.type, fileName: `${p.name.replace(/\s/g, "_")}_${d.suffix}`,
        status: d.status, expiresAt: d.expiresAt ?? null, uploadedAt: daysAgo(28),
        reviewedAt: d.status === "VERIFIED" ? daysAgo(25) : null,
      }
    );
  }

  // A sample verified certification for the flagship verified professional.
  if (p.name === "Marcus Bailey") {
    await run(
      `INSERT INTO certifications (id, professional_id, title, issuing_body, credential_id, issued_at, expires_at, evidence_file_name, status, reviewed_at, created_at)
       VALUES ($id, $pid, $title, $issuer, $credId, $issuedAt, $expiresAt, $evidence, 'VERIFIED', $reviewedAt, $createdAt)`,
      { id: id("cert"), pid: proId, title: "PEG Feeding & Enteral Care", issuer: "Skills for Care", credId: "SFC-88213", issuedAt: daysAgo(400), expiresAt: daysFromNow(600), evidence: "Marcus_Bailey_PEG_certificate.pdf", reviewedAt: daysAgo(25), createdAt: daysAgo(28) }
    );
  }
  if (p.name === "Callum Reid") {
    await run(
      `INSERT INTO certifications (id, professional_id, title, issuing_body, credential_id, issued_at, expires_at, evidence_file_name, status, created_at)
       VALUES ($id, $pid, $title, $issuer, $credId, $issuedAt, $expiresAt, $evidence, 'PENDING', $createdAt)`,
      { id: id("cert"), pid: proId, title: "Positive Behaviour Support (PBS) Practitioner", issuer: "BILD", credId: "BILD-4471", issuedAt: daysAgo(200), expiresAt: daysFromNow(900), evidence: "Callum_Reid_PBS_certificate.pdf", createdAt: daysAgo(10) }
    );
  }

  return { userId, proId, ...p };
}));

// --- Sample booking, conversation, messages, review, visit log ---
const family1 = families[0];
const pro1 = pros[0];

const bookingId = id("bkg");
await run(
  `INSERT INTO bookings (id, family_id, professional_id, schedule_type, proposed_start, proposed_end, notes, rate_at_booking, status, created_at)
   VALUES ($id, $fid, $pid, 'RECURRING', $start, $end, $notes, $rate, 'ACCEPTED', $createdAt)`,
  { id: bookingId, fid: family1.famId, pid: pro1.proId, start: daysFromNow(3), end: daysFromNow(90), notes: "3 overnight shifts per week, PEG feeding and overnight observation.", rate: pro1.hourlyRate, createdAt: daysAgo(5) }
);

const conversationId = id("cnv");
await run(`INSERT INTO conversations (id, family_id, professional_id, created_at) VALUES ($id, $fid, $pid, $createdAt)`, {
  id: conversationId, fid: family1.famId, pid: pro1.proId, createdAt: daysAgo(6),
});

await run(`INSERT INTO messages (id, conversation_id, sender_id, body, created_at) VALUES ($id, $cid, $sid, $body, $createdAt)`, {
  id: id("msg"), cid: conversationId, sid: family1.userId, body: "Hi Marcus, thanks for accepting the request. Mum's PEG feed is 4x daily — happy to run through the routine on a call before you start?", createdAt: daysAgo(5),
});
await run(`INSERT INTO messages (id, conversation_id, sender_id, body, created_at) VALUES ($id, $cid, $sid, $body, $createdAt)`, {
  id: id("msg"), cid: conversationId, sid: pro1.userId, body: "Of course — I'm free tomorrow evening for a call. I'll also bring my DBS and training certificates for your records on day one.", createdAt: daysAgo(5),
});

await run(
  `INSERT INTO reviews (id, booking_id, author_id, target_id, rating, comment, created_at) VALUES ($id, $bid, $aid, $tid, 5, $comment, $createdAt)`,
  { id: id("rev"), bid: bookingId, aid: family1.userId, tid: pro1.userId, comment: "Marcus has been brilliant — calm, clinically confident, and Mum trusts him completely.", createdAt: daysAgo(1) }
);

for (const [daysBack, notes] of [
  [2, "Evening PEG feed given as scheduled, no issues. Overnight obs every 2 hours, settled well."],
  [1, "Routine overnight visit, PEG site checked and clean, no concerns to flag."],
] as [number, string][]) {
  const checkIn = new Date(daysAgo(daysBack));
  await run(
    `INSERT INTO visit_logs (id, booking_id, professional_id, check_in_at, check_out_at, notes) VALUES ($id, $bid, $pid, $in, $out, $notes)`,
    { id: id("vlg"), bid: bookingId, pid: pro1.proId, in: checkIn.toISOString(), out: new Date(checkIn.getTime() + 8 * 3600000).toISOString(), notes }
  );
}

// --- Sample agency, with one roster professional and one pending invite ---
const agencyUserId = await addUser("Priya Okonkwo", "agency@marramcare.demo", "AGENCY");
const agencyId = id("agy");
await run(
  `INSERT INTO agency_profiles (id, user_id, company_name, description, location, website, company_number, cqc_registered, cqc_number, verification_status, created_at)
   VALUES ($id, $uid, $name, $desc, $loc, $site, $companyNumber, 0, NULL, 'VERIFIED', $createdAt)`,
  {
    id: agencyId,
    uid: agencyUserId,
    name: "Northwest Complex Care Ltd",
    desc: "A specialist staffing agency supplying vetted complex care professionals across Greater Manchester — PEG feeding, palliative and tracheostomy-experienced staff available for placements.",
    loc: "Manchester",
    site: "https://northwestcomplexcare.example",
    companyNumber: "14829213",
    createdAt: daysAgo(40),
  }
);
const sade = pros.find((p) => p.name === "Sade Adeyemi");
if (sade) {
  await run("UPDATE professional_profiles SET agency_id = $aid WHERE id = $id", { id: sade.proId, aid: agencyId });
}
await run(
  `INSERT INTO agency_invites (id, agency_id, email, token, status, created_at) VALUES ($id, $aid, $email, $token, 'PENDING', $createdAt)`,
  { id: id("inv"), aid: agencyId, email: "tom@pro.demo", token: generateToken(), createdAt: daysAgo(2) }
);

console.log(`Seeded ${2 + families.length + pros.length} users, ${families.length} families, ${pros.length} professionals, 1 agency into SQLite.`);
console.log("Demo login (all roles) password: password123");
console.log("  Family:       grace@family.demo");
console.log("  Professional: marcus@pro.demo");
console.log("  Agency:       agency@marramcare.demo");
console.log("  Admin:        admin@marramcare.co.uk");

}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
