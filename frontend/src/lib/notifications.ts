export type Notification = {
  id: string;
  schemeName: string;
  category: string;
  amount: string;
  channel: "sms" | "email" | "both";
  message: string;
  timestamp: string;
};

const STORAGE_KEY = "haq-agent-notifications";

export function getNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addNotification(n: Omit<Notification, "id" | "timestamp">) {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...n,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newNotification, ...notifications];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("haq-notifications-updated"));
  return newNotification;
}

export function clearNotifications() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("haq-notifications-updated"));
}