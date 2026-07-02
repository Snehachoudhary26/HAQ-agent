import { useEffect, useState } from "react";
import { Bell, GraduationCap, Wheat, HeartPulse, Coins, Sprout, Menu, BellRing, CheckCircle2, Mic } from "lucide-react";
import HeroCarousel from "./components/HeroCarousel";
import { getNotifications } from "./lib/notifications";

const categories = [
  { icon: GraduationCap, label: "Education", hi: "शिक्षा", desc: "Scholarships, internships", color: "text-[#0A542E]", bg: "bg-white" },
  { icon: Wheat, label: "Agriculture", hi: "कृषि", desc: "Subsidies, crop insurance", color: "text-[#0D9488]", bg: "bg-teal-50" },
  { icon: HeartPulse, label: "Health", hi: "स्वास्थ्य", desc: "Insurance, treatment aid", color: "text-[#0A542E]", bg: "bg-white" },
  { icon: Coins, label: "Pension", hi: "पेंशन", desc: "Welfare, old-age support", color: "text-[#D9A21B]", bg: "bg-amber-50" },
];

const stats = [
  { value: "1000+", label: "Schemes", hi: "योजनाएं" },
  { value: "SMS + Email", label: "Automatic Alerts", hi: "स्वचालित सूचना" },
  { value: "Hindi + English", label: "Voice Support", hi: "आवाज़ से बात करें" },
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
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/ logo.jpg" alt="Haq Agent" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
            <div className="leading-none">
              <p className="font-semibold text-white text-sm sm:text-base">Haq Agent</p>
              <p className="text-sm text-white font-bold hidden sm:block">हर योजना, हर हकदार तक</p>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-6 text-sm text-white/90">
            <a href="/" className="hover:text-white font-medium">Home</a>
            <a href="/schemes" className="hover:text-white">Schemes</a>
            <a href="/agent" className="hover:text-yellow-300 transition-colors flex items-center gap-1">💬 Chat Agent </a>
            <a href="#" className="hover:text-white">About Us</a>
            <button className="border border-white/30 rounded-full px-3 py-1 text-sm hover:bg-white/10 transition-colors">🌐 हिंदी</button>
          </nav>

          <div className="flex items-center gap-3">
            <a href="/notifications" className="relative p-1" aria-label="Notifications">
              <Bell size={20} className="text-white" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D9A21B] text-[#000000] text-sm font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </a>
            <button
              className="sm:hidden text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={22} />
            </button>
            <a href="/agent" className="hidden sm:block bg-white text-[#0A542E] font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-white transition-colors">
              Login
            </a>
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden bg-[#083d21] px-4 pb-4 space-y-2">
            <a href="/" className="block text-white font-semibold py-2 text-base">Home</a>
            <a href="/agent" className="block text-white font-semibold py-2 text-base">Schemes</a>
            <a href="/agent" className="block text-white font-semibold py-2 text-base">How it Works</a>
            <a href="/track" className="block text-white font-semibold py-2 text-base">Track Application</a>
            <a href="#" className="block text-white font-semibold py-2 text-base">About Us</a>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">

        {/* Hero carousel — UNTOUCHED */}
        <HeroCarousel />

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#0A542E] text-white rounded-xl p-3 sm:p-4 text-center">
              <p className="font-bold text-xl sm:text-2xl">{s.value}</p>
              <p className="text-sm sm:text-sm text-white font-bold mt-0.5">{s.label}</p>
              <p className="text-sm text-white/90">{s.hi}</p>
            </div>
          ))}
        </div>

        {/* Category cards */}
        <section>
          <p className="text-sm sm:text-sm text-black font-semibold mb-3 font-medium">
            Pick where you need help &nbsp;·&nbsp; <span className="text-[#0A542E]">अपनी ज़रूरत चुनें</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {categories.map(({ icon: Icon, label, hi, desc, color, bg }) => (
              <button
                key={label}
                onClick={() => window.location.href = "/agent"}
                className={`text-left ${bg} border border-[#059669]/15 rounded-xl p-4 hover:border-[#059669]/40 hover:shadow-sm transition-all`}
              >
                <Icon size={22} className={color} />
                <p className="text-base font-bold text-[#000000] mt-2">{label}</p>
                <p className="text-sm text-[#0A542E] font-medium">{hi}</p>
                <p className="text-sm text-black font-semibold mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Agent notification card */}
        <section className="bg-white border border-[#059669]/20 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <BellRing size={24} className="text-[#0A542E]" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-[#1F2937]">Agent notified you</p>
            <p className="text-sm text-black font-semibold mt-0.5">Pension scheme approved — SMS and email sent</p>
          </div>
          <CheckCircle2 size={20} className="text-[#0A542E] flex-shrink-0" />
        </section>

        {/* How it works strip */}
        <section className="bg-[#0A542E] rounded-2xl px-5 sm:px-8 py-6 sm:py-8">
          <p className="text-white font-semibold text-base sm:text-lg mb-5 text-center">
            How it Works &nbsp;·&nbsp; <span className="text-[#D9A21B]">यह कैसे काम करता है</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {[
              { step: "1", label: "Speak", hi: "बोलें" },
              { step: "2", label: "Check", hi: "जाँचें" },
              { step: "3", label: "Apply", hi: "आवेदन करें" },
              { step: "4", label: "Notify", hi: "सूचना पाएं" },
              { step: "5", label: "Follow up", hi: "अनुसरण करें" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full bg-[#059669] text-white text-sm font-bold flex items-center justify-center">
                  {s.step}
                </div>
                <p className="text-white text-sm sm:text-base font-semibold">{s.label}</p>
                <p className="text-white/90 text-xs">{s.hi}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/agent" className="bg-[#0A542E] text-white text-base font-bold px-6 py-2.5 rounded-full text-center hover:bg-[#083d21] transition-colors">
              Check Eligibility
            </a>
            <a href="/agent" className="border border-white/30 text-white text-sm px-6 py-2.5 rounded-full text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              <Mic size={15} /> Voice में पूछें
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#0A542E] text-white/90 text-sm text-center py-4 mt-8">
        Haq Agent · हर योजना, हर हकदार तक · Built for Bharat with Agentic AI
      </footer>
    </div>
  );
}
