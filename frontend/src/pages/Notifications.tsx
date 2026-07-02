import { useEffect, useState } from "react";
import { Sparkles, BellRing, MessageSquareText, Mail, Trash2, ArrowLeft } from "lucide-react";
import { getNotifications, clearNotifications, Notification } from "../lib/notifications";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    const load = () => setItems(getNotifications());
    load();
    window.addEventListener("haq-notifications-updated", load);
    return () => window.removeEventListener("haq-notifications-updated", load);
  }, []);

  return (
    <div className="min-h-full bg-gray-50">
      <header className="flex items-center gap-2 px-4 sm:px-10 py-3 border-b border-gray-200 bg-white">
        <a href="/" className="p-1 -ml-1" aria-label="Back to home">
          <ArrowLeft size={20} className="text-gray-500" />
        </a>
        <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
          <Sparkles size={16} className="text-blue-600" />
        </div>
        <span className="font-medium">Notifications</span>
        {items.length > 0 && (
          <button
            onClick={() => clearNotifications()}
            className="ml-auto text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600"
          >
            <Trash2 size={14} /> <span className="hidden sm:inline">Clear all</span>
          </button>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        {items.length === 0 && (
          <div className="text-center py-16">
            <BellRing size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No notifications yet. Check eligibility in the agent chat — alerts will appear here automatically.
            </p>
          </div>
        )}

        {items.map((n) => (
          <div key={n.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <BellRing size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{n.schemeName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{timeAgo(n.timestamp)}</span>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MessageSquareText size={13} className="text-green-600" /> SMS sent
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Mail size={13} className="text-blue-600" /> Email sent
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 ml-auto capitalize">
                {n.category}
              </span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}