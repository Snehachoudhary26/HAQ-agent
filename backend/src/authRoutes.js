const express = require("express");
const router = express.Router();
const { supabaseAuth, supabaseAdmin } = require("./supabaseClient");

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendSms(mobile, code) {
  if (!FAST2SMS_API_KEY) {
    throw new Error("FAST2SMS_API_KEY is not set in .env");
  }
  const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: FAST2SMS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "q",
      message: `Your Haq Agent verification code is ${code}. Valid for 5 minutes.`,
      language: "english",
      flash: 0,
      numbers: mobile,
    }),
  });
  const data = await res.json();
  if (!data.return) {
    throw new Error(data.message ? data.message.join(", ") : "Fast2SMS failed to send");
  }
  return data;
}

router.post("/send-mobile-otp", async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ error: "Valid 10-digit Indian mobile number is required" });
  }
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const { error: dbError } = await supabaseAdmin.from("otps").insert({
    identifier: mobile,
    channel: "sms",
    code,
    expires_at: expiresAt,
  });
  if (dbError) {
    console.error("send-mobile-otp db error:", dbError.message);
    return res.status(500).json({ error: "Could not create OTP record" });
  }
  try {
    await sendSms(mobile, code);
  } catch (smsError) {
    console.error("send-mobile-otp sms error:", smsError.message);
    return res.status(502).json({ error: "Could not send SMS: " + smsError.message });
  }
  res.json({ message: "OTP sent to mobile" });
});

router.post("/verify-mobile-otp", async (req, res) => {
  const { mobile, code } = req.body;
  if (!mobile || !code) {
    return res.status(400).json({ error: "mobile and code are required" });
  }
  const { data: rows, error } = await supabaseAdmin
    .from("otps")
    .select("*")
    .eq("identifier", mobile)
    .eq("channel", "sms")
    .eq("verified", false)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) {
    console.error("verify-mobile-otp db error:", error.message);
    return res.status(500).json({ error: "Could not verify OTP" });
  }
  const record = rows && rows[0];
  if (!record) {
    return res.status(400).json({ error: "No pending OTP found for this number" });
  }
  if (new Date(record.expires_at) < new Date()) {
    return res.status(400).json({ error: "Code expired, please request a new one" });
  }
  if (record.code !== code) {
    return res.status(400).json({ error: "Incorrect code" });
  }
  await supabaseAdmin.from("otps").update({ verified: true }).eq("id", record.id);
  res.json({ message: "Mobile verified", mobile });
});

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const { data, error } = await supabaseAuth.auth.signInWithOtp({ email });
  if (error) {
    console.error("send-otp error:", error.message);
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: "OTP sent to email", data });
});

router.post("/verify-otp", async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    return res.status(400).json({ error: "Email and OTP token are required" });
  }
  const { data, error } = await supabaseAuth.auth.verifyOtp({ email, token, type: "email" });
  if (error) {
    console.error("verify-otp error:", error.message);
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: "Login successful", session: data.session, user: data.user });
});

router.post("/register", async (req, res) => {
  const { fullName, mobile, email, password } = req.body;
  if (!fullName || !mobile || !email || !password) {
    return res.status(400).json({ error: "fullName, mobile, email, and password are all required" });
  }
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, mobile_number: mobile },
  });
  if (error) {
    console.error("register error FULL:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return res.status(400).json({ error: error.message || "Unknown error", details: error });
  }
  res.json({ message: "Account created", user: data.user });
});

router.post("/login-password", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("login-password error:", error.message);
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: "Login successful", session: data.session, user: data.user });
});

module.exports = router;
