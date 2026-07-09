import { Link } from "react-router-dom";
import {
  Target, FileCheck2, Bell, Users, Globe2, Languages, ShieldCheck,
  BookOpen, MapPin, Search, Mic, Smartphone, ClipboardList, Home, ListChecks, MessageCircle,
} from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-full bg-white">
      {/* Same dark-green navbar used across the whole site */}
      <header style={{ background: "#0A542E" }} className="text-white sticky top-0 z-50 shadow-lg">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/images/logo.jpg" alt="Haq Agent" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
            <div className="leading-tight">
              <p className="font-bold text-white text-base sm:text-lg">Haq Agent</p>
              <p className="text-sm text-white/80 hidden sm:block">हर योजना, हर हकदार तक</p>
            </div>
          </Link>
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-white">
            <Link to="/" className="hover:text-yellow-300 flex items-center gap-1"><Home size={20} /> Home</Link>
            <Link to="/schemes" className="hover:text-yellow-300 flex items-center gap-1"><ListChecks size={20} /> Schemes</Link>
            <Link to="/agent" className="hover:text-yellow-300 flex items-center gap-1">
              <MessageCircle size={20} /> Chat Agent
            </Link>
            <Link to="/track" className="hover:text-yellow-300">Track Application</Link>
            <Link to="/about" className="font-bold border-b-2 pb-0.5" style={{ color: "#ffda24", borderColor: "#ffda24" }}>About Us</Link>
          </nav>
          <Link to="/agent" className="bg-white font-bold text-sm px-5 py-2 rounded-full" style={{ color: "#0A542E" }}>
            Check Eligibility
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="text-center max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <span
          className="inline-block text-xs font-bold tracking-wide px-4 py-1.5 rounded-full border mb-4"
          style={{ color: "#0A542E", borderColor: "#0A542E40" }}
        >
          ABOUT HAQ AGENT
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-black mb-3">About Haq Agent</h1>
        <div className="w-14 h-1 rounded-full mx-auto mb-4" style={{ background: "#0A542E" }} />
        <p className="text-sm sm:text-base text-black leading-relaxed max-w-xl mx-auto">
          Haq Agent is an AI agent that helps you discover government schemes you already
          qualify for — and helps you actually get the benefit.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7 text-left sm:text-center">
          {[
            { Icon: Target, title: "Discover", desc: "Find schemes you qualify for." },
            { Icon: FileCheck2, title: "Understand", desc: "Get simple guidance and document help." },
            { Icon: Bell, title: "Act & Track", desc: "Apply with confidence and track every step." },
          ].map((f) => (
            <div key={f.title} className="flex sm:flex-col items-center sm:items-center gap-3">
              <div
                className="w-11 h-11 shrink-0 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: "#0A542E" }}
              >
                <f.Icon size={20} style={{ color: "#0A542E" }} />
              </div>
              <div>
                <p className="font-bold text-sm text-black">{f.title}</p>
                <p className="text text-black">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION + STATS */}
      <section className="rounded-2xl mx-4 sm:mx-auto sm:max-w-5xl px-6 sm:px-10 py-8 text-center" style={{ background: "#F4F8F5" }}>
        <span
          className="inline-block text-xs font-bold tracking-wide px-4 py-1.5 rounded-full border mb-3 bg-white"
          style={{ color: "#0A542E", borderColor: "#0A542E40" }}
        >
          OUR MISSION
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-3">
          Making every scheme accessible to every citizen.
        </h2>
        <div className="w-14 h-1 rounded-full mx-auto mb-3" style={{ background: "#0A542E" }} />
        <p className="text-sm text-black mb-6">No searching. No confusion. No missed opportunities.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
          {[
            { Icon: Users, value: "1000+", label: "Government Schemes Tracked" },
            { Icon: Globe2, value: "24×7", label: "AI Assistance Available" },
            { Icon: Languages, value: "2", label: "Languages (Hindi + English)" },
            { Icon: ShieldCheck, value: "100%", label: "Free Guidance for Every Citizen" },
          ].map((s, i) => (
            <div key={s.label} className={`px-2 ${i < 3 ? "sm:border-r sm:border-black/10" : ""}`}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: "#0A542E15" }}
              >
                <s.Icon size={18} style={{ color: "#0A542E" }} />
              </div>
              <p className="text-xl font-extrabold" style={{ color: "#0A542E" }}>{s.value}</p>
              <p className="text-xs text-black mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-9">
        <p className="text-xs font-bold tracking-wide mb-2" style={{ color: "#0A542E" }}>THE PROBLEM</p>
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-5 max-w-2xl">
          It's not that schemes don't exist. It's that they never reach the people who need them most.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { Icon: BookOpen, title: "Awareness stops at exams", desc: "NITI Aayog opens fresh internship applications in the first ten days of every month. In rural classrooms, almost no one has heard of it." },
            { Icon: MapPin, title: "Benefits reach the wrong address", desc: "Quotas and subsidies meant for rural households often get claimed by urban families who simply hold a rural address on paper." },
            { Icon: Search, title: "Discovery is scattered", desc: "Schemes for farmers, students, patients, and workers sit across dozens of portals with no single place to check what you qualify for." },
          ].map((p) => (
            <div key={p.title} className="rounded-xl p-4 border" style={{ borderColor: "#0A542E20", background: "#F4F8F5" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center mb-2" style={{ background: "#0A542E" }}>
                <p.Icon size={16} className="text-white" />
              </div>
              <p className="font-bold text-sm text-black mb-1">{p.title}</p>
              <p className="text-xs text-black leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OUR SOLUTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-9">
        <p className="text-xs font-bold tracking-wide mb-2" style={{ color: "#0A542E" }}>OUR SOLUTION</p>
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-5">One agent. Every scheme. Acts before you ask.</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { Icon: Mic, title: "Speak once", desc: "Describe your situation in Hindi or English — by voice or text. The agent takes it from there." },
            { Icon: Search, title: "Agent checks everything", desc: "Eligibility is verified against real government scheme rules. No guesswork." },
            { Icon: Smartphone, title: "Notifies automatically", desc: "SMS and email the moment you qualify, a scheme opens, or your application is approved." },
            { Icon: ClipboardList, title: "Guides you to apply", desc: "Tells you exactly which documents you need before you waste a trip to any government office." },
          ].map((s) => (
            <div key={s.title} className="border-2 rounded-xl p-4 flex gap-3" style={{ borderColor: "#0A542E20" }}>
              <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center" style={{ background: "#0A542E15" }}>
                <s.Icon size={16} style={{ color: "#0A542E" }} />
              </div>
              <div>
                <p className="font-bold text-sm text-black mb-1">{s.title}</p>
                <p className="text-xs text-black leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REAL STORIES */}
      <section className="mx-4 sm:mx-auto sm:max-w-5xl rounded-2xl px-6 sm:px-10 py-8 mb-9 border-2" style={{ borderColor: "#ffda24", background: "#FFFBEB" }}>
        <p className="text-xs font-bold tracking-wide mb-2" style={{ color: "#0A542E" }}>REAL STORIES</p>
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-5">Why this isn't a hypothetical problem</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              tag: "Student — Scholarship",
              story: "Sakshi Singh Patel scored 95% in her MP Board exams — enough for the Pragati Scholarship. She found out months later, from an urban friend, by accident.",
              help: "Haq Agent would have told her the moment her result came in.",
            },
            {
              tag: "Graduate — Internship",
              story: "A rural graduate stayed unemployed for months because he never knew NITI Aayog opens fresh internship applications in the first 10 days of every month.",
              help: "Haq Agent notifies automatically at the start of every cycle.",
            },
            {
              tag: "Farmer — Subsidy",
              story: "Many farmers who work the land don't know which scheme they qualify for. Meanwhile, people who left for cities quietly claim the same benefits.",
              help: "Haq Agent checks eligibility against your real situation — not just your address.",
            },
          ].map((s) => (
            <div key={s.tag} className="bg-white rounded-xl p-3.5 border" style={{ borderColor: "#0A542E20" }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "#0A542E" }}>{s.tag}</p>
              <p className="text-xs text-black italic mb-2 leading-relaxed">{s.story}</p>
              <div className="rounded-lg p-2.5" style={{ background: "#F0FDF4" }}>
                <p className="text-xs font-bold" style={{ color: "#0A542E" }}>How Haq Agent helps</p>
                <p className="text-xs text-black mt-1">{s.help}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHO BUILT THIS */}
      <section className="max-w-2xl mx-auto text-center px-4 sm:px-6 pb-10">
        <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden border-4" style={{ borderColor: "#0A542E" }}>
          <img src="/images/logo.jpg" alt="Haq Agent" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-1">Sneha Choudhary</h2>
        <p className="text-sm font-bold mb-1" style={{ color: "#0A542E" }}>B.Tech Final Year — CSE (Data Science)</p>
        <p className="text-xs text-black mb-1">School of Information Technology, RGPV Bhopal</p>
        <p className="text-xs text-black mb-4">ScriptedBy{"{Her}"} 2.0 · Meesho x HackerEarth</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: "#0A542E" }}>React + Tailwind</span>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold text-black" style={{ background: "#ffda24" }}>Node.js Backend</span>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold text-black" style={{ background: "#ffda24" }}>Agentic AI</span>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: "#0A542E" }}>Hindi + English Voice</span>
        </div>
      </section>

      <footer className="text-white text-sm font-medium text-center py-5" style={{ background: "#0A542E" }}>
        Haq Agent · हर योजना, हर हकदार तक · Built for Bharat with Agentic AI
      </footer>
    </div>
  );
}