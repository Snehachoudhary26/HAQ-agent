export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/images/ logo.jpg"
        alt="Haq Agent"
        style={{ width: size, height: size }}
        className="rounded-full object-cover border-2 border-[#0A542E]/20"
      />
      <div className="leading-none">
        <p className="font-bold text-black text-sm sm:text-base">Haq Agent</p>
        <p className="text-sm font-semibold" style={{ color: "#0A542E" }}>हर योजना, हर हकदार तक</p>
      </div>
    </div>
  );
}
