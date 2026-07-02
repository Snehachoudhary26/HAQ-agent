import { useState, useRef, useEffect } from "react";
import {
  Send,
  Mic,
  FileCheck2,
  IndianRupee,
  BellRing,
  Sprout,
  MessageCircle,
  ListChecks,
  FileText,
  HelpCircle,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { addNotification } from "../lib/notifications";
import { useVoiceInput } from "../hooks/useVoiceInput";
import Logo from "../components/Logo";

type Message = { role: "agent" | "user"; text: string };

type Profile = {
  occupation?: string;
  age?: number;
  gender?: string;
  ownsLand?: boolean;
  belowPovertyLine?: boolean;
  seccListed?: boolean;
  incomeTaxPayer?: boolean;
  familyIncome?: number;
  courseType?: string;
};

type Match = {
  schemeId: string;
  name: string;
  category: string;
  amount: string;
  documents: string[];
  reasons: string[];
};

const API_BASE = "http://localhost:4000";
type Step = "occupation" | "age" | "gender" | "land" | "bpl" | "income" | "done";

const sidebarLinks = [
  { icon: MessageCircle, label: "New Conversation" },
  { icon: ListChecks, label: "My Schemes" },
  { icon: FileText, label: "My Applications" },
  { icon: BellRing, label: "Notifications", href: "/notifications" },
  { icon: HelpCircle, label: "Help & Support" },
];

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: "Namaste! I'm the Haq Agent. Let's find out what you qualify for — first, what's your main occupation?",
    },
  ]);
  const [profile, setProfile] = useState<Profile>({});
  const [step, setStep] = useState<Step>("occupation");
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [sendingNotifs, setSendingNotifs] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"hi-IN" | "en-IN">("en-IN");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { listening, supported, start, stop } = useVoiceInput();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, matches]);

  function pushAgent(text: string) {
    setMessages((m) => [...m, { role: "agent", text }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { role: "user", text }]);
  }

  async function runEligibilityCheck(finalProfile: Profile) {
    setThinking(true);
    try {
      const res = await fetch(`${API_BASE}/api/check-eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalProfile),
      });
      const data = await res.json();
      setThinking(false);
      if (data.matches?.length) {
        pushAgent(
          `Good news — based on what you've shared, you qualify for ${data.matches.length} scheme${
            data.matches.length > 1 ? "s" : ""
          }. Here's what I found:`
        );
        setMatches(data.matches);
        setSendingNotifs(true);
        setTimeout(() => {
          data.matches.forEach((m: Match) => {
            addNotification({
              schemeName: m.name,
              category: m.category,
              amount: m.amount,
              channel: "both",
              message: `You're eligible — SMS and email sent with next steps for ${m.name}.`,
            });
          });
          setSendingNotifs(false);
        }, 1400);
      } else {
        pushAgent(
          "I checked your profile against the schemes I currently track, and none matched yet. I'll keep watching and notify you the moment something opens up."
        );
        setMatches([]);
      }
    } catch (err) {
      setThinking(false);
      pushAgent(
        "I couldn't reach the eligibility service just now — make sure the backend server is running on localhost:4000, then try again."
      );
    }
  }

  function handleReply(value: string, profilePatch: Profile, next: Step, displayText?: string) {
    pushUser(displayText ?? value);
    const updated = { ...profile, ...profilePatch };
    setProfile(updated);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      setThinking(false);
      if (next === "done") {
        runEligibilityCheck(updated);
      } else {
        askNext(next);
      }
      setStep(next);
    }, 600);
  }

  function askNext(next: Step) {
    const questions: Record<Step, string> = {
      occupation: "",
      age: "Got it. What's your age?",
      gender: "Thanks. Are you male or female?",
      land: "Do you (or your family) own agricultural land?",
      bpl: "Is your household listed as Below Poverty Line (BPL), or do you hold a BPL/SECC card?",
      income: "Roughly, what's your family's annual income?",
      done: "",
    };
    if (questions[next]) pushAgent(questions[next]);
  }

  function handleOccupation(occ: string) {
    handleReply(occ, { occupation: occ }, "age", `I'm a ${occ}`);
  }

  function handleVoiceTranscript(transcript: string) {
    const text = transcript.trim();
    const lower = text.toLowerCase();

    if (step === "occupation") {
      const occMap: Record<string, string> = {
        student: "student",
        "छात्र": "student",
        farmer: "farmer",
        "किसान": "farmer",
        retired: "retired",
        "सेवानिवृत्त": "retired",
        laborer: "daily-wage-laborer",
        labourer: "daily-wage-laborer",
        "मजदूर": "daily-wage-laborer",
        government: "government-employee",
        "सरकारी": "government-employee",
      };
      const match = Object.keys(occMap).find((k) => lower.includes(k));
      if (match) {
        handleOccupation(occMap[match]);
        return;
      }
    }

    if (step === "age") {
      const num = text.match(/\d+/);
      if (num) {
        handleReply(text, { age: parseInt(num[0], 10) }, "gender", text);
        return;
      }
    }

    if (step === "gender") {
      if (lower.includes("female") || lower.includes("महिला") || lower.includes("औरत")) {
        handleReply("female", { gender: "female" }, "land", "Female");
        return;
      }
      if (lower.includes("male") || lower.includes("पुरुष") || lower.includes("आदमी")) {
        handleReply("male", { gender: "male" }, "land", "Male");
        return;
      }
    }

    if (step === "land" || step === "bpl") {
      const isYes = lower.includes("yes") || lower.includes("हाँ") || lower.includes("haan") || lower.includes("ji");
      const isNo = lower.includes("no") || lower.includes("नहीं") || lower.includes("nahi");
      if (step === "land" && (isYes || isNo)) {
        handleReply(isYes ? "yes" : "no", { ownsLand: isYes }, "bpl", isYes ? "Yes, we own land" : "No");
        return;
      }
      if (step === "bpl" && (isYes || isNo)) {
        handleReply(
          isYes ? "yes" : "no",
          { belowPovertyLine: isYes, seccListed: isYes },
          "income",
          isYes ? "Yes, BPL/SECC listed" : "No"
        );
        return;
      }
    }

    if (step === "income") {
      const num = text.match(/\d+/);
      if (num) {
        handleReply(text, { familyIncome: parseInt(num[0], 10) }, "done", text);
        return;
      }
    }

    setInput(text);
  }

  function toggleMic() {
    if (listening) {
      stop();
      return;
    }
    start(voiceLang, handleVoiceTranscript);
  }

  function handleFreeText() {
    if (!input.trim()) return;
    const num = parseInt(input.trim(), 10);
    if (step === "age" && !isNaN(num)) {
      handleReply(input, { age: num }, "gender");
      return;
    }
    if (step === "income" && !isNaN(num)) {
      handleReply(input, { familyIncome: num }, "done");
      return;
    }
    pushUser(input);
    setInput("");
  }

  function resetChat() {
    setMessages([
      {
        role: "agent",
        text: "Namaste! I'm the Haq Agent. Let's find out what you qualify for — first, what's your main occupation?",
      },
    ]);
    setProfile({});
    setStep("occupation");
    setMatches(null);
    setInput("");
  }

  const profileSnapshot: { label: string; value: string }[] = [
    { label: "Occupation", value: profile.occupation ? profile.occupation.replace(/-/g, " ") : "—" },
    { label: "Age", value: profile.age ? String(profile.age) : "—" },
    { label: "Gender", value: profile.gender ?? "—" },
    { label: "Owns Land", value: profile.ownsLand === undefined ? "—" : profile.ownsLand ? "Yes" : "No" },
  ];

  const matchPercent = matches && matches.length > 0 ? Math.min(95, 55 + matches.length * 15) : 0;

  return (
    <div className="min-h-full bg-brand-cream flex">
      {/* Sidebar (desktop: static, mobile: slide-over drawer) */}
      <aside
        className={`fixed sm:static inset-y-0 left-0 z-40 w-72 bg-[#0A542E] text-white flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/ logo.jpg" alt="Haq Agent" className="w-10 h-10 rounded-full object-cover border-2 border-white/40" />
            <div>
              <p className="font-semibold leading-tight">Haq Agent</p>
              <p className="text-[11px] text-white font-bold leading-tight">AI Assistant</p>
            </div>
          </div>
          <button className="sm:hidden text-white/80" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <button
          onClick={resetChat}
          className="mx-4 mb-4 border border-[#D9A21B]/60 text-[#D9A21B] text-sm rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
        >
          <MessageCircle size={15} /> New Conversation
        </button>

        <nav className="flex-1 px-3 space-y-1">
          {sidebarLinks.slice(1).map((l) => (
            <a
              key={l.label}
              href={l.href ?? "#"}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              <l.icon size={16} />
              {l.label}
            </a>
          ))}
        </nav>

        <div className="m-4 bg-white/10 rounded-xl p-3.5 flex items-start gap-2">
          <ShieldCheck size={16} className="text-[#D9A21B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium">Your data is safe with us</p>
            <p className="text-[11px] text-white font-bold mt-0.5">
              We use secure, encrypted systems to protect your information.
            </p>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 sm:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-gray-200 bg-white">
          <button className="sm:hidden text-black" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Logo size={26} />
          <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-full p-0.5 text-xs">
            <button
              onClick={() => setVoiceLang("en-IN")}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                voiceLang === "en-IN" ? "bg-white shadow-sm font-medium text-black" : "text-black font-semibold"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setVoiceLang("hi-IN")}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                voiceLang === "hi-IN" ? "bg-white shadow-sm font-medium text-black" : "text-black font-semibold"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Chat column */}
          <main className="flex-1 flex flex-col min-w-0 px-4 sm:px-6 py-5 overflow-y-auto">
            <div className="max-w-2xl w-full mx-auto lg:mx-0 space-y-4 flex-1">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "agent" && (
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"><img src="/images/ logo.jpg" alt="" className="w-full h-full object-cover" /></div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm sm:text-base ${
                      m.role === "user"
                        ? "bg-[#0A542E] text-white rounded-br-sm"
                        : "bg-[#0A542E]Light border border-[#0A542E]/40 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {thinking && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full overflow-hidden mr-2 flex-shrink-0"><img src="/images/ logo.jpg" alt="" className="w-full h-full object-cover" /></div>
                  <div className="bg-[#0A542E]Light border border-[#0A542E]/40 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A542E]/50 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A542E]/50 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A542E]/50 animate-bounce" />
                  </div>
                </div>
              )}

              {!thinking && step === "occupation" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    { value: "student", en: "Student", hi: "छात्र" },
                    { value: "farmer", en: "Farmer", hi: "किसान" },
                    { value: "retired", en: "Retired", hi: "सेवानिवृत्त" },
                    { value: "daily-wage-laborer", en: "Daily Wage Laborer", hi: "दैनिक मजदूर" },
                    { value: "government-employee", en: "Government Employee", hi: "सरकारी कर्मचारी" },
                  ].map((q) => (
                    <button
                      key={q.value}
                      onClick={() => handleOccupation(q.value)}
                      className="text-sm sm:text-base border border-[#0A542E]/30 rounded-full px-4 py-2 hover:bg-[#0A542E] hover:text-white transition-colors leading-snug bg-white"
                    >
                      {q.en} <span className="text-black font-bold">/ {q.hi}</span>
                    </button>
                  ))}
                </div>
              )}

              {!thinking && step === "gender" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    { v: "female", en: "Female", hi: "महिला" },
                    { v: "male", en: "Male", hi: "पुरुष" },
                  ].map((g) => (
                    <button
                      key={g.v}
                      onClick={() => handleReply(g.v, { gender: g.v }, "land", g.en)}
                      className="text-sm sm:text-base border border-[#0A542E]/30 rounded-full px-4 py-2 hover:bg-[#0A542E] hover:text-white transition-colors bg-white"
                    >
                      {g.en} <span className="text-black font-bold">/ {g.hi}</span>
                    </button>
                  ))}
                </div>
              )}

              {!thinking && step === "land" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleReply("yes", { ownsLand: true }, "bpl", "Yes, we own land")}
                    className="text-sm sm:text-base border border-[#0A542E]/30 rounded-full px-4 py-2 hover:bg-[#0A542E] hover:text-white transition-colors bg-white"
                  >
                    Yes / हाँ
                  </button>
                  <button
                    onClick={() => handleReply("no", { ownsLand: false }, "bpl", "No")}
                    className="text-sm sm:text-base border border-[#0A542E]/30 rounded-full px-4 py-2 hover:bg-[#0A542E] hover:text-white transition-colors bg-white"
                  >
                    No / नहीं
                  </button>
                </div>
              )}

              {!thinking && step === "bpl" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() =>
                      handleReply("yes", { belowPovertyLine: true, seccListed: true }, "income", "Yes, BPL/SECC listed")
                    }
                    className="text-sm sm:text-base border border-[#0A542E]/30 rounded-full px-4 py-2 hover:bg-[#0A542E] hover:text-white transition-colors bg-white"
                  >
                    Yes / हाँ
                  </button>
                  <button
                    onClick={() => handleReply("no", { belowPovertyLine: false, seccListed: false }, "income", "No")}
                    className="text-sm sm:text-base border border-[#0A542E]/30 rounded-full px-4 py-2 hover:bg-[#0A542E] hover:text-white transition-colors bg-white"
                  >
                    No / Not sure
                  </button>
                </div>
              )}

              {!thinking && step === "done" && matches && (
                <div className="space-y-3 pt-2">
                  {matches.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-black font-semibold">
                      No matches yet — I'll notify you the moment a new scheme opens for your profile.
                    </div>
                  )}
                  {matches.map((m) => (
                    <div key={m.schemeId} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium">{m.name}</p>
                        <span className="text-xs bg-[#0A542E]Light text-[#0A542E] rounded-full px-2 py-0.5 whitespace-nowrap capitalize border border-[#0A542E]/40">
                          {m.category}
                        </span>
                      </div>
                      <p className="text-xs text-black font-semibold mt-1 flex items-center gap-1">
                        <IndianRupee size={12} /> {m.amount}
                      </p>
                      <p className="text-xs text-black font-semibold mt-2">{m.reasons[0]}</p>
                      <div className="mt-3 flex items-start gap-2 border-t border-gray-100 pt-3">
                        <FileCheck2 size={14} className="text-[#0A542E] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-black font-semibold">{m.documents.join(", ")}</p>
                      </div>
                    </div>
                  ))}
                  {sendingNotifs && (
                    <div className="bg-[#0A542E]Light border border-[#0A542E]/20 rounded-xl p-3 flex items-center gap-2">
                      <BellRing size={15} className="text-[#0A542E] animate-pulse flex-shrink-0" />
                      <p className="text-xs text-[#0A542E]">Sending SMS and email confirmation...</p>
                    </div>
                  )}
                  {!sendingNotifs && matches.length > 0 && (
                    <a href="/notifications" className="block text-center text-xs text-[#0A542E] underline pt-1">
                      View sent notifications
                    </a>
                  )}
                </div>
              )}

              <div ref={endRef} />
            </div>

            <div className="max-w-2xl w-full mx-auto lg:mx-0 mt-4 sticky bottom-0 bg-brand-cream pt-2">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-2 py-1.5 shadow-sm">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFreeText()}
                  placeholder={
                    step === "age"
                      ? "Type your age..."
                      : step === "income"
                      ? "Type approx. annual income in ₹..."
                      : "Type your message..."
                  }
                  className="flex-1 px-3 py-1.5 text-sm focus:outline-none bg-transparent"
                />
                <button
                  onClick={toggleMic}
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    listening ? "bg-red-50 text-red-600 animate-pulse" : "text-black font-semibold hover:bg-gray-100"
                  }`}
                  aria-label={listening ? "Stop listening" : "Use voice"}
                  title={supported ? "" : "Voice input not supported in this browser"}
                >
                  <Mic size={17} />
                </button>
                <button
                  onClick={handleFreeText}
                  className="w-9 h-9 rounded-full bg-[#0A542E] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#037D6F] transition-colors"
                  aria-label="Send"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="text-[11px] text-black text-center mt-1.5">
                आप बोल भी सकते हैं... &nbsp;·&nbsp; You can also speak
              </p>
            </div>
          </main>

          {/* Profile / eligibility panel — stacks below chat on mobile, side panel on desktop */}
          <aside className="w-full lg:w-64 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white px-4 sm:px-6 py-5 space-y-4 lg:overflow-y-auto">
            <div className="bg-[#0A542E]Light border border-[#0A542E]/40 rounded-xl p-4">
              <p className="text-sm font-medium text-black mb-3">Your Profile Snapshot</p>
              <div className="space-y-2">
                {profileSnapshot.map((p) => (
                  <div key={p.label} className="flex items-center justify-between text-xs">
                    <span className="text-black font-semibold">{p.label}</span>
                    <span className="font-medium text-black capitalize">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {matches && matches.length > 0 && (
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-black mb-3">Eligibility Match</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F0FDF4" strokeWidth="3.5" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="3.5"
                        strokeDasharray={`${matchPercent} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[#0A542E]">
                      {matchPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-black font-semibold">
                    You're eligible for {matches.length} scheme{matches.length > 1 ? "s" : ""}.
                  </p>
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-medium text-black mb-3">Quick Actions</p>
              <div className="space-y-1">
                {[
                  { label: "Document Checklist", icon: FileText },
                  { label: "Track Application", icon: ListChecks },
                  { label: "Talk to Support", icon: HelpCircle },
                ].map((a) => (
                  <button
                    key={a.label}
                    className="w-full flex items-center gap-2 text-xs text-black font-medium py-1.5 hover:text-[#0A542E] transition-colors"
                  >
                    <a.icon size={14} />
                    <span className="flex-1 text-left">{a.label}</span>
                    <ChevronRight size={13} />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#D9A21B]/10 border border-[#D9A21B]/30 rounded-xl p-4">
              <p className="text-sm font-medium text-black">Need Help?</p>
              <p className="text-xs text-black font-semibold mt-1">हम आपकी मदद के लिए यहाँ हैं। We are here to help you.</p>
              <button className="mt-2 text-xs border border-[#D9A21B] text-black rounded-lg px-3 py-1.5 w-full hover:bg-[#D9A21B]/10 transition-colors">
                Contact Support
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}