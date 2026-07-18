import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Send, Mic, FileCheck2, IndianRupee, BellRing, GraduationCap, Sprout, Users,
  HardHat, Building2, Grid3x3, MessageCircle, ListChecks, FileText, HelpCircle,
  ChevronRight, ShieldCheck, Menu, X, Bell, Sparkles, Zap, Globe, Phone, Mail,
  Home, ClipboardList,
} from "lucide-react";
import { addNotification, getNotifications } from "../lib/notifications";
import { useVoiceInput } from "../hooks/useVoiceInput";

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

import { API_BASE } from "../lib/config";
type Step = "occupation" | "age" | "gender" | "land" | "bpl" | "income" | "done";

const occupationOptions = [
  { value: "student", en: "Student", hi: "छात्र", icon: GraduationCap, bg: "#E6F4EA", color: "#0A542E" },
  { value: "farmer", en: "Farmer", hi: "किसान", icon: Sprout, bg: "#DCFCE7", color: "#166534" },
  { value: "retired", en: "Retired", hi: "सेवानिवृत्त", icon: Users, bg: "#F0FDF4", color: "#0A542E" },
  { value: "daily-wage-laborer", en: "Daily Wage Laborer", hi: "दैनिक मजदूर", icon: HardHat, bg: "#FEF3C7", color: "#92400E" },
  { value: "government-employee", en: "Government Employee", hi: "सरकारी कर्मचारी", icon: Building2, bg: "#F0FDF4", color: "#0A542E" },
  { value: "other", en: "Other", hi: "अन्य", icon: Grid3x3, bg: "#F3F4F6", color: "#374151" },
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
  const [notifCount, setNotifCount] = useState(0);
  const [appliedSchemeIds, setAppliedSchemeIds] = useState<string[]>([]);
  const [applyingSchemeId, setApplyingSchemeId] = useState<string | null>(null);
  const { listening, supported, start, stop } = useVoiceInput();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, matches]);

  useEffect(() => {
    const load = () => setNotifCount(getNotifications().length);
    load();
    window.addEventListener("haq-notifications-updated", load);
    return () => window.removeEventListener("haq-notifications-updated", load);
  }, []);

  function pushAgent(text: string) {
    setMessages((m) => [...m, { role: "agent", text }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { role: "user", text }]);
  }

  const handleApply = async (m: Match) => {
    const userId = localStorage.getItem("haq_user_id");
    if (!userId) {
      alert("Please log in to apply for this scheme.");
      return;
    }
    setApplyingSchemeId(m.schemeId);
    try {
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          schemeId: m.schemeId,
          schemeName: m.name,
          requiredDocuments: m.documents,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit application");
      setAppliedSchemeIds((prev) => [...prev, m.schemeId]);
    } catch (err) {
      alert("Something went wrong submitting your application. Please try again.");
    } finally {
      setApplyingSchemeId(null);
    }
  };

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

      // Save this profile so the daily cron can watch for newly opened schemes.
      const userId = localStorage.getItem("haq_user_id");
      const userEmail = localStorage.getItem("haq_user_email");
      if (userId && userEmail) {
        fetch(`${API_BASE}/api/scheme-watch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, email: userEmail, profile: finalProfile }),
        }).catch(() => {
          // Non-critical — if this fails, the eligibility check itself still worked.
        });
      }

      if (data.matches?.length) {
        pushAgent(
          `Good news — based on what you've shared, you qualify for ${data.matches.length} scheme${data.matches.length > 1 ? "s" : ""
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
      age: "Got it. What's your age? / आपकी उम्र क्या है?",
      gender: "Thanks. Are you male or female? / धन्यवाद. आप पुरुष हैं या महिला?",
      land: "Do you (or your family) own agricultural land? / क्या आपके परिवार के पास खेती की ज़मीन है?",
      bpl: "Is your household listed as Below Poverty Line (BPL), or do you hold a BPL/SECC card? / क्या आपका परिवार बीपीएल/एसईसीसी सूची में है?",
      income: "Roughly, what's your family's annual income? / लगभग आपकी वार्षिक पारिवारिक आय क्या है?",
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
        student: "student", "छात्र": "student",
        farmer: "farmer", "किसान": "farmer",
        retired: "retired", "सेवानिवृत्त": "retired",
        laborer: "daily-wage-laborer", labourer: "daily-wage-laborer", "मजदूर": "daily-wage-laborer",
        government: "government-employee", "सरकारी": "government-employee",
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
    <div className="h-screen flex overflow-hidden" style={{ background: "#FAF7F2" }}>
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 flex flex-col transition-transform duration-300 relative overflow-hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        style={{ background: "#0A542E" }}
      >
        <div className="p-5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <img src="/images/favicon.jpg" alt="Haq Agent" className="w-10 h-10 rounded-full object-cover border-2 border-whi" />
            <div>
              <p className="font-semibold text-white leading-tight">Haq Agent</p>
              <p className="text-xs text-white/70 leading-tight">AI Assistant</p>
            </div>
          </div>
          <button className="lg:hidden text-white/80" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <button
          onClick={resetChat}
          className="mx-4 mb-4 border-2 border-[#ffda24]/70 text-[#ffda24] text-sm font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors relative z-10"
        >
          <MessageCircle size={18} /> New Conversation
        </button>

        <nav className="px-3 space-y-1 relative z-10">
          <Link to="/schemes" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/90 hover:bg-white/10 transition-colors">
            <ListChecks size={16} /> My Schemes
          </Link>
          <Link to="/track" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/90 hover:bg-white/10 transition-colors">
            <FileText size={16} /> My Applications
          </Link>
          <Link to="/notifications" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-white/90 hover:bg-white/10 transition-colors">
            <span className="flex items-center gap-3"><BellRing size={16} /> Notifications</span>
            {notifCount > 0 && (
              <span className="bg-[#ffda24] text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{notifCount}</span>
            )}
          </Link>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/90 hover:bg-white/10 transition-colors">
            <HelpCircle size={16} /> Help & Support
          </a>
        </nav>

        {/* Landscape illustration filling remaining space */}
        

        <div className="m-4 bg-white/10 backdrop-blur-sm rounded-xl p-3.5 flex items-start gap-2 relative z-10">
          <ShieldCheck size={16} className="text-[#ffda24] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-white">Your data is safe with us</p>
            <p className="text-xs text-white/75 mt-0.5">We use secure, encrypted systems to protect your information.</p>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header style={{ background: "#0A542E" }} className="relative flex items-center gap-3 px-4 sm:px-6 py-3 text-white sticky top-0 z-20 shadow-lg">
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>

          <nav className="hidden lg:flex items-center gap-1 text-sm text-white absolute left-1/2 -translate-x-1/2">
            <Link to="/" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 hover:text-yellow-300 font-semibold">
              <Home size={16} /> Home
            </Link>
            <Link to="/schemes" className="flex items-center gap-1.5 px-3 py-1.5 hover:text-yellow-300 font-semibold">
              <ListChecks size={16} /> Schemes
            </Link>
            <Link to="/agent" className="flex items-center gap-1.5 px-3 py-1.5 font-bold border-b-2 pb-0.5" style={{ color: "#ffda24", borderColor: "#ffda24" }}>
              <MessageCircle size={16} /> Chat Agent
            </Link>
            <Link to="/track" className="flex items-center gap-1.5 px-3 py-1.5 hover:text-yellow-300 font-semibold">
              <ClipboardList size={16} /> Track Application
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setVoiceLang("en-IN")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${voiceLang === "en-IN" ? "bg-white text-[#0A542E]" : "bg-white/10 text-white/80"
                }`}
            >
              <Globe size={13} /> English
            </button>
            <button
              onClick={() => setVoiceLang("hi-IN")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${voiceLang === "hi-IN" ? "bg-white text-[#0A542E]" : "bg-white/10 text-white/80"
                }`}
            >
              हिन्दी
            </button>
            <Link to="/notifications" className="relative p-1.5" aria-label="Notifications">
              <Bell size={20} className="text-white" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#ffda24] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <div className="flex-1 flex flex-col xl:flex-row min-h-0">
          {/* Chat column */}
          <main className="flex-1 flex flex-col min-w-0 px-4 sm:px-6 py-5 overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto space-y-4 flex-1">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "agent" && (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#F0FDF4] flex items-center justify-center">
                      <img src="/images/favicon.jpg" alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm sm:text-base ${m.role === "user"
                      ? "bg-[#0A542E] text-white rounded-br-sm"
                      : "bg-[#F0FDF4] border border-[#0A542E]/15 text-black rounded-bl-sm"
                      }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {thinking && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#F0FDF4]">
                    <img src="/images/ logo.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-[#F0FDF4] border border-[#0A542E]/15 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A542E]/50 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A542E]/50 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A542E]/50 animate-bounce" />
                  </div>
                </div>
              )}

              {!thinking && step === "occupation" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {occupationOptions.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => handleOccupation(o.value)}
                        className="flex items-center gap-3 bg-white border border-black/5 rounded-2xl p-4 hover:border-[#0A542E]/30 hover:shadow-sm transition-all text-left"
                      >
                        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: o.bg }}>
                          <o.icon size={20} style={{ color: o.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-black text-sm">{o.en}</p>
                          <p className="text-sm font-semibold" style={{ color: "#0A542E" }}>{o.hi}</p>
                        </div>
                        <ChevronRight size={18} className="text-black/25 flex-shrink-0" />
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#FFFBEB] border border-[#ffda24]/40 rounded-2xl p-4 flex items-center gap-3 mt-3">
                    <div className="w-9 h-9 rounded-full bg-[#ffda24]/30 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={16} className="text-[#92400E]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-black">Not sure? No problem!</p>
                      <p className="text-xs text-black/60">I can help you find schemes based on your situation.</p>
                    </div>
                    <button
                      onClick={() => pushAgent("No problem — tell me a little about yourself and I'll figure out the right category.")}
                      className="border-2 border-black/10 bg-white text-black text-xs font-bold px-3.5 py-2 rounded-lg whitespace-nowrap hover:bg-black/5 transition-colors flex-shrink-0"
                    >
                      Tell me my options
                    </button>
                  </div>
                </>
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
                      className="group text-sm sm:text-base border border-[#0A542E]/30 rounded-full px-4 py-2 hover:bg-[#0A542E] hover:text-white transition-colors bg-white"
                    >
                      {g.en} <span className="text-black/70 font-bold group-hover:text-white transition-colors">/ {g.hi}</span>
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
                    <div className="bg-white border border-black/10 rounded-xl p-4 text-sm text-black font-semibold">
                      No matches yet — I'll notify you the moment a new scheme opens for your profile.
                    </div>
                  )}
                  {matches.map((m) => (
                    <div key={m.schemeId} className="bg-white border border-black/10 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold text-black">{m.name}</p>
                        <span className="text-xs bg-[#F0FDF4] text-[#0A542E] rounded-full px-2 py-0.5 whitespace-nowrap capitalize border border-[#0A542E]/20">
                          {m.category}
                        </span>
                      </div>
                      <p className="text-xs text-black/70 font-semibold mt-1 flex items-center gap-1">
                        <IndianRupee size={12} /> {m.amount}
                      </p>
                      <p className="text-xs text-black/70 font-medium mt-2">{m.reasons[0]}</p>
                      <div className="mt-3 flex items-start gap-2 border-t border-black/5 pt-3">
                        <FileCheck2 size={14} className="text-[#0A542E] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-black/70 font-medium">{m.documents.join(", ")}</p>
                      </div>
                      <button
                        onClick={() => handleApply(m)}
                        disabled={appliedSchemeIds.includes(m.schemeId) || applyingSchemeId === m.schemeId}
                        className="mt-3 w-full text-xs font-semibold rounded-lg py-2 bg-[#0A542E] text-white disabled:bg-black/10 disabled:text-black/40 transition-colors"
                      >
                        {appliedSchemeIds.includes(m.schemeId)
                          ? "Application submitted ✓"
                          : applyingSchemeId === m.schemeId
                          ? "Submitting..."
                          : "Apply Now"}
                      </button>
                    </div>
                  ))}
                  {sendingNotifs && (
                    <div className="bg-[#F0FDF4] border border-[#0A542E]/20 rounded-xl p-3 flex items-center gap-2">
                      <BellRing size={15} className="text-[#0A542E] animate-pulse flex-shrink-0" />
                      <p className="text-xs text-[#0A542E] font-medium">Sending SMS and email confirmation...</p>
                    </div>
                  )}
                  {!sendingNotifs && matches.length > 0 && (
                    <Link to="/notifications" className="block text-center text-xs text-[#0A542E] font-semibold underline pt-1">
                      View sent notifications
                    </Link>
                  )}
                </div>
              )}

              <div ref={endRef} />
            </div>

            <div className="max-w-4xl w-full mx-auto mt-4 sticky bottom-0 pt-2" style={{ background: "#FAF7F2" }}>
              <div className="flex items-center gap-2 bg-white border border-black/10 rounded-full px-2 py-1.5 shadow-sm">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFreeText()}
                  placeholder={
                    step === "age"
                      ? "Type your age... / अपनी उम्र लिखें..."
                      : step === "income"
                        ? "Type approx. annual income in ₹... / अनुमानित वार्षिक आय लिखें..."
                        : "Type your message... / अपना संदेश लिखें..."
                  }
                  className="flex-1 px-3 py-1.5 text-sm focus:outline-none bg-transparent"
                />
                <button
                  onClick={toggleMic}
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${listening ? "bg-red-50 text-red-600 animate-pulse" : "text-black/50 hover:bg-black/5"
                    }`}
                  aria-label={listening ? "Stop listening" : "Use voice"}
                  title={supported ? "" : "Voice input not supported in this browser"}
                >
                  <Mic size={17} />
                </button>
                <button
                  onClick={handleFreeText}
                  className="w-9 h-9 rounded-full bg-[#0A542E] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#083d21] transition-colors"
                  aria-label="Send"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="text-xs text-black/50 text-center mt-2">
                आप बोल भी सकते हैं 🎤 &nbsp;·&nbsp; You can also speak
              </p>
            </div>
          </main>

          {/* Profile / eligibility panel */}
          <aside className="w-full xl:w-72 flex-shrink-0 border-t xl:border-t-0 xl:border-l border-black/5 bg-white px-4 sm:px-6 py-5 space-y-4 xl:overflow-y-auto">
            <div className="bg-[#F0FDF4] border border-[#0A542E]/20 rounded-xl p-4">
              <p className="text-sm font-bold text-black mb-3">Your Profile Snapshot</p>
              <div className="space-y-2">
                {profileSnapshot.map((p) => (
                  <div key={p.label} className="flex items-center justify-between text-xs">
                    <span className="text-black/60 font-medium">{p.label}</span>
                    <span className="font-bold text-black capitalize">{p.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={resetChat}
                className="w-full mt-3 border border-[#0A542E]/30 text-[#0A542E] text-xs font-bold py-2 rounded-lg hover:bg-[#0A542E]/5 transition-colors"
              >
                Update Profile
              </button>
            </div>

            {matches && matches.length > 0 && (
              <div className="border border-black/10 rounded-xl p-4">
                <p className="text-sm font-bold text-black mb-3">Eligibility Match</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F0FDF4" strokeWidth="3.5" />
                      <circle
                        cx="18" cy="18" r="15.5" fill="none" stroke="#059669" strokeWidth="3.5"
                        strokeDasharray={`${matchPercent} 100`} strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#0A542E]">
                      {matchPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-black/70 font-semibold">
                    You're eligible for {matches.length} scheme{matches.length > 1 ? "s" : ""}.
                  </p>
                </div>
              </div>
            )}

            <div className="border border-black/10 rounded-xl p-4">
              <p className="text-sm font-bold text-black mb-3 flex items-center gap-1.5">
                <Zap size={14} className="text-[#ffda24]" fill="#ffda24" /> Quick Actions
              </p>
              <div className="space-y-1">
                {[
                  { label: "Document Checklist", icon: FileText, href: "/track" },
                  { label: "Track Application", icon: ListChecks, href: "/track" },
                  { label: "Talk to Support", icon: HelpCircle, href: "mailto:support@haqagent.example" },
                ].map((a) =>
                  a.href.startsWith("mailto:") ? (
                    <a key={a.label}
                      href={a.href}
                      className="w-full flex items-center gap-2 text-xs text-black/70 font-semibold py-1.5 hover:text-[#0A542E] transition-colors"
                    >
                      <a.icon size={14} />
                      <span className="flex-1 text-left">{a.label}</span>
                      <ChevronRight size={13} />
                    </a>
                  ) : (
                    <Link
                      key={a.label}
                      to={a.href}
                      className="w-full flex items-center gap-2 text-xs text-black/70 font-semibold py-1.5 hover:text-[#0A542E] transition-colors"
                    >
                      <a.icon size={14} />
                      <span className="flex-1 text-left">{a.label}</span>
                      <ChevronRight size={13} />
                    </Link>
                  )
                )}
              </div>
            </div>

            <div className="bg-[#FFFBEB] border border-[#ffda24]/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-black">Need Help?</p>
                <span className="text-[10px] font-semibold text-[#92400E] bg-[#ffda24]/30 rounded-full px-2 py-0.5">Prototype</span>
              </div>
              <p className="text-xs text-black/60 font-medium mt-1">हम आपकी मदद के लिए यहाँ हैं। We are here to help you.</p>
              <div className="mt-3 space-y-1.5">
                <p className="flex items-center gap-2 text-xs font-semibold text-black/80">
                  <Phone size={13} className="text-[#92400E] flex-shrink-0" /> 1800-XXX-XXXX
                </p>
                <a href="mailto:support@haqagent.example" className="flex items-center gap-2 text-xs font-semibold text-black/80 hover:underline">
                  <Mail size={13} className="text-[#92400E] flex-shrink-0" /> support@haqagent.example
                </a>
              </div>
              <a href="mailto:support@haqagent.example"
                className="mt-3 text-xs border border-[#ffda24] text-black font-semibold rounded-lg px-3 py-1.5 w-full hover:bg-[#ffda24]/10 transition-colors flex items-center justify-center"
              >
                Contact Support
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
