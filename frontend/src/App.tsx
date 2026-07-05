import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell, GraduationCap, Wheat, HeartPulse, Coins, Menu, Home, ListChecks,
  MessageCircle, Globe, ClipboardList, ShieldCheck, Lock, Users, Sparkles,
  Mic, Send, ChevronRight, CheckCircle2, BellRing, FileText, RotateCw,
} from "lucide-react";
import { getNotifications } from "./lib/notifications";
import HeroCarousel from "./components/HeroCarousel";

const categories = [
  { icon: GraduationCap, label: "Education", hi: "शिक्षा", desc: "Scholarships, internships" },
  { icon: Wheat, label: "Agriculture", hi: "कृषि", desc: "Subsidies, crop insurance" },
  { icon: HeartPulse, label: "Health", hi: "स्वास्थ्य", desc: "Insurance, treatment aid" },
  { icon: Users, label: "Pension", hi: "पेंशन", desc: "Welfare, old-age support" },
];

const stats = [
  { icon: ClipboardList, value: "1000+", label: "Schemes", hi: "सरकारी योजनाएं" },
  { icon: BellRing, value: "SMS + Email", label: "Automatic Alerts", hi: "स्वचालित सूचना" },
  { icon: Mic, value: "Hindi + English", label: "Voice Support", hi: "आवाज़ से बात करें" },
];

const howItWorks = [
  { step: Mic, en: "Speak", hi: "बोलें", desc: "Aap apni samasya batayein" },
  { step: ClipboardList, en: "Check", hi: "जाँचें", desc: "Hum eligibility check karte hain" },
  { step: Send, en: "Apply", hi: "आवेदन करें", desc: "Application mein madad karte hain" },
  { step: Bell, en: "Notify", hi: "सूचना पाएं", desc: "SMS & Email se notify karte hain" },
  { step: RotateCw, en: "Follow up", hi: "अनुसरण करें", desc: "Hum follow-up karke update rakhte hain" },
];

const chatSuggestions = [
  "क्या मैं किसी योजना के लिए पात्र हूं??",
  "शन योजना के बारे में बताएं",
  "छात्रवृत्ति के विकल्प क्या हैं?",
];

const fallbackNotifs = [
  { icon: CheckCircle2, title: "Pension scheme approved", desc: "SMS and email sent", time: "2m ago", color: "#0A542E" },
  { icon: BellRing, title: "New scholarship opened", desc: "Pragati Scholarship 2024", time: "1h ago", color: "#ffda24" },
  { icon: FileText, title: "Documents verified", desc: "Your application is under review", time: "3h ago", color: "#0A542E" },
];

const collageImages = [
  { src: "edu", pos: "center 15%" },
  { src: "farm", pos: "center 25%" },
  { src: "health", pos: "center 15%" },
  { src: "pension", pos: "center 20%" },
];

export default function App() {
  const [count, setCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const load = () => setCount(getNotifications().length);
    load();
    window.addEventListener("haq-notifications-updated", load);
    return () => window.removeEventListener("haq-notifications-updated", load);
  }, []);

  return (
    <div className="min-h-full" style={{ background: "#FAF7F2" }}>
      {/* Header */}
      <header className="bg-[#0A542E] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/ logo.jpg" alt="Haq Agent" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
            <div className="leading-none">
              <p className="font-semibold text-white text-2xl sm:text-base">Haq Agent</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-2 text-sm text-white/90">
            <Link to="/" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5  hover:text-yellow-300 font-semibold ">
              <Home size={20} /> Home
            </Link>
            <Link to="/schemes" className="flex items-center gap-1.5 px-3 py-1.5 hover:text-yellow-300 font-semibold">
              <ListChecks size={20} /> Schemes
            </Link>
            <Link to="/agent" className="flex items-center gap-1.5 px-3 py-1.5 hover:text-yellow-300 font-semibold" >
              <MessageCircle size={20} /> Chat Agent
            </Link>
            <Link to="/track" className="flex items-center gap-1.5 px-3 py-1.5 hover:text-yellow-300 font-semibold">
              <ClipboardList size={20} /> Track Application
            </Link>
            <Link to="/about" className="flex items-center gap-1.5 px-3 py-1.5  hover:text-yellow-300 font-semibold">
            <ClipboardList size={20} /> About Us</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-1 border border-white/30 rounded-full px-3 py-1 text-sm hover:bg-white/10 transition-colors">
              <Globe size={20} /> हिंदी
            </button>
            <Link to="/notifications" className="relative p-1" aria-label="Notifications">
              <Bell size={20} className="text-white" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ffda24] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
            <button className="lg:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu size={22} />
            </button>
            <Link to="/login" className="hidden sm:block bg-white text-[#0A542E] font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors">
              Login
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden bg-[#083d21] px-4 pb-4 space-y-2">
            <Link to="/" className="block text-white font-semibold py-2 text-base flex items-center gap-2" onClick={() => setMenuOpen(false)}><Home size={18} /> Home</Link>
            <Link to="/schemes" className="block text-white font-semibold py-2 text-base flex items-center gap-2" onClick={() => setMenuOpen(false)}><ListChecks size={18} /> Schemes</Link>
            <Link to="/agent" className="block text-white font-semibold py-2 text-base flex items-center gap-2" onClick={() => setMenuOpen(false)}><MessageCircle size={18} /> Chat Agent</Link>
            <Link to="/track" className="block text-white font-semibold py-2 text-base flex items-center gap-2" onClick={() => setMenuOpen(false)}><ClipboardList size={18} /> Track Application</Link>
            <Link to="/about" className="block text-white font-semibold py-2 text-base" onClick={() => setMenuOpen(false)}>About Us</Link>
            <Link to="/login" className="block text-white font-semibold py-2 text-base" onClick={() => setMenuOpen(false)}>Login</Link>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Two-column: left = hero+stats+categories+how-it-works, right = sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Hero */}
            <section className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h1 className="text-3xl sm:text-3xl font-bold text-black leading-tight">
                  हर योजना,<br />हर हकदार  <span style={{ color: "#0A542E" }}>तक</span>
                </h1>
                <p className="text-black text-lg sm:text-base mt-3 font-semibold leading-relaxed">
                  An AI agent that finds the scheme plan for you, keeps you informed, and provides assistance.
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <Link to="/agent" className="bg-[#0A542E] hover:bg-[#083d21] text-white font-bold px-6 py-2.5 rounded-full transition-colors">
                    Check Eligibility
                  </Link>
                  <Link to="/agent" className="border-2 border-[#0A542E]/20 text-[#0A542E] font-semibold px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-[#0A542E]/5 transition-colors">
                    <Mic size={16} /> Voice में पूछें
                  </Link>
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <div className="flex -space-x-2">
                    {collageImages.map((c) => (
                      <img key={c.src} src={`/images/${c.src}.jpg`} className="w-7 h-7 rounded-full border-2 border-white object-cover" style={{ objectPosition: c.pos }} />
                    ))}
                  </div>
                  <p className="text-sm text-black font-medium">Trusted by citizens across Bharat</p>
                </div>
              </div>

              <HeroCarousel />
            </section>

            {/* Stats strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="bg-[#0A542E]  text-white rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10  rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <s.icon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight">{s.value}</p>
                    <p className="text-xs text-white/90">{s.label} · {s.hi}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Category cards */}
            <section>
              <p className="text-sm text-black font-semibold mb-3">
                Pick where you need help &nbsp;·&nbsp; <span className="text-[#0A542E]">अपनी ज़रूरत चुनें</span>
              </p>
              <div className="flex items-center gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  {categories.map(({ icon: Icon, label, hi, desc }) => (
                    <button
                      key={label}
                      onClick={() => (window.location.href = "/agent")}
                      className="text-left bg-white border border-black/5 rounded-xl p-4 hover:border-[#0A542E]/30 hover:shadow-sm transition-all"
                    >
                      <Icon size={22} className="text-[#0A542E]" />
                      <p className="text-sm font-bold text-black mt-2">{label}</p>
                      <p className="text text-[#0A542E] font-bold">{hi}</p>
                      <p className="text-xs text-black mt-0.5 ">{desc}</p>
                    </button>
                  ))}
                </div>
                <button className="hidden sm:flex w-9 h-9 rounded-full bg-white border border-black/10 items-center justify-center flex-shrink-0 hover:bg-black/5">
                  <ChevronRight size={16} className="text-black" />
                </button>
              </div>
            </section>

            {/* How it works */}
            <section className="bg-[#F0FDF4] rounded-2xl p-5 sm:p-8">
              <p className="font-bold text-black text-base mb-5">
                How it Works &nbsp;·&nbsp; <span className="text-[#0A542E]">यह कैसे काम करता है</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {howItWorks.map((s, i) => (
                  <div key={s.en} className="bg-white rounded-xl p-4 relative">
                    <div className="w-9 h-9 rounded-full bg-[#0A542E]/10 flex items-center justify-center mb-2">
                      <s.step size={16} className="text-[#0A542E]" />
                    </div>
                    <p className="font-bold text-black text-sm">{s.en}</p>
                    <p className="text-[#0A542E] text font-bold mb-1">{s.hi}</p>
                    <p className="text-xs text-black">{s.desc}</p>
                    {i < howItWorks.length - 1 && (
                      <ChevronRight size={16} className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-black/20" />
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN — sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 self-start">
            <div className="bg-[#F0FDF4] border border-[#0A542E] rounded-2xl p-4">
              <p className="font-bold text-black">Chat with Haq Agent</p>
              <p className="text-xs text-black mb-3"> 🇮🇳 Aapka AI Saathi, Hamesha Saath 🇮🇳</p>
              <div className="bg-white rounded-xl p-3 mb-2.5 shadow-sm">
                <p className="text text-black ">नमस्ते! 👋 मैं आपकी कैसे मदद कर सकता हूं?</p>
              </div>
              <div className="space-y-1.5 mb-3">
                {chatSuggestions.map((s) => (
                  <Link
                    key={s}
                    to="/agent"
                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text font-medium text-black hover:bg-[#0A542E]/5 transition-colors border border-black/5"
                  >
                    {s} <ChevronRight size={14} className="text-black/30 flex-shrink-0" />
                  </Link>
                ))}
              </div>
              <Link to="/agent" className="w-full bg-[#0A542E] hover:bg-[#083d21] text-white text-lg font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <MessageCircle size={18} /> चैट शुरू करें
              </Link>
            </div>

            <div className="bg-white border border-[#0A542E] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-black text-sm">Recent Notifications</p>
                <Link to="/notifications" className="text-xs font-semibold text-[#0A542E]">View All</Link>
              </div>
              <div className="space-y-3">
                {fallbackNotifs.map((n) => (
                  <div key={n.title} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${n.color}20` }}>
                      <n.icon size={14} style={{ color: n.color === "#ffda24" ? "#b45309" : n.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-black leading-tight">{n.title}</p>
                      <p className="text-xs text-black leading-tight">{n.desc}</p>
                    </div>
                    <span className="text-[10px] text-black flex-shrink-0">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0A542E] rounded-2xl p-4 relative overflow-hidden">
              <p className="text-white font-bold leading-tight">कभी मौका मिस ना हो</p>
              <p className="text-white font-bold  text mt-1.5 mb-4 max-w-[70%]">
            जब भी आप किसी योजना के लिए पात्र हों तो तुरंत अलर्ट पाएं।
              </p>
              <Link to="/notifications" className="inline-flex items-center gap-1.5 bg-[#ffda24] text-black text-xs font-bold px-3.5 py-2 rounded-lg">
                <BellRing size={13} /> Enable Notifications
              </Link>
            </div>
          </aside>
        </div>

        {/* Bottom trust strip — full width */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white border border-black/5 rounded-2xl p-5">
          {[
            { icon: ShieldCheck, en: "AI Powered", hi: "Smart Assistance" },
            { icon: Lock, en: "Secure & Private", hi: "Your data is safe with us" },
            { icon: Users, en: "Trusted by Thousands", hi: "Across rural & urban India" },
            { icon: Sparkles, en: " 🇮🇳 Made for Bharat 🇮🇳", hi: "By Indians, For Indians" },
          ].map((b) => (
            <div key={b.en} className="flex items-center gap-2.5">
              <b.icon size={18} className="text-[#0A542E] flex-shrink-0" />
              <div>
                <p className="text font-bold text-black leading-tight">{b.en}</p>
                <p className="text text-black leading-tight">{b.hi}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="bg-[#0A542E] text-white/90 text-sm text-center py-4 mt-8">
        Haq Agent · हर योजना, हर हकदार तक · Built for Bharat with Agentic AI
      </footer>
    </div>
  );
}
