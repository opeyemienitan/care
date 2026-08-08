import Link from "next/link";
import { listNotifications, countUnreadNotifications } from "@/lib/queries";
import { markAllNotificationsRead } from "@/lib/notifications";

export default async function NotificationBell({ userId }: { userId: string }) {
  const [notifications, unread] = await Promise.all([
    listNotifications(userId, 8),
    countUnreadNotifications(userId),
  ]);

  async function markRead() {
    "use server";
    await markAllNotificationsRead(userId);
  }

  return (
    <details className="relative">
      <summary
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="list-none cursor-pointer flex items-center justify-center h-9 w-9 rounded-full hover:bg-sand-100 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 && (
          <span aria-hidden="true" className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral-500 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </summary>
      <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl2 bg-white shadow-card border border-sand-200 z-50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-sand-100">
          <p className="text-sm font-semibold text-ink">Notifications</p>
          {unread > 0 && (
            <form action={markRead}>
              <button className="text-xs text-teal-700 font-medium">Mark all read</button>
            </form>
          )}
        </div>
        {notifications.length === 0 && (
          <p className="px-4 py-6 text-sm text-ink/50 text-center">Nothing yet.</p>
        )}
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={n.link || "#"}
            className={`block px-4 py-3 text-sm border-b border-sand-50 last:border-0 hover:bg-sand-50 ${
              !n.read ? "bg-teal-50/50" : ""
            }`}
          >
            <p className="font-medium text-ink">{n.title}</p>
            <p className="text-ink/60 mt-0.5">{n.body}</p>
            <p className="text-ink/30 text-xs mt-1">{new Date(n.createdAt).toLocaleString("en-GB")}</p>
          </Link>
        ))}
      </div>
    </details>
  );
}
