import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Wheat, Coins, Briefcase, Mic } from "lucide-react";

type Slide = {
  image: string;
  badge: string;
  icon: React.ElementType;
  headline: string;
  sub: string;
};

const slides: Slide[] = [
  {
    image: "/images/edu.jpg",
    badge: "scholarship season",
    icon: GraduationCap,
    headline: "Pragati scholarship is open.",
    sub: "Girls in diploma or degree courses can check eligibility in 30 seconds.",
  },
  {
    image: "/images/farm.jpg",
    badge: "farmer alert",
    icon: Wheat,
    headline: "PM-KISAN installment due.",
    sub: "The agent checks your land record automatically.",
  },
  {
    image: "/images/health.jpg",
    badge: "health camp nearby",
    icon: Briefcase,
    headline: "Free health camp this week.",
    sub: "Ayushman Bharat coverage check takes under a minute.",
  },
  {
    image: "/images/pension.jpg",
    badge: "pension review",
    icon: Coins,
    headline: "Pension review month.",
    sub: "NSAP beneficiaries should confirm details before this cycle closes.",
  },
];

const SLIDE_DURATION = 4500;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [index, paused]);

  const slide = slides[index];
  const Icon = slide.icon;

  return (
    <div
      className="relative overflow-hidden rounded-3xl h-[420px] sm:h-[480px] cursor-pointer select-none"
      onClick={() => setPaused((p) => !p)}
      role="region"
      aria-label="Live scheme alerts, tap to pause"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col justify-end px-5 sm:px-10 pb-7 sm:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 mb-4 border border-white/20">
              <Icon size={14} />
              {slide.badge}
            </span>

            <h1 className="text-2xl sm:text-4xl font-medium leading-snug mb-2 text-white max-w-md">
              {slide.headline}
            </h1>
            <p className="text-sm sm:text-base text-white/80 mb-5 max-w-sm">{slide.sub}</p>

            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); window.location.href = "/agent"; }}
                className="flex-1 sm:flex-none sm:px-8 bg-white text-gray-900 rounded-lg py-2.5 text-sm sm:text-base font-medium hover:bg-gray-100 transition-colors"
              >
                Talk to the agent
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); window.location.href = "/voice"; }}
                className="px-3 border border-white/30 text-white rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Use voice"
              >
                <Mic size={24} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-6">
          {slides.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden">
              {i === index && !paused && (
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                />
              )}
              {i === index && paused && <div className="h-full w-1/2 bg-white" />}
              {i < index && <div className="h-full w-full bg-white" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}