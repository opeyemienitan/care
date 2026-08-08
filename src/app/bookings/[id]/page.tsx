import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Details",
  robots: { index: false, follow: false },
};

import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBookingById, getOrCreateConversationLookup, getConversationById, listVisitLogs } from "@/lib/queries";
import { Card, Badge, Button, Field, inputClass } from "@/components/ui";
import { respondBookingAction, sendMessageAction, postReviewAction, submitSafeguardingReportAction, checkInVisitAction, checkOutVisitAction } from "@/app/actions";
import { getPaymentForBooking } from "@/lib/payments";
import { computeFeeBreakdown } from "@/lib/pricing";

const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  REQUESTED: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
  COMPLETED: "info",
  CANCELLED: "neutral",
};

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const record = await getBookingById(params.id);
  if (!record) notFound();
  const { booking, family, professional, familyUser, proUser, review } = record;

  const isFamily = user.id === familyUser.id;
  const isProfessional = user.id === proUser.id;
  if (!isFamily && !isProfessional && user.role !== "ADMIN") redirect("/");

  const visits = await listVisitLogs(booking.id);
  const openVisit = visits.find((v) => !v.checkOutAt);
  const conversationLookup = await getOrCreateConversationLookup(family.id, professional.id);
  const conversation = conversationLookup ? await getConversationById(conversationLookup.id) : undefined;
  const payment = await getPaymentForBooking(booking.id);
  const fees = computeFeeBreakdown(booking.rateAtBooking);

  return (
    <div className="container-page py-14 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-ink/50">
                {isFamily ? professional.headline : family.careRecipientName}
              </p>
              <h1 className="text-xl font-semibold text-ink mt-1">
                {booking.scheduleType.replace("_", " ")} care · £{booking.rateAtBooking}/hr
              </h1>
              <p className="text-sm text-ink/50 mt-1">
                Starting {new Date(booking.proposedStart).toLocaleDateString("en-GB")}
              </p>
            </div>
            <Badge tone={statusTone[booking.status]}>{booking.status.toLowerCase()}</Badge>
          </div>
          {booking.notes && <p className="mt-4 text-sm text-ink/70 bg-sand-50 rounded-lg p-3">{booking.notes}</p>}

          {isProfessional && booking.status === "REQUESTED" && (
            <div className="mt-5 flex gap-3">
              <form action={respondBookingAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <input type="hidden" name="status" value="ACCEPTED" />
                <Button type="submit" size="sm">Accept</Button>
              </form>
              <form action={respondBookingAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <input type="hidden" name="status" value="DECLINED" />
                <Button type="submit" size="sm" variant="outline">Decline</Button>
              </form>
            </div>
          )}

          {(isFamily || isProfessional) && booking.status === "ACCEPTED" && (
            <div className="mt-5 flex gap-3">
              <form action={respondBookingAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <input type="hidden" name="status" value="COMPLETED" />
                <Button type="submit" size="sm">Mark as completed</Button>
              </form>
              <form action={respondBookingAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <input type="hidden" name="status" value="CANCELLED" />
                <Button type="submit" size="sm" variant="outline">Cancel</Button>
              </form>
            </div>
          )}
        </Card>

        {(booking.status === "ACCEPTED" || booking.status === "COMPLETED") && (
          <Card className="p-6">
            <h2 className="font-semibold text-ink">Care visit log</h2>
            <p className="text-xs text-ink/50 mt-1">
              A time-stamped record of each visit — check in on arrival, check out with notes when
              you leave.
            </p>

            {isProfessional && booking.status === "ACCEPTED" && (
              <div className="mt-4">
                {openVisit ? (
                  <form action={checkOutVisitAction} className="space-y-3">
                    <input type="hidden" name="visitId" value={openVisit.id} />
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <p className="text-sm text-teal-700 font-medium">
                      Checked in at {new Date(openVisit.checkInAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <Field label="Visit notes">
                      <textarea name="notes" rows={2} className={inputClass} placeholder="What happened during this visit?" />
                    </Field>
                    <Button type="submit" size="sm">Check out</Button>
                  </form>
                ) : (
                  <form action={checkInVisitAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <Button type="submit" size="sm">Check in</Button>
                  </form>
                )}
              </div>
            )}

            <div className="mt-4 space-y-3">
              {visits.length === 0 && <p className="text-sm text-ink/50">No visits logged yet.</p>}
              {visits.map((v) => (
                <div key={v.id} className="text-sm border-b border-sand-100 pb-2 last:border-0">
                  <p className="text-ink/70">
                    {new Date(v.checkInAt).toLocaleDateString("en-GB")} ·{" "}
                    {new Date(v.checkInAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    {v.checkOutAt
                      ? ` – ${new Date(v.checkOutAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                      : " – in progress"}
                  </p>
                  {v.notes && <p className="text-ink/50 mt-0.5">{v.notes}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {booking.status === "COMPLETED" && (
          <Card className="p-6">
            <h2 className="font-semibold text-ink">Review</h2>
            {review ? (
              <div className="mt-3">
                <p className="text-coral-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                <p className="mt-2 text-sm text-ink/70">{review.comment}</p>
              </div>
            ) : (isFamily || isProfessional) ? (
              <form action={postReviewAction} className="mt-3 space-y-3">
                <input type="hidden" name="bookingId" value={booking.id} />
                <input type="hidden" name="targetId" value={isFamily ? proUser.id : familyUser.id} />
                <Field label="Rating">
                  <select name="rating" className={inputClass} defaultValue="5">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Comment">
                  <textarea name="comment" rows={3} className={inputClass} placeholder="How did it go?" required />
                </Field>
                <Button type="submit" size="sm">Post review</Button>
              </form>
            ) : null}
          </Card>
        )}

        {payment && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">Payment</h2>
              <Badge
                tone={
                  payment.status === "RELEASED"
                    ? "success"
                    : payment.status === "REFUNDED"
                    ? "neutral"
                    : "info"
                }
              >
                {payment.status === "AUTHORIZED"
                  ? "Held (released on completion)"
                  : payment.status === "RELEASED"
                  ? "Paid out"
                  : "Refunded"}
              </Badge>
            </div>
            <div className="mt-4 text-sm space-y-1.5">
              <div className="flex justify-between text-ink/70">
                <span>Hourly rate</span>
                <span>£{fees.hourlyRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink/50">
                <span>Platform fee ({fees.platformFeePercent}%)</span>
                <span>−£{fees.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-ink pt-1.5 border-t border-sand-100">
                <span>{isProfessional ? "You receive" : "Professional receives"}</span>
                <span>£{fees.professionalPayout.toFixed(2)}/hr</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-ink/40">
              {payment.provider === "mock-stripe-connect"
                ? "Simulated via mock Stripe Connect — no real card was charged. "
                : ""}
              Funds are held on request and released to the professional's connected payout account once the booking is marked completed.
            </p>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="font-semibold text-ink">Messages</h2>
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {conversation?.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.senderId === user.id ? "ml-auto bg-teal-700 text-white" : "bg-sand-100 text-ink"
                }`}
              >
                {m.body}
              </div>
            ))}
            {(!conversation || conversation.messages.length === 0) && (
              <p className="text-sm text-ink/50">No messages yet.</p>
            )}
          </div>
          {conversation && (
            <form action={sendMessageAction} className="mt-4 flex gap-2">
              <input type="hidden" name="conversationId" value={conversation.conversation.id} />
              <input
                name="body"
                className={inputClass}
                placeholder="Write a message..."
                required
              />
              <Button type="submit" size="sm">Send</Button>
            </form>
          )}
        </Card>
      </div>

      <div>
        <Card className="p-6">
          <h3 className="font-semibold text-ink text-sm">Family</h3>
          <p className="mt-1 text-sm text-ink/70">{family.careRecipientName} · {family.location}</p>
          <h3 className="mt-4 font-semibold text-ink text-sm">Professional</h3>
          <p className="mt-1 text-sm text-ink/70">{professional.headline}</p>
        </Card>

        <details className="mt-4 group">
          <summary className="cursor-pointer text-xs text-ink/40 hover:text-ink/60 select-none">
            Report a safeguarding concern about this booking
          </summary>
          <Card className="mt-3 p-5">
            <form action={submitSafeguardingReportAction} className="space-y-3">
              <input type="hidden" name="aboutBookingId" value={booking.id} />
              <input type="hidden" name="aboutProfessionalId" value={professional.id} />
              <input type="hidden" name="redirectTo" value={`/bookings/${booking.id}`} />
              <Field label="What's this about?">
                <select name="category" className={inputClass} defaultValue="Conduct concern">
                  <option>Conduct concern</option>
                  <option>Missed or unsafe visit</option>
                  <option>Suspected fraud / fake credentials</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Details">
                <textarea name="details" rows={3} className={inputClass} required />
              </Field>
              <Button type="submit" size="sm" variant="outline">Submit report</Button>
            </form>
          </Card>
        </details>
      </div>
    </div>
  );
}
