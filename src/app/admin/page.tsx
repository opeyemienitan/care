import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Verification Queue",
  robots: { index: false, follow: false },
};

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  listPendingDocuments,
  listPendingCertifications,
  listProfessionals,
  listSafeguardingReports,
  listLeads,
  countFamilies,
  countAllBookings,
  getPlatformRevenueSummary,
  listPendingAgencyVerifications,
  countAgencies,
} from "@/lib/queries";
import { Card, Badge, Button, SectionHeading } from "@/components/ui";
import { daysUntil, expiryTone, expiryLabel } from "@/lib/documents";
import { adminReviewDocumentAction, adminReviewCertificationAction, resolveSafeguardingReportAction } from "@/app/actions";
import { adminReviewAgencyAction } from "@/app/agency-actions";

const severityTone: Record<string, "danger" | "warning" | "info" | "neutral"> = {
  URGENT: "danger",
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "neutral",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const pending = await listPendingDocuments();
  const pendingCerts = await listPendingCertifications();
  const professionals = await listProfessionals();
  const reports = await listSafeguardingReports();
  const openReports = reports.filter((r) => r.report.status === "OPEN");
  const leads = await listLeads();
  const revenue = await getPlatformRevenueSummary();
  const pendingAgencies = await listPendingAgencyVerifications();

  const metrics = [
    { label: "Active families", value: await countFamilies() },
    { label: "Active professionals", value: professionals.length },
    { label: "Verified professionals", value: professionals.filter((p) => p.verificationStatus === "VERIFIED").length },
    { label: "Agencies", value: await countAgencies() },
    { label: "Bookings made", value: await countAllBookings() },
    { label: "Pending documents", value: pending.length + pendingCerts.length },
    { label: "Open safeguarding reports", value: openReports.length },
    { label: "Newsletter leads", value: leads.length },
  ];

  return (
    <div className="container-page py-14">
      <SectionHeading eyebrow="Admin" title="Verification & platform overview" />

      <div className="mt-8 grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="p-5">
            <p className="text-2xl font-semibold text-ink">{m.value}</p>
            <p className="text-xs text-ink/50 mt-1">{m.label}</p>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 font-semibold text-ink text-lg">Revenue</h2>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-2xl font-semibold text-ink">£{revenue.feeRealized.toFixed(2)}</p>
          <p className="text-xs text-ink/50 mt-1">Platform fee earned (completed bookings)</p>
        </Card>
        <Card className="p-5">
          <p className="text-2xl font-semibold text-ink">£{revenue.feePipeline.toFixed(2)}</p>
          <p className="text-xs text-ink/50 mt-1">Platform fee in pipeline (held, not yet released)</p>
        </Card>
        <Card className="p-5">
          <p className="text-2xl font-semibold text-ink">£{revenue.grossReleased.toFixed(2)}</p>
          <p className="text-xs text-ink/50 mt-1">Gross booking value paid out</p>
        </Card>
        <Card className="p-5">
          <p className="text-2xl font-semibold text-ink">{revenue.paymentCount}</p>
          <p className="text-xs text-ink/50 mt-1">Total payment records</p>
        </Card>
      </div>
      <p className="mt-2 text-xs text-ink/40">
        Simulated via mock Stripe Connect until live API keys are configured — see /trust-and-safety and README.
      </p>

      <h2 className="mt-12 font-semibold text-ink text-lg">Agency verification queue</h2>
      <div className="mt-4 space-y-4">
        {pendingAgencies.length === 0 && <Card className="p-6 text-sm text-ink/60">No agencies awaiting verification.</Card>}
        {pendingAgencies.map(({ agency, user: agencyUser }) => (
          <Card key={agency.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-ink">{agency.companyName}</p>
              <p className="text-sm text-ink/50">
                {agencyUser.name} · {agencyUser.email} · {agency.location}
              </p>
              <p className="text-sm text-ink/50 mt-1">
                {agency.cqcRegistered ? `CQC-registered (${agency.cqcNumber || "no number given"})` : "Not CQC-registered"}
                {agency.companyNumber ? ` · Companies House #${agency.companyNumber}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <form action={adminReviewAgencyAction}>
                <input type="hidden" name="agencyId" value={agency.id} />
                <input type="hidden" name="decision" value="VERIFIED" />
                <Button type="submit" size="sm">Verify</Button>
              </form>
              <form action={adminReviewAgencyAction}>
                <input type="hidden" name="agencyId" value={agency.id} />
                <input type="hidden" name="decision" value="REJECTED" />
                <Button type="submit" size="sm" variant="outline">Reject</Button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 font-semibold text-ink text-lg">Document verification queue</h2>
      <div className="mt-4 space-y-4">
        {pending.length === 0 && <Card className="p-6 text-sm text-ink/60">Nothing pending review.</Card>}
        {pending.map(({ doc, professional, user: proUser }) => (
          <Card key={doc.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-ink">{proUser.name} — {professional.headline}</p>
              <p className="text-sm text-ink/50">
                {doc.type.replace("_", " ")} ·{" "}
                {doc.storageKey ? (
                  <a href={`/api/uploads/${doc.storageKey}`} target="_blank" rel="noopener noreferrer" className="text-teal-700 underline">
                    {doc.fileName}
                  </a>
                ) : (
                  doc.fileName
                )}{" "}
                · uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-GB")}
              </p>
              {doc.expiresAt && (
                <Badge tone={expiryTone(daysUntil(doc.expiresAt))} className="mt-1">
                  {expiryLabel(daysUntil(doc.expiresAt))}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <form action={adminReviewDocumentAction}>
                <input type="hidden" name="docId" value={doc.id} />
                <input type="hidden" name="decision" value="VERIFIED" />
                <Button type="submit" size="sm">Approve</Button>
              </form>
              <form action={adminReviewDocumentAction}>
                <input type="hidden" name="docId" value={doc.id} />
                <input type="hidden" name="decision" value="REJECTED" />
                <Button type="submit" size="sm" variant="outline">Reject</Button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 font-semibold text-ink text-lg">Training & certification queue</h2>
      <div className="mt-4 space-y-4">
        {pendingCerts.length === 0 && <Card className="p-6 text-sm text-ink/60">Nothing pending review.</Card>}
        {pendingCerts.map(({ cert, professional, user: proUser }) => (
          <Card key={cert.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-ink">{proUser.name} — {professional.headline}</p>
              <p className="text-sm text-ink/70 mt-0.5">
                {cert.title} <span className="text-ink/40">· {cert.issuingBody}</span>
              </p>
              <p className="text-sm text-ink/50">
                {cert.evidenceFileName &&
                  (cert.storageKey ? (
                    <a href={`/api/uploads/${cert.storageKey}`} target="_blank" rel="noopener noreferrer" className="text-teal-700 underline">
                      {cert.evidenceFileName}
                    </a>
                  ) : (
                    cert.evidenceFileName
                  ))}
                {cert.evidenceFileName ? " · " : ""}
                {cert.credentialId ? `Credential ${cert.credentialId} · ` : ""}
                submitted {new Date(cert.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="flex gap-2">
              <form action={adminReviewCertificationAction}>
                <input type="hidden" name="certId" value={cert.id} />
                <input type="hidden" name="decision" value="VERIFIED" />
                <Button type="submit" size="sm">Approve</Button>
              </form>
              <form action={adminReviewCertificationAction}>
                <input type="hidden" name="certId" value={cert.id} />
                <input type="hidden" name="decision" value="REJECTED" />
                <Button type="submit" size="sm" variant="outline">Reject</Button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 font-semibold text-ink text-lg">Safeguarding reports</h2>
      <div className="mt-4 space-y-4">
        {reports.length === 0 && <Card className="p-6 text-sm text-ink/60">No reports filed.</Card>}
        {reports.map(({ report, reporter, professional }) => (
          <Card key={report.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone={report.status === "OPEN" ? "danger" : report.status === "IN_PROGRESS" ? "warning" : "success"}>
                  {report.status.replace("_", " ").toLowerCase()}
                </Badge>
                {report.severity && (
                  <Badge tone={severityTone[report.severity] ?? "neutral"}>
                    {report.severity} priority
                  </Badge>
                )}
                <span className="text-sm font-medium text-ink">{report.category}</span>
              </div>
              <p className="mt-1 text-sm text-ink/70 max-w-xl">{report.details}</p>
              <p className="mt-1 text-xs text-ink/40">
                Reported by {reporter?.name ?? "unknown"}
                {professional ? ` about ${professional.headline}` : ""} ·{" "}
                {new Date(report.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            {report.status !== "RESOLVED" && (
              <div className="flex gap-2">
                {report.status === "OPEN" && (
                  <form action={resolveSafeguardingReportAction}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="status" value="IN_PROGRESS" />
                    <Button type="submit" size="sm" variant="outline">Investigating</Button>
                  </form>
                )}
                <form action={resolveSafeguardingReportAction}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="status" value="RESOLVED" />
                  <Button type="submit" size="sm">Mark resolved</Button>
                </form>
              </div>
            )}
          </Card>
        ))}
      </div>

      <h2 className="mt-12 font-semibold text-ink text-lg">All professionals</h2>
      <div className="mt-4 space-y-3">
        {professionals.map((p) => (
          <Card key={p.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-ink/80">{p.headline}</p>
            <Badge
              tone={
                p.verificationStatus === "VERIFIED"
                  ? "success"
                  : p.verificationStatus === "REJECTED"
                  ? "danger"
                  : p.verificationStatus === "IN_REVIEW"
                  ? "info"
                  : "neutral"
              }
            >
              {p.verificationStatus.toLowerCase().replace("_", " ")}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
