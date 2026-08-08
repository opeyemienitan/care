/**
 * Database driver selection.
 *
 * Local dev (default): Node's built-in `node:sqlite` module — a real embedded
 * SQLite file at data/carebridge.db. Zero setup, zero network dependency.
 *
 * Production (Vercel): Vercel's serverless functions have an ephemeral,
 * per-invocation filesystem — a local SQLite *file* does not persist across
 * requests or cold starts there, so it cannot be used in production as-is.
 * When TURSO_DATABASE_URL is set, this module instead talks to Turso
 * (libSQL) — a hosted, network-reachable database that speaks the same SQL
 * dialect as SQLite, so the schema and every query in this app are unchanged.
 * See README "Deploying to Vercel" for setup.
 */
import path from "path";
import fs from "fs";
import crypto from "crypto";

export function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function b(value: boolean): number {
  return value ? 1 : 0;
}

export function bb(value: unknown): boolean {
  return value === 1 || value === true;
}

const SCHEMA_SQL = `
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      referral_code TEXT UNIQUE NOT NULL,
      referred_by TEXT,
      email_verified INTEGER NOT NULL DEFAULT 0,
      verification_token TEXT,
      verification_token_expires TEXT,
      reset_token TEXT,
      reset_token_expires TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS family_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
      care_recipient_name TEXT NOT NULL,
      conditions TEXT NOT NULL,
      location TEXT NOT NULL,
      budget_min INTEGER NOT NULL,
      budget_max INTEGER NOT NULL,
      funding_source TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS professional_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
      headline TEXT NOT NULL,
      bio TEXT NOT NULL,
      hourly_rate INTEGER NOT NULL,
      location TEXT NOT NULL,
      years_experience INTEGER NOT NULL,
      identity_verified INTEGER NOT NULL DEFAULT 0,
      references_verified INTEGER NOT NULL DEFAULT 0,
      dbs_update_service_subscribed INTEGER NOT NULL DEFAULT 0,
      payout_account_connected INTEGER NOT NULL DEFAULT 0,
      payout_provider_ref TEXT,
      verification_status TEXT NOT NULL DEFAULT 'PENDING',
      rating_avg REAL NOT NULL DEFAULT 0,
      rating_count INTEGER NOT NULL DEFAULT 0,
      agency_id TEXT REFERENCES agency_profiles(id),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agency_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
      company_name TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      website TEXT,
      company_number TEXT,
      cqc_registered INTEGER NOT NULL DEFAULT 0,
      cqc_number TEXT,
      verification_status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agency_invites (
      id TEXT PRIMARY KEY,
      agency_id TEXT NOT NULL REFERENCES agency_profiles(id),
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS professional_experiences (
      id TEXT PRIMARY KEY,
      professional_id TEXT NOT NULL REFERENCES professional_profiles(id),
      tag_key TEXT NOT NULL,
      level TEXT NOT NULL,
      UNIQUE(professional_id, tag_key)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      professional_id TEXT NOT NULL REFERENCES professional_profiles(id),
      type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      expires_at TEXT,
      uploaded_at TEXT NOT NULL,
      reviewed_at TEXT,
      review_note TEXT,
      auto_check_provider TEXT,
      auto_check_result TEXT,
      auto_check_confidence REAL,
      storage_key TEXT
    );

CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL REFERENCES bookings(id),
      family_id TEXT NOT NULL REFERENCES family_profiles(id),
      professional_id TEXT NOT NULL REFERENCES professional_profiles(id),
      gross_amount REAL NOT NULL,
      platform_fee_amount REAL NOT NULL,
      professional_payout_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'AUTHORIZED',
      provider TEXT NOT NULL,
      provider_ref TEXT,
      created_at TEXT NOT NULL,
      released_at TEXT
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      professional_id TEXT NOT NULL REFERENCES professional_profiles(id),
      title TEXT NOT NULL,
      issuing_body TEXT NOT NULL,
      credential_id TEXT,
      issued_at TEXT,
      expires_at TEXT,
      evidence_file_name TEXT,
      storage_key TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      reviewed_at TEXT,
      review_note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL REFERENCES family_profiles(id),
      professional_id TEXT NOT NULL REFERENCES professional_profiles(id),
      schedule_type TEXT NOT NULL,
      proposed_start TEXT NOT NULL,
      proposed_end TEXT,
      notes TEXT,
      rate_at_booking INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'REQUESTED',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL REFERENCES family_profiles(id),
      professional_id TEXT NOT NULL REFERENCES professional_profiles(id),
      created_at TEXT NOT NULL,
      UNIQUE(family_id, professional_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id),
      sender_id TEXT NOT NULL REFERENCES users(id),
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL REFERENCES bookings(id),
      author_id TEXT NOT NULL REFERENCES users(id),
      target_id TEXT NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS safeguarding_reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL REFERENCES users(id),
      about_professional_id TEXT,
      about_booking_id TEXT,
      category TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      severity TEXT,
      ai_summary TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS visit_logs (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL REFERENCES bookings(id),
      professional_id TEXT NOT NULL REFERENCES professional_profiles(id),
      check_in_at TEXT NOT NULL,
      check_out_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      link TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_outbox (
      id TEXT PRIMARY KEY,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      provider TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
`;

interface Driver {
  exec(sql: string): Promise<void>;
  all(sql: string, params: Record<string, unknown>): Promise<any[]>;
  get(sql: string, params: Record<string, unknown>): Promise<any>;
  run(sql: string, params: Record<string, unknown>): Promise<void>;
}

declare global {
  // eslint-disable-next-line no-var
  var __cbDriver: Driver | undefined;
  // eslint-disable-next-line no-var
  var __cbSchemaReady: Promise<void> | undefined;
}

function localSqliteDriver(): Driver {
  // Loaded lazily so this codepath (and its node:sqlite dependency) is never
  // touched when running against Turso in production.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { DatabaseSync } = require("node:sqlite");
  const DB_PATH = path.join(process.cwd(), "data", "carebridge.db");
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const conn = new DatabaseSync(DB_PATH);
  conn.exec("PRAGMA journal_mode = WAL;");

  return {
    async exec(sql: string) {
      conn.exec(sql);
    },
    async all(sql: string, params: Record<string, unknown>) {
      return conn.prepare(sql).all(params);
    },
    async get(sql: string, params: Record<string, unknown>) {
      return conn.prepare(sql).get(params);
    },
    async run(sql: string, params: Record<string, unknown>) {
      conn.prepare(sql).run(params);
    },
  };
}

function tursoDriver(): Driver {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require("@libsql/client");
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // libSQL takes named params without the leading $/: prefix in the args object.
  function unprefix(params: Record<string, unknown>) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(params)) out[k.replace(/^\$/, "")] = v;
    return out;
  }

  return {
    async exec(sql: string) {
      for (const stmt of sql.split(";").map((s) => s.trim()).filter(Boolean)) {
        await client.execute(stmt);
      }
    },
    async all(sql: string, params: Record<string, unknown>) {
      const res = await client.execute({ sql, args: unprefix(params) });
      return res.rows;
    },
    async get(sql: string, params: Record<string, unknown>) {
      const res = await client.execute({ sql, args: unprefix(params) });
      return res.rows[0];
    },
    async run(sql: string, params: Record<string, unknown>) {
      await client.execute({ sql, args: unprefix(params) });
    },
  };
}

function getDriver(): Driver {
  if (!global.__cbDriver) {
    global.__cbDriver = process.env.TURSO_DATABASE_URL ? tursoDriver() : localSqliteDriver();
  }
  return global.__cbDriver;
}

async function ensureSchema() {
  if (!global.__cbSchemaReady) {
    global.__cbSchemaReady = getDriver().exec(SCHEMA_SQL);
  }
  await global.__cbSchemaReady;
}

export async function dbAll(sql: string, params: Record<string, unknown> = {}): Promise<any[]> {
  await ensureSchema();
  return getDriver().all(sql, params);
}

export async function dbGet(sql: string, params: Record<string, unknown> = {}): Promise<any> {
  await ensureSchema();
  return getDriver().get(sql, params);
}

export async function dbRun(sql: string, params: Record<string, unknown> = {}): Promise<void> {
  await ensureSchema();
  await getDriver().run(sql, params);
}
