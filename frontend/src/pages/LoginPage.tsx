import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, Phone, ShieldCheck, ArrowRight, RotateCw, Home, Loader2,
  User, Lock, Eye, EyeOff, Smartphone, ShieldCheck as ShieldIcon,
  Heart, Globe2,
} from "lucide-react";

const API_BASE = "http://localhost:4000";

type AuthMode = "login" | "signup";
type Step = "form" | "otp" | "success";

export default function LoginPage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<Step>("form");
  const [useOtp, setUseOtp] = useState(false);

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const handleGoogleClick = () => {
    setError("Google login is coming soon — please use email or mobile for now.");
  };

  const handleSendOtp = async () => {
    setError("");
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address to receive the code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send code");
      setStep("otp");
      setResendIn(60);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid or expired code");
      setStep("success");
      setTimeout(() => navigate("/"), 1500);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!fullName || !mobile || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreedTerms) {
      setError("Please agree to the Terms & Conditions to continue");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, mobile, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create account");
      setStep("success");
      setTimeout(() => navigate("/"), 1500);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginPassword = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid email or password");
      setStep("success");
      setTimeout(() => navigate("/"), 1500);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const featureList = [
    { icon: ShieldIcon, en: "Sahi Yojana, Sahi Samay Par" },
    { icon: Smartphone, en: "Automatic SMS & Email Alerts" },
    { icon: Globe2, en: "Hindi + English Voice Support" },
    { icon: Heart, en: "Secure & Trusted" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#FAF7F2" }}>
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-10 text-white"
        style={{ background: "linear-gradient(160deg, #0A542E 0%, #073d21 100%)" }}
      >
        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <img src="/images/logo.jpg" alt="Haq Agent" className="w-11 h-11 rounded-full object-cover border-2 border-white/40" />
          <div className="leading-tight">
            <p className="font-bold text-white text-lg">Haq Agent</p>
            <p className="text-xs text-white/80">Sarkari Yojana Aap Ke Dwaar</p>
          </div>
        </Link>

        {authMode === "signup" ? (
          /* Photo collage for signup */
          <div className="relative z-10 flex-1 flex items-center justify-center py-6">
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <img src="/images/farm.jpg" alt="" className="rounded-2xl object-cover h-40 w-full col-span-2 border-2 border-white/20" />
              <img src="/images/edu.jpg" alt="" className="rounded-2xl object-cover h-32 w-full border-2 border-white/20" />
              <img src="/images/health.jpg" alt="" className="rounded-2xl object-cover h-32 w-full border-2 border-white/20" />
            </div>
          </div>
        ) : (
          /* Headline + feature list for login */
          <div className="relative z-10 flex-1 flex flex-col justify-center space-y-6">
            <img src="/images/farm.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 -z-10 rounded-2xl" />
            <h1 className="text-4xl font-bold leading-snug">
              Har Yojana,<br />Har Haqdaar<br /><span style={{ color: "#ffda24" }}>Tak</span>
            </h1>
            <p className="text-white/85 text-base leading-relaxed max-w-xs">
              AI Agent jo aapke liye sahi yojana dhoondta hai, notify karta hai aur madad karta hai.
            </p>
            <div className="space-y-3 pt-2">
              {featureList.map((f) => (
                <div key={f.en} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <f.icon size={16} />
                  </div>
                  <p className="text-sm font-medium text-white/90">{f.en}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="relative z-10 text-xs text-white/50">
          Trusted by thousands of citizens across Bharat
        </p>
      </div>

      {/* RIGHT PANEL — FORM */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-10 relative overflow-hidden">
        {/* subtle background image on mobile / narrow screens */}
        <div
          className="lg:hidden absolute inset-0 bg-cover bg-center blur-sm scale-110"
          style={{ backgroundImage: "url('/images/farm.jpg')" }}
        />
        <div className="lg:hidden absolute inset-0 bg-black/50" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile-only header */}
          <Link to="/" className="lg:hidden flex flex-col items-center gap-2 mb-6 text-center">
            <img src="/images/logo.jpg" alt="Haq Agent" className="w-16 h-16 rounded-full object-cover border-2 border-white/50" />
            <p className="font-bold text-xl text-white">Haq Agent</p>
          </Link>

          <div className="bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden">
            {step === "form" && (
              <div className="px-7 sm:px-9 py-8">
                {/* Logo (desktop, inside card top) */}
                <div className="hidden lg:flex flex-col items-center mb-6">
                  <img src="/images/logo.jpg" alt="Haq Agent" className="w-14 h-14 rounded-full object-cover mb-2" />
                  <p className="font-bold text-lg" style={{ color: "#0A542E" }}>
                    Haq <span className="text-black">Agent</span>
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-center text-black">
                  {authMode === "signup" ? "Create Your Account" : "Welcome Back!"}
                </h2>
                <p className="text-sm text-black/60 text-center mt-1.5 mb-6">
                  {authMode === "signup"
                    ? "Join Haq Agent and get the right government schemes on time"
                    : "Login to continue your journey"}
                </p>

                {!useOtp ? (
                  <div className="space-y-4">
                    {authMode === "signup" && (
                      <div>
                        <label className="text-sm font-semibold text-black/70 mb-1.5 block">Full Name</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                          <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2.5 text-base"
                          />
                        </div>
                      </div>
                    )}

                    {authMode === "signup" && (
                      <div>
                        <label className="text-sm font-semibold text-black/70 mb-1.5 block">Mobile Number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                          <input
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="Enter your mobile number"
                            maxLength={10}
                            className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2.5 text-base"
                          />
                        </div>
                      </div>
                    )}

                    {authMode === "login" && (
                      <div>
                        <label className="text-sm font-semibold text-black/70 mb-1.5 block">Mobile Number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                          <input
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="Enter your mobile number"
                            maxLength={10}
                            className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2.5 text-base"
                          />
                        </div>
                        <p className="text-xs text-black/40 mt-1">Or use email below to log in</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-semibold text-black/70 mb-1.5 block">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2.5 text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-black/70 mb-1.5 block">Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={authMode === "signup" ? "Create a password" : "Enter your password"}
                          className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-10 py-2.5 text-base"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {authMode === "signup" && (
                      <div>
                        <label className="text-sm font-semibold text-black/70 mb-1.5 block">Confirm Password</label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2.5 text-base"
                          />
                        </div>
                      </div>
                    )}

                    {authMode === "signup" ? (
                      <label className="flex items-start gap-2 text-sm text-black/70 pt-1">
                        <input
                          type="checkbox"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="mt-0.5 accent-[#0A542E]"
                        />
                        I agree to the <a href="#" className="text-[#0A542E] font-semibold">Terms & Conditions</a> and <a href="#" className="text-[#0A542E] font-semibold">Privacy Policy</a>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between text-sm pt-1">
                        <label className="flex items-center gap-2 text-black/70">
                          <input type="checkbox" defaultChecked className="accent-[#0A542E]" />
                          Remember me
                        </label>
                        <a href="#" className="text-[#0A542E] font-semibold">Forgot Password?</a>
                      </div>
                    )}

                    {error && <p className="text-sm font-medium text-red-600">{error}</p>}

                    <button
                      onClick={authMode === "signup" ? handleRegister : handleLoginPassword}
                      disabled={loading}
                      className="w-full bg-[#0A542E] hover:bg-[#083d21] disabled:opacity-60 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : authMode === "signup" ? "Register" : "Login"}
                    </button>

                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-black/10" />
                      <span className="text-xs text-black/40">or continue with</span>
                      <div className="flex-1 h-px bg-black/10" />
                    </div>

                    <button
                      onClick={handleGoogleClick}
                      className="w-full border-2 border-black/10 hover:bg-black/5 text-black font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l6-6C33.9 6.5 29.2 4.5 24 4.5 12.9 4.5 4 13.4 4 24.5s8.9 20 20 20c11 0 19.5-8 19.5-19.5 0-1.4-.1-2.7-.4-4.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13.5 24 13.5c2.8 0 5.3 1 7.3 2.7l6-6C33.9 6.5 29.2 4.5 24 4.5c-7.8 0-14.5 4.4-17.7 10.2z"/><path fill="#4CAF50" d="M24 44.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.4 40 16.1 44.5 24 44.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.5 36.6 44 30.9 44 24.5c0-1.4-.1-2.7-.4-4z"/></svg>
                      Continue with Google
                    </button>

                    <button
                      onClick={() => { setUseOtp(true); setError(""); }}
                      className="w-full border-2 border-black/10 hover:bg-black/5 text-black font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Smartphone size={16} />
                      Continue with OTP
                    </button>
                  </div>
                ) : (
                  /* OTP entry sub-flow via email */
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-black/70 mb-1.5 block">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email to receive a code"
                          className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2.5 text-base"
                        />
                      </div>
                    </div>
                    {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full bg-[#0A542E] hover:bg-[#083d21] disabled:opacity-60 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send code <ArrowRight size={16} /></>}
                    </button>
                    <button onClick={() => { setUseOtp(false); setError(""); }} className="w-full text-sm text-black/50">
                      Back to password login
                    </button>
                  </div>
                )}

                <p className="text-center text-sm text-black/60 mt-6">
                  {authMode === "signup" ? "Already have an account?" : "New here?"}{" "}
                  <button
                    onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setError(""); setUseOtp(false); }}
                    className="text-[#0A542E] font-bold"
                  >
                    {authMode === "signup" ? "Login" : "Sign Up"}
                  </button>
                </p>
              </div>
            )}

            {step === "otp" && (
              <div className="px-7 sm:px-9 py-8">
                <div className="text-center mb-6">
                  <ShieldCheck size={32} className="mx-auto mb-2" style={{ color: "#0A542E" }} />
                  <h2 className="text-xl font-bold text-black">Enter verification code</h2>
                  <p className="text-sm text-black/60 mt-1">
                    Sent to <span className="font-semibold text-black">{email}</span>
                  </p>
                </div>
                <div className="flex justify-between gap-2 mb-5">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      maxLength={1}
                      inputMode="numeric"
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-black/15 focus:border-[#0A542E] outline-none rounded-lg"
                    />
                  ))}
                </div>
                {error && <p className="text-sm font-medium text-red-600 mb-3">{error}</p>}
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full bg-[#0A542E] hover:bg-[#083d21] disabled:opacity-60 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mb-3"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify & continue"}
                </button>
                <button
                  onClick={handleSendOtp}
                  disabled={resendIn > 0}
                  className="w-full text-sm font-semibold text-[#0A542E] disabled:text-black/30 flex items-center justify-center gap-1.5"
                >
                  <RotateCw size={14} />
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                </button>
              </div>
            )}

            {step === "success" && (
              <div className="px-8 py-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mb-4" style={{ borderColor: "#0A542E" }}>
                  <ShieldCheck size={36} style={{ color: "#0A542E" }} />
                </div>
                <p className="font-bold text-lg text-black">You're verified</p>
                <p className="text-sm text-black/60 mt-1">Taking you to Haq Agent…</p>
              </div>
            )}
          </div>

          {/* Trust badges strip */}
          <div className="hidden lg:flex justify-center gap-6 mt-6">
            {[
              { icon: ShieldIcon, label: "AI Powered" },
              { icon: Lock, label: "Secure" },
              { icon: Globe2, label: "Hindi + English" },
              { icon: Heart, label: "Built for Bharat" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1.5 text-black/50 text-xs font-medium">
                <b.icon size={14} />
                {b.label}
              </div>
            ))}
          </div>

          <Link to="/" className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-black/50 hover:text-[#0A542E] lg:text-black/50">
            <Home size={14} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
