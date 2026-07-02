import { GraduationCap, Wheat, HeartPulse, Coins } from "lucide-react";

const categories = [
  { icon: GraduationCap, label: "Education", desc: "Scholarships, internships", color: "text-brand-blue" },
  { icon: Wheat, label: "Agriculture", desc: "Subsidies, crop insurance", color: "text-brand-green" },
  { icon: HeartPulse, label: "Health", desc: "Insurance, treatment aid", color: "text-brand-coral" },
  { icon: Coins, label: "Pension", desc: "Welfare, old-age support", color: "text-brand-amber" },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {categories.map(({ icon: Icon, label, desc, color }) => (
        <button
          key={label}
          className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors"
        >
          <Icon size={20} className={color} />
          <p className="text-sm font-medium mt-2">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </button>
      ))}
    </div>
  );
}
