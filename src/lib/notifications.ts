/**
 * In-app + email notifications.
 *
 * In-app notifications are always real — stored in SQLite, rendered in the
 * Navbar bell. Email uses a pluggable transport: if RESEND_API_KEY is set,
 * sends via Resend's HTTP API; otherwise writes to the email_outbox table
 * (a fully inspectable, testable "sent mail" log) so the whole notification
 * pipeline is exercised and verifiable without needing real credentials.
 */
import { run, id, nowIso, get } from "./db";

export interface NotifyInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}

export async function notify(input: NotifyInput) {
  await run(
    `INSERT INTO notifications (id, user_id, type, title, body, link, read, created_at)
     VALUES ($id, $userId, $type, $title, $body, $link, 0, $createdAt)`,
    {
      id: id("ntf"),
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
      createdAt: nowIso(),
    }
  );

  const user = await get("SELECT email, name FROM users WHERE id = $id", { id: input.userId });
  if (user) {
    await sendEmail({
      to: user.email,
      subject: input.title,
      body: `Hi ${user.name.split(" ")[0]},\n\n${input.body}${input.link ? `\n\nView: ${input.link}` : ""}\n\n— Marram Care`,
    });
  }
}

export async function markNotificationRead(notificationId: string) {
  await run("UPDATE notifications SET read = 1 WHERE id = $id", { id: notificationId });
}

export async function markAllNotificationsRead(userId: string) {
  await run("UPDATE notifications SET read = 1 WHERE user_id = $uid", { uid: userId });
}

// ---------- email transport ----------

interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(input: SendEmailInput) {
  const provider = process.env.RESEND_API_KEY ? "resend" : "dev-outbox";

  if (provider === "resend") {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Marram Care <notifications@marramcare.co.uk>",
          to: input.to,
          subject: input.subject,
          text: input.body,
        }),
      });
      await logOutbox(input, "resend", "sent");
    } catch {
      await logOutbox(input, "resend", "failed");
    }
  } else {
    // Dev transport: log to the outbox so the flow is fully testable without real credentials.
    await logOutbox(input, "dev-outbox", "sent");
  }
}

async function logOutbox(input: SendEmailInput, provider: string, status: string) {
  await run(
    `INSERT INTO email_outbox (id, to_email, subject, body, provider, status, created_at)
     VALUES ($id, $to, $subject, $body, $provider, $status, $createdAt)`,
    {
      id: id("eml"),
      to: input.to,
      subject: input.subject,
      body: input.body,
      provider,
      status,
      createdAt: nowIso(),
    }
  );
}
