import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, Phone, ShieldCheck, ArrowRight, RotateCw, Loader2,
  User, Lock, Eye, EyeOff, Smartphone, ShieldCheck as ShieldIcon,
  Heart, Globe2,
} from "lucide-react";
import { useFirebasePhoneAuth } from "../hooks/useFirebasePhoneAuth";

const API_BASE = "http://localhost:4000";

type AuthMode = "login" | "signup";
type Step = "form" | "otp" | "success";
type OtpChannel = "email" | "mobile";

export default function LoginPage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<Step>("form");
  const [useOtp, setUseOtp] = useState(false);
  const [otpChannel, setOtpChannel] = useState<OtpChannel>("mobile");

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

  // Firebase phone-OTP (test numbers on Spark plan, real numbers once Blaze is enabled)
  const firebasePhone = useFirebasePhoneAuth();

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const handleGoogleClick = () => {
    setError("Google login is coming soon — please use email or mobile for now.");
  };

  // ---- Email OTP (existing Supabase Auth flow) ----
  const handleSendEmailOtp = async () => {
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
      setOtpChannel("email");
      setStep("otp");
      setResendIn(60);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
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
      localStorage.setItem("haq_user_id", data.user.id);
      window.dispatchEvent(new Event("haq-auth-changed"));
      setStep("success");
      setTimeout(() => navigate("/"), 1500);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Mobile OTP (Firebase phone auth) ----
  const handleSendMobileOtp = async () => {
    setError("");
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    const ok = await firebasePhone.sendOtp(mobile, "recaptcha-container");
    if (ok) {
      setOtpChannel("mobile");
      setStep("otp");
      setResendIn(60);
    } else if (firebasePhone.error) {
      setError(firebasePhone.error);
    }
  };

  const handleVerifyMobileOtp = async () => {
    setError("");
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    const user = await firebasePhone.verifyOtp(code);
    if (user) {
      setStep("success");
      setTimeout(() => navigate("/"), 1500);
    } else if (firebasePhone.error) {
      setError(firebasePhone.error);
    }
  };

  const handleSendOtp = () => {
    if (otpChannel === "mobile") return handleSendMobileOtp();
    return handleSendEmailOtp();
  };

  const handleVerifyOtp = () => {
    if (otpChannel === "mobile") return handleVerifyMobileOtp();
    return handleVerifyEmailOtp();
  };

  const otpBusy = loading || firebasePhone.loading;

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
      localStorage.setItem("haq_user_id", data.user.id);
      window.dispatchEvent(new Event("haq-auth-changed"));
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
      localStorage.setItem("haq_user_id", data.user.id);
      window.dispatchEvent(new Event("haq-auth-changed"));
      setStep("success");
      setTimeout(() => navigate("/"), 1500);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center px-4 py-3 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0A542E 0%, #073d21 100%)" }}
    >
      {/* Required by Firebase phone auth — invisible, do not remove */}
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-md max-h-full overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden">
          {step === "form" && (
            <div className="px-6 sm:px-8 py-5">
              <div className="flex flex-col items-center mb-3">
                <img src="/images/logo.jpg" alt="Haq Agent" className="w-10 h-10 rounded-full object-cover mb-1" />
                <p className="font-bold text-base" style={{ color: "#0A542E" }}>
                  Haq <span className="text-black">Agent</span>
                </p>
              </div>

              <h2 className="text-xl font-bold text-center text-black">
                {authMode === "signup" ? "Create Your Account" : "Welcome Back!"}
              </h2>
              <p className="text-xs text-black/60 text-center mt-1 mb-4">
                {authMode === "signup"
                  ? "Join Haq Agent and get the right government schemes on time"
                  : "Login to continue your journey"}
              </p>

              {!useOtp ? (
                <div className="space-y-2.5">
                  {authMode === "signup" && (
                    <div>
                      <label className="text-sm font-semibold text-black/70 mb-1 block">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2 text-base"
                        />
                      </div>
                    </div>
                  )}

                  {(authMode === "signup" || authMode === "login") && (
                    <div>
                      <label className="text-sm font-semibold text-black/70 mb-1 block">Mobile Number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                        <input
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="Enter your mobile number"
                          maxLength={10}
                          className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2 text-base"
                        />
                      </div>
                      {authMode === "login" && (
                        <p className="text-xs text-black/40 mt-1">Or use email below to log in</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-black/70 mb-1 block">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2 text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-black/70 mb-1 block">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={authMode === "signup" ? "Create a password" : "Enter your password"}
                        className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-10 py-2 text-base"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {authMode === "signup" && (
                    <div>
                      <label className="text-sm font-semibold text-black/70 mb-1 block">Confirm Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2 text-base"
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
                    className="w-full bg-[#0A542E] hover:bg-[#083d21] disabled:opacity-60 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : authMode === "signup" ? "Register" : "Login"}
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-black/10" />
                    <span className="text-xs text-black/40">or continue with</span>
                    <div className="flex-1 h-px bg-black/10" />
                  </div>

                  <button
                    onClick={handleGoogleClick}
                    className="w-full border-2 border-black/10 hover:bg-black/5 text-black font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l6-6C33.9 6.5 29.2 4.5 24 4.5 12.9 4.5 4 13.4 4 24.5s8.9 20 20 20c11 0 19.5-8 19.5-19.5 0-1.4-.1-2.7-.4-4.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13.5 24 13.5c2.8 0 5.3 1 7.3 2.7l6-6C33.9 6.5 29.2 4.5 24 4.5c-7.8 0-14.5 4.4-17.7 10.2z"/><path fill="#4CAF50" d="M24 44.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.4 40 16.1 44.5 24 44.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.5 36.6 44 30.9 44 24.5c0-1.4-.1-2.7-.4-4z"/></svg>
                    Continue with Google
                  </button>

                  <button
                    onClick={() => { setUseOtp(true); setOtpChannel("mobile"); setError(""); }}
                    className="w-full border-2 border-black/10 hover:bg-black/5 text-black font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <Smartphone size={16} />
                    Continue with OTP
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Channel toggle: mobile vs email OTP */}
                  <div className="flex bg-black/5 rounded-lg p-1">
                    <button
                      onClick={() => { setOtpChannel("mobile"); setError(""); }}
                      className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                        otpChannel === "mobile" ? "bg-white shadow-sm text-[#0A542E]" : "text-black/50"
                      }`}
                    >
                      Mobile
                    </button>
                    <button
                      onClick={() => { setOtpChannel("email"); setError(""); }}
                      className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                        otpChannel === "email" ? "bg-white shadow-sm text-[#0A542E]" : "text-black/50"
                      }`}
                    >
                      Email
                    </button>
                  </div>

                  {otpChannel === "mobile" ? (
                    <div>
                      <label className="text-sm font-semibold text-black/70 mb-1 block">Mobile Number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                        <input
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2 text-base"
                        />
                      </div>
                      <p className="text-xs text-black/40 mt-1">
                        Demo mode: use test number 9876543210
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-semibold text-black/70 mb-1 block">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email to receive a code"
                          className="w-full border-2 border-black/10 focus:border-[#0A542E] outline-none rounded-lg pl-9 pr-4 py-2 text-base"
                        />
                      </div>
                    </div>
                  )}

                  {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                  <button
                    onClick={handleSendOtp}
                    disabled={otpBusy}
                    className="w-full bg-[#0A542E] hover:bg-[#083d21] disabled:opacity-60 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {otpBusy ? <Loader2 size={18} className="animate-spin" /> : <>Send code <ArrowRight size={16} /></>}
                  </button>
                  <button onClick={() => { setUseOtp(false); setError(""); }} className="w-full text-sm text-black/50">
                    Back to password login
                  </button>
                </div>
              )}

              <p className="text-center text-sm text-black/60 mt-4">
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
                  Sent to <span className="font-semibold text-black">
                    {otpChannel === "mobile" ? mobile : email}
                  </span>
                  {otpChannel === "mobile" && (
                    <span className="block text-xs text-black/40 mt-0.5">
                      Demo mode — use test code 123456 for number 9876543210
                    </span>
                  )}
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
                disabled={otpBusy}
                className="w-full bg-[#0A542E] hover:bg-[#083d21] disabled:opacity-60 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors mb-3"
              >
                {otpBusy ? <Loader2 size={18} className="animate-spin" /> : "Verify & continue"}
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

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-3">
          {[
            { icon: ShieldIcon, label: "AI Powered" },
            { icon: Lock, label: "Secure" },
            { icon: Globe2, label: "Hindi + English" },
            { icon: Heart, label: "Built for Bharat" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
              <b.icon size={14} />
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
