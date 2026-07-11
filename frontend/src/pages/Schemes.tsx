import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, GraduationCap, Wheat, HeartPulse, Users, FileCheck2, IndianRupee,
  ExternalLink, Bell, ChevronDown, ChevronUp, MessageCircle, Home, ListChecks,
  ClipboardList, Bookmark, Sparkles, Mic, LayoutGrid, ChevronRight, Calendar,
  Briefcase, Building2,
  Globe,
} from "lucide-react";
import { getNotifications } from "../lib/notifications";
import { API_BASE } from "../lib/config";
import { useEffect } from "react";

type Scheme = {
  id: string; name: string; nameHi: string; category: string;
  summary: string; summaryHi: string; amount: string; amountSub: string;
  documents: string[]; eligibilitySnap: string; source: string;
};

const schemes: Scheme[] = [
  { id: "pmkisan", name: "PM-KISAN", nameHi: "प्रधानमंत्री किसान सम्मान निधि", category: "agriculture", summary: "Income support of ₹6,000/year for landholding farmer families, paid in 3 installments via direct bank transfer.", summaryHi: "भूमिधारक किसान परिवारों को ₹6,000/वर्ष की आय सहायता, 3 किस्तों में सीधे बैंक में।", amount: "₹6,000 / year", amountSub: "3 Installments", documents: ["Aadhaar card", "Land ownership record", "Bank passbook (Aadhaar-seeded)"], eligibilitySnap: "Landholding farmer · Not an income tax payer · Not a government employee", source: "pmkisan.gov.in" },
  { id: "nsap-ignoaps", name: "IGNOAPS (NSAP Pension)", nameHi: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन", category: "pension", summary: "Monthly pension for BPL senior citizens aged 60+. Higher amount after age 80.", summaryHi: "60+ आयु के BPL वरिष्ठ नागरिकों के लिए मासिक पेंशन। 80 के बाद अधिक राशि।", amount: "₹200–₹500 / month", amountSub: "60+ years", documents: ["Age proof", "BPL/income certificate", "Bank account", "Aadhaar card"], eligibilitySnap: "Age 60+ · Below Poverty Line (BPL) · Not covered under another pension", source: "nsap.nic.in" },
  { id: "pmjay", name: "Ayushman Bharat – PMJAY", nameHi: "आयुष्मान भारत – प्रधानमंत्री जन आरोग्य योजना", category: "health", summary: "Cashless health insurance of ₹5 lakh per family per year. All citizens 70+ qualify automatically.", summaryHi: "प्रति परिवार ₹5 लाख/वर्ष का कैशलेस स्वास्थ्य बीमा। 70+ आयु के सभी नागरिक स्वतः पात्र।", amount: "Up to ₹5,00,000", amountSub: "Per Family / Year", documents: ["Aadhaar card", "Ration card / Family ID", "Mobile number for OTP"], eligibilitySnap: "SECC-2011 listed family · OR aged 70+ (universal)", source: "pmjay.gov.in" },
  { id: "pragati-girls", name: "AICTE Pragati Scholarship", nameHi: "AICTE प्रगति छात्रवृत्ति (बालिकाओं के लिए)", category: "education", summary: "₹50,000/year for girl students in 1st year of AICTE-approved technical diploma or degree. Family income under ₹8 lakh/year.", summaryHi: "AICTE-अनुमोदित तकनीकी पाठ्यक्रम की प्रथम वर्ष की छात्राओं को ₹50,000/वर्ष।", amount: "₹50,000 / year", amountSub: "For Girl Students", documents: ["Class 10 & 12 marksheets", "Admission proof", "Income certificate", "Bank passbook", "Aadhaar card"], eligibilitySnap: "Female · 1st year technical diploma/degree · Family income < ₹8 lakh/year", source: "aicte-india.org" },
  { id: "pmfby", name: "PM Fasal Bima Yojana", nameHi: "प्रधानमंत्री फसल बीमा योजना", category: "agriculture", summary: "Crop insurance that compensates farmers for losses due to natural calamities, pests, or disease. Very low premium.", summaryHi: "प्राकृतिक आपदा, कीट या बीमारी से फसल नुकसान पर मुआवजा। बहुत कम प्रीमियम।", amount: "Low Premium", amountSub: "All Farmers", documents: ["Aadhaar card", "Land record / Khasra", "Bank passbook", "Sowing certificate"], eligibilitySnap: "Farmer with notified crop · Enrolled before cutoff date", source: "pmfby.gov.in" },
  { id: "pmcareschildren", name: "PM CARES for Children", nameHi: "पीएम केयर्स फॉर चिल्ड्रन", category: "education", summary: "Support for children who lost parents to COVID-19. Monthly stipend, PMJAY health cover, education support up to age 23.", summaryHi: "COVID-19 में माता-पिता खोने वाले बच्चों के लिए मासिक वजीफा, स्वास्थ्य कवर और शिक्षा सहायता।", amount: "Monthly Stipend", amountSub: "Up to 23 years", documents: ["Death certificate of parent(s)", "Birth certificate", "Aadhaar card", "Bank account"], eligibilitySnap: "Child below 18 · Lost parent(s) to COVID-19", source: "pmcaresforchildren.in" },
  { id: "niti-internship", name: "NITI Aayog Internship", nameHi: "नीति आयोग इंटर्नशिप", category: "education", summary: "Paid internship at NITI Aayog for UG, PG or PhD students. New cycle opens in the first 10 days of every month.", summaryHi: "UG, PG या PhD छात्रों के लिए नीति आयोग में पेड इंटर्नशिप। हर महीने के पहले 10 दिनों में आवेदन।", amount: "Paid Internship", amountSub: "Monthly Cycle", documents: ["College ID / enrollment proof", "Resume / CV", "NOC from institution"], eligibilitySnap: "UG (3rd year+) / PG / PhD student · Any stream", source: "niti.gov.in" },
  { id: "pm-internship", name: "PM Internship Scheme", nameHi: "प्रधानमंत्री इंटर्नशिप योजना", category: "employment", summary: "12-month internship with India's top 500 companies for young graduates and diploma holders. Monthly stipend plus a one-time grant.", summaryHi: "युवाओं के लिए देश की टॉप 500 कंपनियों में 12 महीने की इंटर्नशिप, मासिक वजीफा और एकमुश्त अनुदान के साथ।", amount: "₹5,000 / month", amountSub: "+ ₹6,000 one-time", documents: ["Aadhaar card", "Educational certificates", "Bank passbook", "Domicile / family income proof"], eligibilitySnap: "Age 21–24 · Not employed full-time · Not enrolled in full-time education", source: "services.india.gov.in" },
  { id: "mgnrega", name: "MGNREGA", nameHi: "महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम", category: "employment", summary: "Guarantees 100 days of paid wage employment per year to rural households willing to do unskilled manual work.", summaryHi: "ग्रामीण परिवारों को हर वर्ष 100 दिनों के अकुशल शारीरिक कार्य की गारंटीकृत मजदूरी।", amount: "100 Days / year", amountSub: "Wage employment", documents: ["Job card", "Aadhaar card", "Bank account", "Residence proof"], eligibilitySnap: "Rural household · Adult member willing to do unskilled manual work", source: "rural.nic.in" },
  { id: "pmay-g", name: "PMAY-G (Rural Housing)", nameHi: "प्रधानमंत्री आवास योजना - ग्रामीण", category: "housing", summary: "Financial assistance to rural families without a pucca house, for construction of a basic all-weather dwelling.", summaryHi: "बिना पक्के घर वाले ग्रामीण परिवारों को मूलभूत आवास निर्माण हेतु वित्तीय सहायता।", amount: "₹1,20,000", amountSub: "Plains areas", documents: ["Aadhaar card", "SECC-2011 record", "Bank account", "Job card (if available)"], eligibilitySnap: "Rural household without pucca house · SECC-2011 listed / homeless", source: "mohua.gov.in" },
  { id: "eshram", name: "e-Shram Registration", nameHi: "ई-श्रम पंजीकरण", category: "employment", summary: "National database registration for unorganised sector workers, unlocking accident insurance cover and access to welfare schemes.", summaryHi: "असंगठित क्षेत्र के श्रमिकों के लिए राष्ट्रीय डेटाबेस पंजीकरण, दुर्घटना बीमा कवर सहित।", amount: "₹2,00,000 cover", amountSub: "Accidental insurance", documents: ["Aadhaar card", "Bank account", "Mobile number"], eligibilitySnap: "Unorganised sector worker · Age 16–59 · Not an EPFO/ESIC member", source: "labour.gov.in" },
  { id: "naps", name: "NAPS Apprenticeship", nameHi: "राष्ट्रीय प्रशिक्षुता संवर्धन योजना", category: "employment", summary: "Government shares part of the stipend when companies take on apprentices, helping youth gain real workplace skills.", summaryHi: "कंपनियों द्वारा प्रशिक्षु रखे जाने पर सरकार वजीफे का एक हिस्सा वहन करती है।", amount: "25% stipend share", amountSub: "By Government", documents: ["Aadhaar card", "Educational certificates", "Bank account"], eligibilitySnap: "Age 14+ · Meets minimum qualification for the trade", source: "apprenticeshipindia.gov.in" },
];

type ExploreLink = { name: string; org: string; website: string; window?: string };

const exploreInternships: ExploreLink[] = [
  { name: "Digital India Internship", org: "MeitY", website: "intern.meity.gov.in", window: "Apr – Jun" },
  { name: "ISRO Student Internship", org: "ISRO", website: "isro.gov.in/Internship.html", window: "Jul – Sep" },
  { name: "DRDO Internship & Training", org: "DRDO", website: "drdo.gov.in", window: "Jul – Sep" },
  { name: "ICMR Research Internship", org: "ICMR", website: "icmr.gov.in" },
  { name: "ICAR Student Internship", org: "ICAR", website: "icar.org.in" },
  { name: "RBI Internship", org: "Reserve Bank of India", website: "rbi.org.in" },
  { name: "SEBI Internship", org: "SEBI", website: "sebi.gov.in" },
  { name: "UIDAI Internship", org: "UIDAI", website: "uidai.gov.in" },
  { name: "PSU Internships", org: "HAL, BEL, BHEL, ONGC, NTPC, GAIL, POWERGRID", website: "hal-india.co.in" },
];

const exploreJobs: ExploreLink[] = [
  { name: "UPSC Civil Services", org: "UPSC", website: "upsc.gov.in", window: "Jan – Mar" },
  { name: "SSC Central Govt Recruitment", org: "SSC", website: "ssc.gov.in", window: "Jan – Mar" },
  { name: "Bank Recruitment (IBPS)", org: "IBPS", website: "ibps.in" },
  { name: "Railway Recruitment", org: "RRB", website: "rrbcdg.gov.in" },
  { name: "PSU Recruitment", org: "DRDO, ISRO, BEL, HAL, BHEL, NTPC, GAIL, ONGC", website: "isro.gov.in/Careers.html", window: "Oct – Dec" },
];

const exploreScholarships: ExploreLink[] = [
  { name: "National Scholarship Portal", org: "Ministry of Education", website: "scholarships.gov.in", window: "Jan – Mar" },
  { name: "UGC Fellowships", org: "UGC", website: "ugc.gov.in" },
  { name: "PMKVY (Skill Development)", org: "Ministry of Skill Development", website: "pmkvyofficial.org" },
  { name: "Skill India Training", org: "Skill India", website: "skillindia.gov.in" },
  { name: "National Career Service", org: "Ministry of Labour", website: "ncs.gov.in" },
];

const exploreUtility: ExploreLink[] = [
  { name: "myScheme (all-scheme finder)", org: "Govt of India", website: "myscheme.gov.in" },
  { name: "National Portal of India", org: "Govt of India", website: "india.gov.in" },
  { name: "DigiLocker", org: "MeitY", website: "digilocker.gov.in" },
  { name: "UMANG App Portal", org: "MeitY", website: "web.umang.gov.in" },
  { name: "PM Jan Dhan Yojana", org: "Ministry of Finance", website: "pmjdy.gov.in" },
  { name: "MUDRA Loans", org: "Ministry of Finance", website: "mudra.org.in" },
  { name: "Startup India", org: "DPIIT", website: "startupindia.gov.in" },
  { name: "Udyam Registration (MSME)", org: "Ministry of MSME", website: "udyamregistration.gov.in" },
  { name: "Beti Bachao Beti Padhao", org: "Ministry of WCD", website: "wcd.gov.in" },
  { name: "PM SHRI Schools", org: "Ministry of Education", website: "pmshrischools.education.gov.in" },
];

const categoryMeta: Record<string, { label: string; icon: React.ElementType; badgeBg: string; badgeText: string; iconBg: string }> = {
  agriculture: { label: "Agriculture", icon: Wheat, badgeBg: "#FEF3C7", badgeText: "#92400E", iconBg: "#F0FDF4" },
  pension: { label: "Pension", icon: Users, badgeBg: "#FEF3C7", badgeText: "#92400E", iconBg: "#F0FDF4" },
  health: { label: "Health", icon: HeartPulse, badgeBg: "#DCFCE7", badgeText: "#166534", iconBg: "#F0FDF4" },
  education: { label: "Education", icon: GraduationCap, badgeBg: "#DBEAFE", badgeText: "#1E40AF", iconBg: "#F0FDF4" },
  employment: { label: "Employment", icon: Briefcase, badgeBg: "#EDE9FE", badgeText: "#5B21B6", iconBg: "#F0FDF4" },
  housing: { label: "Housing", icon: Building2, badgeBg: "#FCE7F3", badgeText: "#9D174D", iconBg: "#F0FDF4" },
};

const filterPills = [
  { key: "all", label: "All Schemes", icon: LayoutGrid },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "agriculture", label: "Agriculture", icon: Wheat },
  { key: "health", label: "Health", icon: HeartPulse },
  { key: "pension", label: "Pension", icon: Users },
  { key: "employment", label: "Employment", icon: Briefcase },
  { key: "housing", label: "Housing", icon: Building2 },
];

export default function Schemes() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [matchedSchemeIds, setMatchedSchemeIds] = useState<string[] | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [appliedSchemeIds, setAppliedSchemeIds] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("haq_user_id");
    if (!userId) return;
    fetch(`${API_BASE}/api/scheme-watch/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setHasProfile(!!data.hasProfile);
        setMatchedSchemeIds(data.matchedSchemeIds || []);
      })
      .catch(() => {
        // Non-critical — Apply buttons just fall back to routing through chat.
      });
  }, []);

  useEffect(() => {
    const load = () => setCount(getNotifications().length);
    load();
    window.addEventListener("haq-notifications-updated", load);
    return () => window.removeEventListener("haq-notifications-updated", load);
  }, []);

  const handleApply = async (scheme: Scheme) => {
    const userId = localStorage.getItem("haq_user_id");
    if (!userId) {
      alert("Please log in to apply for this scheme.");
      return;
    }
    setApplyingId(scheme.id);
    try {
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          schemeId: scheme.id,
          schemeName: scheme.name,
          requiredDocuments: scheme.documents,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit application");
      setAppliedSchemeIds((prev) => [...prev, scheme.id]);
    } catch (err) {
      alert("Something went wrong submitting your application. Please try again.");
    } finally {
      setApplyingId(null);
    }
  };

  const toggleSaved = (id: string) => {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const filtered = schemes.filter((s) => {
    const matchCat = activeCategory === "all" || s.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.nameHi.includes(q) || s.summary.toLowerCase().includes(q) || s.category.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-full" style={{ background: "#FAF7F2" }}>
      {/* Header — same nav pattern as homepage */}
      <header className="bg-[#0A542E] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/logo.jpg" alt="Haq Agent" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
            <div className="leading-none">
              <p className="font-semibold text-white text-sm sm:text-base">Haq Agent</p>
              <p className="text-sm text-white font-bold hidden sm:block">हर योजना, हर हकदार तक</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 text-sm text-white/90">
            <Link to="/" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5  hover:text-yellow-300 font-semibold ">
              <Home size={20} /> Home
            </Link>
            <Link to="/schemes" className="flex items-center gap-1.5 px-3 py-1.5 hover:text-yellow-300 font-semibold">
              <ListChecks size={20} /> Schemes
            </Link>
            <Link to="/agent" className="flex items-center gap-1.5 px-3 py-1.5 hover:text-yellow-300 font-semibold">
              <MessageCircle size={20} /> Chat Agent
            </Link>
            <Link to="/notifications" className="flex items-center gap-1.5 px-3 py-1.5 hover:text-yellow-300 font-semibold">
              <Bell size={15} /> Notifications
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-1 border border-white/30 rounded-full px-3 py-1 text-sm hover:bg-white/10 transition-colors">
              <Globe size={20} /> हिंदी
            </button>
            <Link to="/agent" className="bg-white font-bold text-sm px-5 py-2 rounded-full" style={{ color: "#0A542E" }}>
              Check My Eligibility
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-black">Government Schemes</h1>
            <p className="text-sm sm:text-base font-medium mt-1 text-black">
              सरकारी योजनाएं · Browse all schemes and check what you qualify for
            </p>
          </div>
          <div className="bg-[#F0FDF4] border border-[#0A542E]rounded-xl px-4 py-3 flex items-start gap-2.5 max-w-xs">
            <Sparkles size={18} className="text-[#0A542E] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-black">AI Recommendation</p>
              <p className="text-xs text-black">Based on your profile, you may qualify for <span className="font-bold text-[#0A542E]">5 schemes</span></p>
            </div>
            <ChevronRight size={16} className="text-black flex-shrink-0 mt-1" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schemes in English or हिन्दी..."
              className="w-full pl-10 pr-10 py-3 border-2 border-black/10 rounded-full text-sm text-black font-medium bg-white focus:outline-none focus:border-[#0A542E]"
            />
            <Mic size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-black" />
          </div>
          <button className="flex items-center gap-2 border-2 border-black/10 bg-white rounded-full px-4 py-3 text-sm font-semibold text-black whitespace-nowrap">
            Sort by: <span className="text-[#0A542E]">Popular</span> <ChevronDown size={14} />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          {filterPills.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="text-sm px-4 h-10 rounded-full border-2 font-semibold transition-colors flex items-center gap-1.5 leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A542E]/30"
              style={activeCategory === cat.key
                ? { background: "#0A542E", color: "white", borderColor: "#0A542E" }
                : { background: "white", color: "#0A542E", borderColor: "#0A542E30" }
              }
            >
              <cat.icon size={14} /> {cat.label}
            </button>
          ))}
        </div>

        <p className="text-sm font-bold text-black mb-4">
          Showing <span style={{ color: "#0A542E" }}>{filtered.length}</span> of {schemes.length} schemes
        </p>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-black">
              <Search size={36} className="mx-auto mb-3" style={{ color: "#0A542E" }} />
              <p className="text-base font-semibold">No schemes found. Try a different search or category.</p>
            </div>
          )}
          {filtered.map((s) => {
            const meta = categoryMeta[s.category];
            const Icon = meta.icon;
            const expanded = expandedId === s.id;
            const isSaved = saved.includes(s.id);
            return (
              <div key={s.id} className="bg-white border border-[#0A542E] rounded-2xl overflow-hidden transition-all hover:shadow-md relative">
                <button onClick={() => toggleSaved(s.id)} className="absolute top-4 right-4 text-black hover:text-[#0A542E] z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A542E]/30 rounded-full p-1 transition-colors">
                  <Bookmark size={18} fill={isSaved ? "#0A542E" : "none"} className={isSaved ? "text-[#0A542E]" : ""} />
                </button>

                <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.iconBg }}>
                      <Icon size={22} style={{ color: "#0A542E" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-black">{s.name}</p>
                      <p className="text-sm font-bold text-[#0A542E]">{s.nameHi}</p>
                      <p className="text-sm text-black mt-1">{s.summary}</p>
                      <p className="text-sm font-semibold text-[#0A542E]/80 mt-0.5">{s.summaryHi}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 pl-16 sm:pl-0">
                    <div className="w-28 flex-shrink-0">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap inline-block"
                        style={{ background: meta.badgeBg, color: meta.badgeText }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-sm text-black hidden md:block w-36 flex-shrink-0">
                      <p className="flex items-center gap-1 font-semibold text-black whitespace-nowrap"><IndianRupee size={12} />{s.amount}</p>
                      <p className="flex items-center gap-1 text-xs mt-0.5 whitespace-nowrap"><Calendar size={11} />{s.amountSub}</p>
                    </div>
                    {appliedSchemeIds.includes(s.id) ? (
                      <button
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        className="bg-black/10 text-black/40 text-sm font-bold px-5 py-2 rounded-full whitespace-nowrap w-28 text-center flex-shrink-0 cursor-default"
                      >
                        Applied ✓
                      </button>
                    ) : matchedSchemeIds && matchedSchemeIds.includes(s.id) ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApply(s); }}
                        disabled={applyingId === s.id}
                        className="bg-[#0A542E] hover:bg-[#083d21] text-white text-sm font-bold px-5 py-2 rounded-full whitespace-nowrap transition-colors w-28 text-center flex-shrink-0 disabled:opacity-60"
                      >
                        {applyingId === s.id ? "Applying..." : "Apply Now"}
                      </button>
                    ) : hasProfile && matchedSchemeIds ? (
                      <button
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        title="You don't currently qualify for this scheme based on your saved profile"
                        className="bg-black/10 text-black/40 text-sm font-bold px-5 py-2 rounded-full whitespace-nowrap w-28 text-center flex-shrink-0 cursor-not-allowed"
                      >
                        Not Eligible
                      </button>
                    ) : (
                      <Link
                        to="/agent"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0A542E] hover:bg-[#083d21] text-white text-sm font-bold px-5 py-2 rounded-full whitespace-nowrap transition-colors w-28 text-center flex-shrink-0"
                      >
                        Apply Now
                      </Link>
                    )}
                    <button onClick={() => setExpandedId(expanded ? null : s.id)} className="text-black hover:text-[#0A542E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A542E]/30 rounded-full p-1 transition-colors flex-shrink-0">
                      {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="px-4 sm:px-6 pb-5 border-t border-black/5 pt-4 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-black uppercase tracking-wide mb-2">Who qualifies</p>
                      <p className="text-sm font-medium text-black rounded-lg px-4 py-3 border" style={{ background: "#F0FDF4", borderColor: "#0A542E30" }}>
                        {s.eligibilitySnap}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <FileCheck2 size={13} className="text-[#0A542E]" /> Documents needed
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {s.documents.map((d) => (
                          <span key={d} className="text-xs font-semibold text-black rounded-full px-3 py-1.5 border border-black/10 bg-white">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      {appliedSchemeIds.includes(s.id) ? (
                        <button disabled className="flex-1 text-black/40 text-sm font-bold px-4 py-2.5 rounded-full text-center bg-black/10 cursor-default">
                          Application submitted ✓
                        </button>
                      ) : matchedSchemeIds && matchedSchemeIds.includes(s.id) ? (
                        <button
                          onClick={() => handleApply(s)}
                          disabled={applyingId === s.id}
                          className="flex-1 text-white text-sm font-bold px-4 py-2.5 rounded-full text-center transition-colors disabled:opacity-60"
                          style={{ background: "#0A542E" }}
                        >
                          {applyingId === s.id ? "Applying..." : "Apply Now"}
                        </button>
                      ) : hasProfile && matchedSchemeIds ? (
                        <button disabled title="You don't currently qualify for this scheme based on your saved profile" className="flex-1 text-black/40 text-sm font-bold px-4 py-2.5 rounded-full text-center bg-black/10 cursor-not-allowed">
                          Not Eligible Yet
                        </button>
                      ) : (
                        <Link to="/agent" className="flex-1 text-white text-sm font-bold px-4 py-2.5 rounded-full text-center transition-colors" style={{ background: "#0A542E" }}>
                          Check if I qualify
                        </Link>
                      )}
                      <a href={`https://${s.source}`} target="_blank" rel="noopener noreferrer"
                        className="flex-1 text-sm font-bold px-4 py-2.5 rounded-full text-center border-2 flex items-center justify-center gap-2 transition-colors"
                        style={{ borderColor: "#0A542E", color: "#0A542E" }}>
                        Official site <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <section className="mt-10">
          <p className="text-xl font-bold text-black mb-1">Explore More Opportunities</p>
          <p className="text-sm text-black mb-5">Official government portals for internships, jobs, and scholarships — always verify dates on the linked site.</p>

          {[
            { title: "Internships & Fellowships", items: exploreInternships },
            { title: "Government Jobs & Recruitment", items: exploreJobs },
            { title: "Scholarships & Skill Development", items: exploreScholarships },
            { title: "Utility & Other Portals", items: exploreUtility },
          ].map((group) => (
            <div key={group.title} className="mb-6">
              <p className="text-sm font-bold text-[#0A542E] mb-3">{group.title}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((item) => (
                  <a
                    key={item.name}
                    href={`https://${item.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-[#0A542E] rounded-xl p-4 hover:border-[#0A542E]/30 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-black">{item.name}</p>
                      <p className="text-xs text-black mt-0.5">{item.org}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {item.window ? (
                        <span className="text-xs font-semibold text-[#0A542E] bg-[#F0FDF4] rounded-full px-2.5 py-1">
                          Tentative: {item.window}
                        </span>
                      ) : <span />}
                      <span className="text-xs font-semibold text-[#0A542E] flex items-center gap-1">
                        Visit <ExternalLink size={12} />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="flex items-center justify-between bg-[#F0FDF4] border border-[#0A542E]/15 rounded-xl px-5 py-4 mt-6">
          <p className="text-sm font-semibold text-black">Never miss a scheme you're eligible for! <span className="text-black font-normal">Get instant SMS & Email alerts.</span></p>
          <Link to="/notifications" className="bg-[#ffda24] text-black text-sm font-bold px-4 py-2 rounded-full flex items-center gap-1.5 whitespace-nowrap">
            <Bell size={14} /> Enable Notifications
          </Link>
        </div>
      </main>

      <footer className="text-white text-sm font-medium text-center py-5 mt-8" style={{ background: "#0A542E" }}>
        Haq Agent · हर योजना, हर हकदार तक · Built for Bharat with Agentic AI
      </footer>
    </div>
  );
}
