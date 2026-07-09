import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, BellRing, Globe, CheckCircle2, FileText, Megaphone, Settings,
  ChevronRight, Check, ListChecks, ClipboardList, FileCheck2, HelpCircle,
  Phone, Mail,
} from "lucide-react";
import {
  getNotifications, markAllRead, Notification, NotificationIcon,
} from "../lib/notifications";

type FilterKey = "all" | "unread" | "scheme" | "application" | "alert" | "system";

const iconMap: Record<NotificationIcon, { Icon: React.ElementType; bg: string; color: string }> = {
  check: { Icon: CheckCircle2, bg: "#DCFCE7", color: "#166534" },
  bell: { Icon: BellRing, bg: "#FEF3C7", color: "#92400E" },
  file: { Icon: FileText, bg: "#DBEAFE", color: "#1E40AF" },
  megaphone: { Icon: Megaphone, bg: "#EDE9FE", color: "#5B21B6" },
  settings: { Icon: Settings, bg: "#F3F4F6", color: "#374151" },
};

const tagStyles: Record<string, { bg: string; color: string }> = {
  "Application Update": { bg: "#DCFCE7", color: "#166534" },
  "New Scheme": { bg: "#FEF3C7", color: "#92400E" },
  "Alert": { bg: "#EDE9FE", color: "#5B21B6" },
  "Eligibility Match": { bg: "#DBEAFE", color: "#1E40AF" },
  "System": { bg: "#F3F4F6", color: "#374151" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function dayBucket(iso: string): "Today" | "Yesterday" | "Earlier" {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(new Date()) - startOf(new Date(iso))) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
}

function itemTimeLabel(iso: string, bucket: string) {
  if (bucket === "Yesterday") return "Yesterday";
  if (bucket === "Earlier") return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return timeAgo(iso);
}

export default function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [voiceLang, setVoiceLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    const load = () => setItems(getNotifications());
    load();
    window.addEventListener("haq-notifications-updated", load);
    return () => window.removeEventListener("haq-notifications-updated", load);
  }, []);

  const sorted = [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const unreadCount = items.filter((n) => !n.read).length;
  const schemeCount = items.filter((n) => n.type === "scheme").length;
  const applicationCount = items.filter((n) => n.type === "application").length;
  const alertCount = items.filter((n) => n.type === "alert").length;
  const systemCount = items.filter((n) => n.type === "system").length;

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: items.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "scheme", label: "Schemes", count: schemeCount },
    { key: "application", label: "Applications", count: applicationCount },
    { key: "alert", label: "Alerts", count: alertCount },
    { key: "system", label: "System", count: systemCount },
  ];

  const filtered = sorted.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const buckets: { label: string; items: Notification[] }[] = ["Today", "Yesterday", "Earlier"]
    .map((label) => ({ label, items: filtered.filter((n) => dayBucket(n.timestamp) === label) }))
    .filter((b) => b.items.length > 0);

  const stats = [
    { value: items.length, label: "Total Notifications" },
    { value: unreadCount, label: "Unread Messages" },
    { value: schemeCount, label: "Scheme Updates" },
    { value: applicationCount, label: "Application Updates" },
  ];

  return (
    <div className="min-h-full" style={{ background: "#FAF7F2" }}>
      <header className="bg-white border-b border-black/5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-black/5 text-black flex-shrink-0" aria-label="Back to home">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center flex-shrink-0">
            <BellRing size={16} className="text-[#0A542E]" />
          </div>
          <p className="font-bold text-black text-lg">Notifications</p>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setVoiceLang("en")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${voiceLang === "en" ? "bg-[#0A542E] text-white" : "bg-black/5 text-black/60"
                }`}
            >
              <Globe size={13} /> English
            </button>
            <button
              onClick={() => setVoiceLang("hi")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${voiceLang === "hi" ? "bg-[#0A542E] text-white" : "bg-black/5 text-black/60"
                }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-5 min-w-0">
          <section
            className="rounded-2xl p-6 sm:p-7 relative overflow-hidden flex items-center gap-4"
            style={{ background: "#0A542E" }}
          >
            <img
              src="/images/sunset.jpg"
              className="absolute top-0 right-0 w-96 h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient" }} />
            <div className="w-11 h-11 rounded-full bg-white/ flex items-center justify-center flex-shrink-0 relative z-10">
              <BellRing size={22} className="text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-white font-bold text-lg">
                {unreadCount === 0 ? "You're all caught up! 🎉" : `You have ${unreadCount} new update${unreadCount > 1 ? "s" : ""}`}
              </p>
              <p className="text-white text mt-0.5">
                {unreadCount === 0 ? "No unread notifications. You'll see new updates here." : "Tap a notification below to view details."}
              </p>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 text-sm px-3.5 h-9 rounded-full border-2 font-semibold transition-colors ${filter === f.key ? "bg-[#0A542E] text-white border-[#0A542E]" : "bg-white text-black border-black/10"
                  }`}
              >
                {f.label}
                <span
                  className={`text-[10px] rounded-full w-5 h-5 flex items-center justify-center ${filter === f.key ? "bg-white/20 text-white" : "bg-[#F0FDF4] text-[#0A542E]"
                    }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="ml-auto text-sm font-semibold text-[#0A542E] flex items-center gap-1 hover:underline flex-shrink-0"
              >
                <Check size={14} /> Mark all as read
              </button>
            )}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-black/60">
              <BellRing size={32} className="mx-auto mb-3 text-black/20" />
              <p className="text-sm font-semibold">No notifications in this view.</p>
            </div>
          )}

          {buckets.map((bucket) => (
            <div key={bucket.label}>
              <p className="text-sm font-bold text-black/50 mb-2">{bucket.label}</p>
              <div className="space-y-3">
                {bucket.items.map((n) => {
                  const iconInfo = iconMap[n.icon ?? "bell"];
                  const Icon = iconInfo.Icon;
                  const tagStyle = tagStyles[n.tag ?? ""] ?? { bg: "#F3F4F6", color: "#374151" };
                  return (
                    <div
                      key={n.id}
                      className={`bg-white border rounded-2xl p-4 flex items-start gap-3 transition-colors ${n.read ? "border-black" : "border-[#0A542E]"
                        }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: iconInfo.bg }}
                      >
                        <Icon size={18} style={{ color: iconInfo.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-black text-sm">{n.title ?? n.schemeName}</p>
                          {n.tag && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                              style={{ background: tagStyle.bg, color: tagStyle.color }}
                            >
                              {n.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-black/70 mt-1">{n.message}</p>
                        {n.detail && <p className="text-xs text-black/50 mt-0.5">{n.detail}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs text-black/40 whitespace-nowrap">{itemTimeLabel(n.timestamp, bucket.label)}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#0A542E]" />}
                        <ChevronRight size={16} className="text-black/25" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl p-4 text-white flex items-center gap-3" style={{ background: "#0A542E" }}>
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
              <BellRing size={18} />
            </div>
            <div>
              <p className="font-bold text-sm">Notification Summary</p>
              <p className="text-xs text-white/75">Stay updated with your latest alerts</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-black rounded-xl p-4">
                <p className="text-2xl font-bold text-black">{s.value}</p>
                <p className="text-xs text-black/60 font-medium mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="border border-black bg-white rounded-xl p-4">
            <p className="text-sm font-bold text-black mb-3">Quick Actions</p>
            <div className="space-y-3">
              {[
                { label: "My Applications", sub: "Track your application status", icon: FileCheck2, href: "/track" },
                { label: "My Schemes", sub: "View schemes you're eligible for", icon: ListChecks, href: "/schemes" },
                { label: "Document Checklist", sub: "Check required documents", icon: ClipboardList, href: "#" },
                { label: "Talk to Support", sub: "Get help from our team", icon: HelpCircle, href: "#" },
              ].map((a) => (
                <Link key={a.label} to={a.href} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center flex-shrink-0">
                    <a.icon size={15} className="text-[#0A542E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black group-hover:text-[#0A542E] transition-colors">{a.label}</p>
                    <p className="text-xs text-black/50 leading-tight">{a.sub}</p>
                  </div>
                  <ChevronRight size={14} className="text-black flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-[#FFFBEB] border border-black rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-black">Need Help?</p>
              <span className="text-[10px] font-semibold text-[#92400E] bg-[#ffda24] rounded-full px-2 py-0.5">Prototype</span>
            </div>
            <p className="text-xs text-black/60 font-medium mt-1">हम आपकी मदद के लिए यहाँ हैं। We are here to help you.</p>
            <div className="mt-3 space-y-1.5">
              <p className="flex items-center gap-2 text-xs font-semibold text-black/80">
                <Phone size={13} className="text-[#92400E] flex-shrink-0" /> 1800-898989
              </p>
              <a href="mailto:support@haqagent.example" className="flex items-center gap-2 text-xs font-semibold text-black/80 hover:underline">
                <Mail size={13} className="text-[#92400E] flex-shrink-0" /> support@haqagent.example
              </a>
            </div>
            <button className="mt-3 text-xs border border-[#f8ca0e] text-black font-semibold rounded-lg px-3 py-1.5 w-full hover:bg-[#ffda24]/10 transition-colors">
              Contact Support
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
