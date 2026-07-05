import { useState } from "react";
import { Sprout, Search, GraduationCap, Wheat, HeartPulse, Coins, FileCheck2, IndianRupee, ExternalLink, Bell, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

type Scheme = {
  id: string; name: string; nameHi: string; category: string;
  summary: string; summaryHi: string; amount: string;
  documents: string[]; eligibilitySnap: string; source: string;
};

const schemes: Scheme[] = [
  { id: "pmkisan", name: "PM-KISAN", nameHi: "प्रधानमंत्री किसान सम्मान निधि", category: "agriculture", summary: "Income support of ₹6,000/year for landholding farmer families, paid in 3 installments via direct bank transfer.", summaryHi: "भूमिधारक किसान परिवारों को ₹6,000/वर्ष की आय सहायता, 3 किस्तों में सीधे बैंक में।", amount: "₹6,000/year", documents: ["Aadhaar card", "Land ownership record", "Bank passbook (Aadhaar-seeded)"], eligibilitySnap: "Landholding farmer · Not an income tax payer · Not a government employee", source: "pmkisan.gov.in" },
  { id: "nsap-ignoaps", name: "IGNOAPS (NSAP Pension)", nameHi: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन", category: "pension", summary: "Monthly pension for BPL senior citizens aged 60+. Higher amount after age 80.", summaryHi: "60+ आयु के BPL वरिष्ठ नागरिकों के लिए मासिक पेंशन। 80 के बाद अधिक राशि।", amount: "₹200–₹500/month", documents: ["Age proof", "BPL/income certificate", "Bank account", "Aadhaar card"], eligibilitySnap: "Age 60+ · Below Poverty Line (BPL) · Not covered under another pension", source: "nsap.nic.in" },
  { id: "pmjay", name: "Ayushman Bharat – PMJAY", nameHi: "आयुष्मान भारत – प्रधानमंत्री जन आरोग्य योजना", category: "health", summary: "Cashless health insurance of ₹5 lakh per family per year. All citizens 70+ qualify automatically.", summaryHi: "प्रति परिवार ₹5 लाख/वर्ष का कैशलेस स्वास्थ्य बीमा। 70+ आयु के सभी नागरिक स्वतः पात्र।", amount: "₹5,00,000/family/year", documents: ["Aadhaar card", "Ration card / Family ID", "Mobile number for OTP"], eligibilitySnap: "SECC-2011 listed family · OR aged 70+ (universal)", source: "pmjay.gov.in" },
  { id: "pragati-girls", name: "AICTE Pragati Scholarship", nameHi: "AICTE प्रगति छात्रवृत्ति (बालिकाओं के लिए)", category: "education", summary: "₹50,000/year for girl students in 1st year of AICTE-approved technical diploma or degree. Family income under ₹8 lakh/year.", summaryHi: "AICTE-अनुमोदित तकनीकी पाठ्यक्रम की प्रथम वर्ष की छात्राओं को ₹50,000/वर्ष।", amount: "₹50,000/year", documents: ["Class 10 & 12 marksheets", "Admission proof", "Income certificate", "Bank passbook", "Aadhaar card"], eligibilitySnap: "Female · 1st year technical diploma/degree · Family income < ₹8 lakh/year", source: "aicte-india.org" },
  { id: "pmfby", name: "PM Fasal Bima Yojana", nameHi: "प्रधानमंत्री फसल बीमा योजना", category: "agriculture", summary: "Crop insurance that compensates farmers for losses due to natural calamities, pests, or disease. Very low premium.", summaryHi: "प्राकृतिक आपदा, कीट या बीमारी से फसल नुकसान पर मुआवजा। बहुत कम प्रीमियम।", amount: "Compensation based on crop loss", documents: ["Aadhaar card", "Land record / Khasra", "Bank passbook", "Sowing certificate"], eligibilitySnap: "Farmer with notified crop · Enrolled before cutoff date", source: "pmfby.gov.in" },
  { id: "pmcareschildren", name: "PM CARES for Children", nameHi: "पीएम केयर्स फॉर चिल्ड्रन", category: "education", summary: "Support for children who lost parents to COVID-19. Monthly stipend, PMJAY health cover, education support up to age 23.", summaryHi: "COVID-19 में माता-पिता खोने वाले बच्चों के लिए मासिक वजीफा, स्वास्थ्य कवर और शिक्षा सहायता।", amount: "₹4,000/month + education + health", documents: ["Death certificate of parent(s)", "Birth certificate", "Aadhaar card", "Bank account"], eligibilitySnap: "Child below 18 · Lost parent(s) to COVID-19", source: "pmcaresforchildren.in" },
  { id: "niti-internship", name: "NITI Aayog Internship", nameHi: "नीति आयोग इंटर्नशिप", category: "education", summary: "Paid internship at NITI Aayog for UG, PG or PhD students. New cycle opens in the first 10 days of every month.", summaryHi: "UG, PG या PhD छात्रों के लिए नीति आयोग में पेड इंटर्नशिप। हर महीने के पहले 10 दिनों में आवेदन।", amount: "₹10,000/month stipend", documents: ["College ID / enrollment proof", "Resume / CV", "NOC from institution"], eligibilitySnap: "UG (3rd year+) / PG / PhD student · Any stream", source: "niti.gov.in" },
];

const categoryMeta: Record<string, { label: string; icon: React.ElementType }> = {
  agriculture: { label: "Agriculture", icon: Wheat },
  pension: { label: "Pension", icon: Coins },
  health: { label: "Health", icon: HeartPulse },
  education: { label: "Education", icon: GraduationCap },
};

export default function Schemes() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = schemes.filter((s) => {
    const matchCat = activeCategory === "all" || s.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.nameHi.includes(q) || s.summary.toLowerCase().includes(q) || s.category.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-full bg-white">
      <header style={{ background: "#0A542E" }} className="text-white sticky top-0 z-50 shadow-lg">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
          <img src="/images/ logo.jpg" alt="Haq Agent" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
            <div className="leading-tight">
              <p className="font-bold text-white text-xl sm:text-2xl">Haq Agent</p>
              <p className="text-base text-white/80 hidden sm:block"> हर योजना, हर हकदार तक </p>
            </div>
          </a>
          <nav className="hidden sm:flex items-center gap-8 text-base font-medium text-white">
            <a href="/" className="hover:text-yellow-300">Home</a>
            <a href="/schemes" className="font-medium border-b-2 border-yellow-300 pb-0.5" style={{ color: "#ffda24" }}>Schemes</a>
            <a href="/agent" className="hover:text-yellow-300 flex items-center gap-1"><MessageCircle size={16} />Chat Agent</a>
            
            <a href="/notifications" className="hover:text-yellow-300 flex items-center gap-1"><Bell size={16} /> Notifications</a>
          </nav>
          <a href="/agent" className="bg-white font-bold text-sm px-5 py-2 rounded-full" style={{ color: "#0A542E" }}>Check My Eligibility</a>
        </div>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-black">Government Schemes</h1>
          <p className="text-base font-medium mt-1" style={{ color: "#0A542E" }}>
            सरकारी योजनाएं · Browse all schemes and check what you qualify for
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#0A542E" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schemes in English or हिन्दी..."
              className="w-full pl-10 pr-4 py-3 border-2 rounded-full text-base text-black font-medium bg-white focus:outline-none"
              style={{ borderColor: "#0A542E" }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "education", "agriculture", "health", "pension"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="text-sm sm:text-base px-4 py-2.5 rounded-full border-2 font-semibold transition-colors capitalize"
                style={activeCategory === cat
                  ? { background: "#0A542E", color: "white", borderColor: "#0A542E" }
                  : { background: "white", color: "#0A542E", borderColor: "#0A542E" }
                }
              >
                {cat === "all" ? "All Schemes" : cat}
              </button>
            ))}
          </div>
        </div>

        <p className="text-base font-bold text-black mb-4">
          Showing <span style={{ color: "#ffda24" }}>{filtered.length}</span> of {schemes.length} schemes
        </p>

        <div className="space-y-4">
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
            return (
              <div key={s.id} className="bg-white border-2 rounded-2xl overflow-hidden transition-all hover:shadow-md"
                style={{ borderColor: expanded ? "#0A542E" : "#e5e7eb" }}>
                <button className="w-full text-left px-4 sm:px-6 py-4 flex items-start gap-4"
                  onClick={() => setExpandedId(expanded ? null : s.id)}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#0A542E" }}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-black">{s.name}</p>
                        <p className="text-base sm:text-xl font-bold" style={{ color: "#0A542E" }}>{s.nameHi}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm sm:text-base font-bold px-3 py-1 rounded-full hidden sm:block text-black capitalize" style={{ background: "#ffda24" }}>
                          {meta.label}
                        </span>
                        {expanded
                          ? <ChevronUp size={20} style={{ color: "#0A542E" }} />
                          : <ChevronDown size={20} className="text-black" />}
                      </div>
                    </div>
                    <p className="text-xl sm:text-xl text-black mt-2">{s.summary}</p>
                    <p className="text-xl sm:text-xl" style={{ color: "#0A542E" }}>{s.summaryHi}</p>
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 sm:px-6 pb-5 border-t-2 pt-4 space-y-4" style={{ borderColor: "#0A542E20" }}>
                    <div className="flex items-center gap-2">
                      <IndianRupee size={20} style={{ color: "#ffda24" }} />
                      <span className="text-base font-bold text-black">{s.amount}</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-black uppercase tracking-wide mb-2">Who qualifies</p>
                      <p className="text-base font-semibold text-black rounded-lg px-4 py-3 border-2" style={{ background: "#F0FDF4", borderColor: "#0A542E40" }}>
                        {s.eligibilitySnap}
                      </p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-black uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <FileCheck2 size={15} style={{ color: "#ffda24" }} /> Documents needed
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {s.documents.map((d) => (
                          <span key={d} className="text-base font-bold text-black rounded-full px-3 py-1.5 border-2" style={{ borderColor: "#0A542E", background: "white" }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <a href="/agent" className="flex-1 text-white text-base font-bold px-4 py-3 rounded-full text-center transition-colors" style={{ background: "#0A542E" }}>
                        Check if I qualify
                      </a>
                      <a href={`https://${s.source}`} target="_blank" rel="noopener noreferrer"
                        className="flex-1 text-base font-bold px-4 py-3 rounded-full text-center border-2 flex items-center justify-center gap-2 transition-colors"
                        style={{ borderColor: "#0A542E", color: "#0A542E" }}>
                        Official site <ExternalLink size={15} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <footer className="text-white text-base font-medium text-center py-5 mt-8" style={{ background: "#0A542E" }}>
        Haq · हर योजना, हर हकदार तक ·  Built for Bharat with Agentic AI
      </footer>
    </div>
  );
}
