import { useState, useEffect } from "react";
import { Search, CheckCircle2, Clock, AlertCircle, FileText, Bell, ChevronDown, ChevronUp, Phone, MessageCircle, Loader2 } from "lucide-react";
import { API_BASE } from "../lib/config";

type Status = "approved" | "pending" | "action-required";

type ApiDocument = {
  id: string;
  document_type: string;
  status: "missing" | "uploaded" | "verified" | "rejected";
};

type ApiApplication = {
  id: string;
  scheme_name: string;
  status: "submitted" | "action_required" | "approved" | "rejected";
  next_step: string | null;
  reference_no: string | null;
  submitted_at: string;
  updated_at: string;
  application_documents: ApiDocument[];
  official_site: string | null;
};

type Application = {
  id: string;
  schemeName: string;
  appliedDate: string;
  status: Status;
  lastUpdate: string;
  nextStep: string;
  referenceNo: string;
  documents: { name: string; submitted: boolean }[];
  officialSite: string | null;
};

const statusConfig = {
  approved: { color: "#0A542E", bg: "#F0FDF4", icon: CheckCircle2, label: "Approved" },
  pending: { color: "#000000", bg: "#fff0a2", icon: Clock, label: "Pending" },
  "action-required": { color: "#DC2626", bg: "#FEF2F2", icon: AlertCircle, label: "Action Required" },
};

function mapStatus(apiStatus: ApiApplication["status"]): Status {
  if (apiStatus === "approved") return "approved";
  if (apiStatus === "action_required" || apiStatus === "rejected") return "action-required";
  return "pending"; // submitted
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function documentLabel(docType: string) {
  return docType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapApplication(a: ApiApplication): Application {
  return {
    id: a.id,
    schemeName: a.scheme_name,
    appliedDate: formatDate(a.submitted_at),
    status: mapStatus(a.status),
    lastUpdate: timeAgo(a.updated_at),
    nextStep: a.next_step || defaultNextStep(a.status),
    referenceNo: a.reference_no || "Not yet assigned",
    documents: a.application_documents.map((d) => ({
      name: documentLabel(d.document_type),
      submitted: d.status !== "missing",
    })),
    officialSite: a.official_site,
  };
}

function defaultNextStep(status: ApiApplication["status"]) {
  if (status === "approved") return "Your application has been approved.";
  if (status === "rejected") return "Your application was rejected. Contact the helpline for details.";
  if (status === "action_required") return "Action is needed on this application.";
  return "Your application is under review.";
}

export default function TrackApplication() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("haq_user_id") || "demo-user";

    fetch(`${API_BASE}/api/applications/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const mapped: Application[] = (data.applications || []).map(mapApplication);
        setApplications(mapped);
        if (mapped.length > 0) setExpandedId(mapped[0].id);
      })
      .catch((e) => setError(e.message || "Could not load your applications"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = applications.filter(
    (a) =>
      !search ||
      a.schemeName.toLowerCase().includes(search.toLowerCase()) ||
      a.referenceNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-white">
      <header style={{ background: "#0A542E" }} className="text-white sticky top-0 z-50 shadow-lg">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/images/logo.jpg" alt="Haq Agent" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
            <div className="leading-tight">
              <p className="font-bold text-white text-base sm:text-lg">Haq Agent</p>
              <p className="text-sm text-white hidden sm:block">हर योजना, हर हकदार तक</p>
            </div>
          </a>
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-white">
            <a href="/" className="hover:text-yellow-300">Home</a>
            <a href="/schemes" className="hover:text-yellow-300">Schemes</a>
            <a href="/agent" className="flex items-center gap-1.5 px-3 py-1.5 hover:text-yellow-300 font-semibold">
              <MessageCircle size={20} /> Chat Agent
            </a>
            <a href="/track" className="font-bold border-b-2 pb-0.5" style={{ color: "#ffda24", borderColor: "#ffda24" }}>Track Application</a>
          </nav>
          <a href="/agent" className="bg-white font-bold text-sm px-5 py-2 rounded-full" style={{ color: "#0A542E" }}>
            Check Eligibility
          </a>
        </div>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Track My Applications</h1>
          <p className="text-base font-semibold mt-1" style={{ color: "#0A542E" }}>
            मेरे आवेदन ट्रैक करें · See status of all your scheme applications
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-black/60">
            <Loader2 size={20} className="animate-spin" /> Loading your applications…
          </div>
        )}

        {!loading && error && (
          <div className="border-2 border-red-200 bg-red-50 text-red-700 rounded-xl p-4 font-semibold">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
              {[
                { label: "Total Applied", count: applications.length, color: "#0A542E" },
                { label: "Approved", count: applications.filter((a) => a.status === "approved").length, color: "#0A542E" },
                { label: "Action Needed", count: applications.filter((a) => a.status === "action-required").length, color: "#DC2626" },
              ].map((s) => (
                <div key={s.label} className="border-2 rounded-xl p-3 sm:p-4 text-center" style={{ borderColor: s.color + "30" }}>
                  <p className="text-2xl sm:text-3xl font-bold" style={{ color: s.color }}>{s.count}</p>
                  <p className="text-lg font-semibold text-black mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="relative mb-5">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#0A542E" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by scheme name or reference number..."
                className="w-full pl-11 pr-4 py-3 border-2 rounded-full text-base font-medium text-black bg-white focus:outline-none"
                style={{ borderColor: "#0A542E" }}
              />
            </div>

            {applications.length === 0 && (
              <div className="text-center py-16 text-black/50 font-medium">
                No applications yet. Once you apply to a scheme, it'll show up here.
              </div>
            )}

            <div className="space-y-4">
              {filtered.map((app) => {
                const cfg = statusConfig[app.status];
                const Icon = cfg.icon;
                const expanded = expandedId === app.id;

                return (
                  <div key={app.id} className="border-2 rounded-2xl overflow-hidden transition-all"
                    style={{ borderColor: expanded ? cfg.color : "#e5e7eb" }}>
                    <button
                      className="w-full text-left px-4 sm:px-6 py-4 flex items-start gap-4"
                      onClick={() => setExpandedId(expanded ? null : app.id)}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                        <Icon size={24} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-base sm:text-lg font-bold text-black">{app.schemeName}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-bold px-3 py-1 rounded-full hidden sm:block" style={{ background: cfg.bg, color: cfg.color }}>
                              {cfg.label}
                            </span>
                            {expanded ? <ChevronUp size={20} style={{ color: "#0A542E" }} /> : <ChevronDown size={20} className="text-black" />}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-sm font-semibold text-black">Applied: {app.appliedDate}</span>
                          <span className="text-sm font-semibold text-black">Updated: {app.lastUpdate}</span>
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div className="px-4 sm:px-6 pb-5 border-t-2 pt-4 space-y-4" style={{ borderColor: cfg.color + "20" }}>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                          <FileText size={15} style={{ color: "#0A542E" }} />
                          <span className="text-sm font-bold text-black">Ref: {app.referenceNo}</span>
                        </div>

                        <div className="rounded-xl p-4 border-2" style={{ background: cfg.bg, borderColor: cfg.color + "40" }}>
                          <p className="text-sm font-bold text-black mb-1">📌 Next Step</p>
                          <p className="text-base font-semibold text-black">{app.nextStep}</p>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-black uppercase tracking-wide mb-2">Documents Status</p>
                          <div className="space-y-2">
                            {app.documents.map((d) => (
                              <div key={d.name} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ background: d.submitted ? "#0A542E" : "#DC2626" }}>
                                  {d.submitted
                                    ? <CheckCircle2 size={14} className="text-white" />
                                    : <AlertCircle size={14} className="text-white" />}
                                </div>
                                <span className={`text-base font-semibold ${d.submitted ? "text-black" : "text-red-600"}`}>
                                  {d.name} {!d.submitted && "— MISSING"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          {app.status === "action-required" && (
                            <button className="flex-1 text-white text-base font-bold px-4 py-3 rounded-full text-center" style={{ background: "#DC2626" }}>
                              Upload Missing Documents
                            </button>
                          )}
                          <a href="/agent" className="flex-1 text-white text-base font-bold px-4 py-3 rounded-full text-center flex items-center justify-center gap-2" style={{ background: "#0A542E" }}>
                            <Bell size={16} /> Ask Agent for Help
                          </a>
                          <a href="tel:14555" className="flex-1 text-base font-bold px-4 py-3 rounded-full text-center border-2 flex items-center justify-center gap-2" style={{ borderColor: "#0A542E", color: "#0A542E" }}>
                            <Phone size={16} /> Helpline 14555
                          </a>
                        </div>
                        {app.officialSite && (
                          
                            <a
                            href={app.officialSite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center text-sm font-semibold underline pt-1"
                            style={{ color: "#0A542E" }}
                          >
                            Visit official scheme website to complete your application →
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer className="text-white text-sm font-medium text-center py-5 mt-8" style={{ background: "#0A542E" }}>
        Haq Agent · हर योजना, हर हकदार तक · Built for Bharat with Agentic AI
      </footer>
    </div>
  );
}
