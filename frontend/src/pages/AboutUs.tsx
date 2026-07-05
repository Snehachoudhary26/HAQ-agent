
import { Link } from "react-router-dom";
import { Users, Target, Heart, Sprout, GraduationCap, Code2, Globe, MessageCircle, BookOpen, MapPin, Search, Mic, Smartphone, ClipboardList, Home, ListChecks } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-full bg-white">
      <header style={{ background: "#0A542E" }} className="text-white sticky top-0 z-50 shadow-lg">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/images/ logo.jpg" alt="Haq Agent" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
            <div className="leading-tight">
              <p className="font-bold text-white text-base sm:text-lg">Haq Agent</p>
              <p className="text-sm text-white/80 hidden sm:block">हर योजना, हर हकदार तक</p>
            </div>
          </Link>
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-white">
            <Link to="/" className="hover:text-yellow-300 flex items-center gap-1"><Home size={16} /> Home</Link>
            <Link to="/schemes" className="hover:text-yellow-300 flex items-center gap-1"><ListChecks size={16} /> Schemes</Link>
            <Link to="/agent" className="hover:text-yellow-300 flex items-center gap-1">
              <MessageCircle size={16} /> Chat Agent
            </Link>
            <Link to="/track" className="hover:text-yellow-300">Track Application</Link>
            <Link to="/about" className="font-bold border-b-2 pb-0.5" style={{ color: "#ffda24", borderColor: "#ffda24" }}>About Us</Link>
          </nav>
          <Link to="/agent" className="bg-white font-bold text-sm px-5 py-2 rounded-full" style={{ color: "#0A542E" }}>
            Check Eligibility
          </Link>
        </div>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">

        {/* Hero section */}
        <section className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Government schemes shouldn't stay hidden.
          </h1>
          <p className="text-lg sm:text-xl font-semibold" style={{ color: "#0A542E" }}>
            सरकारी योजनाएं छुपी नहीं रहनी चाहिए।
          </p>
          <p className="text-base font-medium text-black mt-4 leading-relaxed">
            Haq Agent makes sure the right scheme finds the right person, on time —
            regardless of who already knows the system.
          </p>
        </section>

        {/* Problem we solve */}
        <section className="rounded-2xl p-6 sm:p-10" style={{ background: "#0A542E" }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">The Problem</h2>
          <p className="text-base font-semibold mb-6" style={{ color: "#ffda24" }}>
            It's not that schemes don't exist. It's that they never reach the people who need them most.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { Icon: BookOpen, title: "Awareness stops at exams", desc: "NITI Aayog opens internships every month. Most rural students have never heard of it." },
              { Icon: MapPin, title: "Benefits reach the wrong address", desc: "Subsidies meant for farmers get claimed by city residents who kept a rural address on paper." },
              { Icon: Search, title: "Discovery is scattered", desc: "Schemes for farmers, students, patients sit across dozens of portals with no single entry point." },
            ].map((p) => (
              <div key={p.title} className="bg-white/10 rounded-xl p-4">
                <p.Icon size={28} className="text-white mb-3" />
                <p className="text-base font-bold text-white mb-2">{p.title}</p>
                <p className="text-sm font-semibold text-white/90">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our solution */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Our Solution</h2>
          <p className="text-base font-semibold mb-6" style={{ color: "#0A542E" }}>
            One agent. Every scheme. Acts before you ask.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { Icon: Mic, title: "Speak once", desc: "Describe your situation in Hindi or English — by voice or text. The agent takes it from there." },
              { Icon: Search, title: "Agent checks everything", desc: "Eligibility verified against real government scheme rules. No guesswork." },
              { Icon: Smartphone, title: "Notifies automatically", desc: "SMS and email the moment you qualify, a scheme opens, or your application is approved." },
              { Icon: ClipboardList, title: "Guides you to apply", desc: "Tells you exactly which documents you need before you waste a trip to any government office." },
            ].map((s) => (
              <div key={s.title} className="border-2 rounded-xl p-5" style={{ borderColor: "#0A542E30" }}>
                <s.Icon size={28} style={{ color: "#0A542E" }} className="mb-3" />
                <p className="text-base font-bold text-black mb-2">{s.title}</p>
                <p className="text-sm font-semibold text-black">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Real stories */}
        <section className="rounded-2xl p-6 sm:p-10 border-2" style={{ borderColor: "#ffda24", background: "#FFFBEB" }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6">Real Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { tag: "Student — Scholarship", story: "Sakshi Singh Patel scored 95% in her MP Board exams — enough for the Pragati Scholarship. She found out months later, from an urban friend, by accident.", help: "Haq Agent would have told her the moment her result came in." },
              { tag: "Graduate — Internship", story: "A rural graduate stayed unemployed for months because he never knew NITI Aayog opens fresh internship applications in the first 10 days of every month.", help: "Haq Agent notifies automatically at the start of every cycle." },
              { tag: "Farmer — Subsidy", story: "Many farmers who work the land don't know which scheme they qualify for. Meanwhile, people who left for cities quietly claim the same benefits.", help: "Haq Agent checks eligibility against your real situation — not just your address." },
            ].map((s) => (
              <div key={s.tag} className="bg-white rounded-xl p-4 border-2" style={{ borderColor: "#0A542E20" }}>
                <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#0A542E" }}>{s.tag}</p>
                <p className="text-sm font-medium text-black italic mb-3">{s.story}</p>
                <div className="rounded-lg p-3" style={{ background: "#F0FDF4" }}>
                  <p className="text-sm font-bold" style={{ color: "#0A542E" }}>How Haq Agent helps</p>
                  <p className="text-sm font-medium text-black mt-1">{s.help}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Who built this */}
        <section className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4" style={{ borderColor: "#0A542E" }}>
            <img src="/images/ logo.jpg" alt="Haq Agent" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-1">Sneha Choudhary</h2>
          <p className="text-base font-bold mb-1" style={{ color: "#0A542E" }}>B.Tech Final Year — CSE (Data Science)</p>
          <p className="text-base font-semibold text-black mb-1">School of Information Technology, RGPV Bhopal</p>
          <p className="text-base font-semibold text-black mb-4">ScriptedBy{"{Her}"} 2.0 · Meesho x HackerEarth</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 rounded-full text-sm font-bold text-white" style={{ background: "#0A542E" }}>React + Tailwind</span>
            <span className="px-4 py-2 rounded-full text-sm font-bold text-black" style={{ background: "#ffda24" }}>Node.js Backend</span>
            <span className="px-4 py-2 rounded-full text-sm font-bold text-black" style={{ background: "#ffda24" }}>Agentic AI</span>
            <span className="px-4 py-2 rounded-full text-sm font-bold text-white" style={{ background: "#0A542E" }}>Hindi + English Voice</span>
          </div>
        </section>

      </main>

      <footer className="text-white text-sm font-medium text-center py-5 mt-8" style={{ background: "#0A542E" }}>
        Haq Agent · हर योजना, हर हकदार तक · Built for Bharat with Agentic AI
      </footer>
    </div>
  );
}
