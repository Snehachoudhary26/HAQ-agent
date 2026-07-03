import { useState } from "react";
import { Sprout, Search, CheckCircle2, Clock, AlertCircle, FileText, Bell, ChevronDown, ChevronUp, Phone } from "lucide-react";

type Status = "approved" | "pending" | "action-required";

type Application = {
  id: string;
  schemeName: string;
  schemeNameHi: string;
  appliedDate: string;
  status: Status;
  statusHi: string;
  lastUpdate: string;
  nextStep: string;
  nextStepHi: string;
  referenceNo: string;
  documents: { name: string; submitted: boolean }[];
};

const applications: Application[] = [
  {
    id: "1",
    schemeName: "PM-KISAN",
    schemeNameHi: "प्रधानमंत्री किसान सम्मान निधि",
    appliedDate: "12 June 2026",
    status: "approved",
    statusHi: "स्वीकृत",
    lastUpdate: "2 days ago",
    nextStep: "Next installment of ₹2,000 will be credited by 15 July 2026.",
    nextStepHi: "₹2,000 की अगली किस्त 15 जुलाई 2026 तक आपके खाते में आएगी।",
    referenceNo: "PMKISAN-MP-2026-004421",
    documents: [
      { name: "Aadhaar card", submitted: true },
      { name: "Land ownership record", submitted: true },
      { name: "Bank passbook", submitted: true },
    ],
  },
  {
    id: "2",
    schemeName: "Ayushman Bharat – PMJAY",
    schemeNameHi: "आयुष्मान भारत – प्रधानमंत्री जन आरोग्य योजना",
    appliedDate: "20 June 2026",
    status: "pending",
    statusHi: "प्रक्रियाधीन",
    lastUpdate: "5 days ago",
    nextStep: "Your application is under verification. Expected decision by 10 July 2026.",
    nextStepHi: "आपका आवेदन सत्यापन में है। 10 जुलाई 2026 तक निर्णय अपेक्षित है।",
    referenceNo: "PMJAY-MP-2026-118843",
    documents: [
      { name: "Aadhaar card", submitted: true },
      { name: "Ration card", submitted: true },
      { name: "Mobile OTP verification", submitted: false },
    ],
  },
  {
    id: "3",
    schemeName: "AICTE Pragati Scholarship",
    schemeNameHi: "AICTE प्रगति छात्रवृत्ति",
    appliedDate: "25 June 2026",
    status: "action-required",
    statusHi: "कार्रवाई आवश्यक",
    lastUpdate: "1 day ago",
    nextStep: "Income certificate is missing. Upload it before 5 July 2026 to avoid rejection.",
    nextStepHi: "आय प्रमाण पत्र अनुपलब्ध है। अस्वीकृति से बचने के लिए 5 जुलाई 2026 से पहले अपलोड करें।",
    referenceNo: "AICTE-PRG-2026-009921",
    documents: [
      { name: "Class 10 & 12 marksheets", submitted: true },
      { name: "Admission proof", submitted: true },
      { name: "Income certificate", submitted: false },
      { name: "Bank passbook", submitted: true },
      { name: "Aadhaar card", submitted: true },
    ],
  },
];

const statusConfig = {
  approved: { color: "#0A542E", bg: "#F0FDF4", icon: CheckCircle2, label: "Approved" },
  pending: { color: "#ffda24", bg: "#FFFBEB", icon: Clock, label: "Pending" },
  "action-required": { color: "#DC2626", bg: "#FEF2F2", icon: AlertCircle, label: "Action Required" },
};

export default function TrackApplication() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("3");

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
            <img src="/images/ logo.jpg" alt="Haq Agent" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
            <div className="leading-tight">
              <p className="font-bold text-white text-base sm:text-lg">Haq Agent</p>
              <p className="text-xs text-white/80 hidden sm:block">हर योजना, हर हकदार तक</p>
            </div>
          </a>
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-white">
            <a href="/" className="hover:text-yellow-300">Home</a>
            <a href="/schemes" className="hover:text-yellow-300">Schemes</a>
            <a href="/agent" className="hover:text-yellow-300">💬 Chat Agent</a>
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

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Total Applied", labelHi: "कुल आवेदन", count: applications.length, color: "#0A542E" },
            { label: "Approved", labelHi: "स्वीकृत", count: applications.filter(a => a.status === "approved").length, color: "#0A542E" },
            { label: "Action Needed", labelHi: "कार्रवाई जरूरी", count: applications.filter(a => a.status === "action-required").length, color: "#DC2626" },
          ].map((s) => (
            <div key={s.label} className="border-2 rounded-xl p-3 sm:p-4 text-center" style={{ borderColor: s.color + "30" }}>
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-sm font-bold text-black mt-1">{s.label}</p>
              <p className="text-xs font-semibold" style={{ color: s.color }}>{s.labelHi}</p>
            </div>
          ))}
        </div>

        {/* Search */}
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

        {/* Application cards */}
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
                      <div>
                        <p className="text-base sm:text-lg font-bold text-black">{app.schemeName}</p>
                        <p className="text-sm font-semibold" style={{ color: "#0A542E" }}>{app.schemeNameHi}</p>
                      </div>
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
                    {/* Reference number */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                      <FileText size={15} style={{ color: "#0A542E" }} />
                      <span className="text-sm font-bold text-black">Ref: {app.referenceNo}</span>
                    </div>

                    {/* Next step */}
                    <div className="rounded-xl p-4 border-2" style={{ background: cfg.bg, borderColor: cfg.color + "40" }}>
                      <p className="text-sm font-bold text-black mb-1">📌 Next Step</p>
                      <p className="text-base font-semibold text-black">{app.nextStep}</p>
                      <p className="text-sm font-semibold mt-1" style={{ color: cfg.color }}>{app.nextStepHi}</p>
                    </div>

                    {/* Documents status */}
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

                    {/* Action buttons */}
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <footer className="text-white text-sm font-medium text-center py-5 mt-8" style={{ background: "#0A542E" }}>
        Haq Agent · हर योजना, हर हकदार तक · Built for Bharat with Agentic AI
      </footer>
    </div>
  );
}
