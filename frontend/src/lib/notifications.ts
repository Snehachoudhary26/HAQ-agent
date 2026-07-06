export type NotificationType = "scheme" | "application" | "alert" | "system";
export type NotificationIcon = "check" | "bell" | "file" | "megaphone" | "settings";

export type Notification = {
  id: string;
  type?: NotificationType;
  icon?: NotificationIcon;
  tag?: string;
  title?: string;
  schemeName: string;
  category: string;
  amount?: string;
  channel: "sms" | "email" | "both";
  message: string;
  detail?: string;
  timestamp: string;
  read: boolean;
};

const STORAGE_KEY = "haq-agent-notifications";
const SEEDED_KEY = "haq-agent-notifications-seeded";

function seedNotifications(): Notification[] {
  const now = Date.now();
  const hrsAgo = (h: number) => new Date(now - h * 3600000).toISOString();
  const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

  return [
    {
      id: "seed-1", type: "scheme", icon: "bell", tag: "New Scheme",
      title: "New scholarship opened",
      schemeName: "AICTE Pragati Scholarship", category: "education", channel: "both",
      message: "AICTE Pragati Scholarship 2024 is now open for applications.",
      detail: "Last date to apply: 30 June 2024",
      timestamp: hrsAgo(1), read: true,
    },
    {
      id: "seed-2", type: "application", icon: "file", tag: "Application Update",
      title: "Documents verified",
      schemeName: "Ayushman Bharat – PMJAY", category: "health", channel: "email",
      message: "Your uploaded documents for Ayushman Bharat – PMJAY have been verified.",
      detail: "You can now proceed to the next step.",
      timestamp: hrsAgo(3), read: true,
    },
    {
      id: "seed-3", type: "alert", icon: "check", tag: "Alert",
      title: "Pension scheme approved",
      schemeName: "IGNOAPS (NSAP Pension)", category: "pension", channel: "both",
      message: "Your application for IGNOAPS (NSAP Pension) has been approved.",
      detail: "SMS and email sent to your registered mobile and email.",
      timestamp: hrsAgo(6), read: true,
    },
    {
      id: "seed-4", type: "alert", icon: "megaphone", tag: "Alert",
      title: "Important update",
      schemeName: "PM-KISAN", category: "agriculture", channel: "sms",
      message: "PM KISAN 16th installment will be credited soon.",
      detail: "Keep your bank account active.",
      timestamp: hrsAgo(9), read: true,
    },
    {
      id: "seed-5", type: "scheme", icon: "bell", tag: "New Scheme",
      title: "New internship cycle open",
      schemeName: "NITI Aayog Internship", category: "education", channel: "both",
      message: "A new NITI Aayog Internship cycle has opened for this month.",
      detail: "Applications close within the first 10 days of the month.",
      timestamp: daysAgo(1), read: true,
    },
    {
      id: "seed-6", type: "scheme", icon: "bell", tag: "New Scheme",
      title: "e-Shram registration window extended",
      schemeName: "e-Shram Registration", category: "employment", channel: "sms",
      message: "The e-Shram registration window has been extended for unorganised sector workers.",
      timestamp: daysAgo(1), read: true,
    },
    {
      id: "seed-7", type: "application", icon: "check", tag: "Application Update",
      title: "Application submitted successfully",
      schemeName: "PM Fasal Bima Yojana", category: "agriculture", channel: "both",
      message: "Your application for PM Fasal Bima Yojana has been submitted.",
      detail: "Application ID: PFY-2024-56789",
      timestamp: daysAgo(2), read: true,
    },
  ];
}

export function getNotifications(): Notification[] {
  try {
    const seeded = localStorage.getItem(SEEDED_KEY);
    if (!seeded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedNotifications()));
      localStorage.setItem(SEEDED_KEY, "true");
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addNotification(n: Omit<Notification, "id" | "timestamp" | "read">) {
  const notifications = getNotifications();
  const newNotification: Notification = {
    type: "scheme",
    tag: "Eligibility Match",
    title: `You're eligible: ${n.schemeName}`,
    icon: "bell",
    ...n,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  const updated = [newNotification, ...notifications];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("haq-notifications-updated"));
  return newNotification;
}

export function markAllRead() {
  const updated = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("haq-notifications-updated"));
}

export function markRead(id: string) {
  const updated = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("haq-notifications-updated"));
}

export function clearNotifications() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SEEDED_KEY);
  window.dispatchEvent(new Event("haq-notifications-updated"));
}
