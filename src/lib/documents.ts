export function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export function expiryTone(days: number | null): "success" | "warning" | "danger" | "neutral" {
  if (days === null) return "neutral";
  if (days < 0) return "danger";
  if (days <= 60) return "warning";
  return "success";
}

export function expiryLabel(days: number | null): string {
  if (days === null) return "No expiry on file";
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return "Expires today";
  return `Expires in ${days}d`;
}
