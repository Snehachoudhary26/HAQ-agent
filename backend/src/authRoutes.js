const express = require("express");
const router = express.Router();
const supabase = require("./supabaseClient");

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const { data, error } = await supabase.auth.signInWithOtp({ email });
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
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, mobile_number: mobile } },
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
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("login-password error:", error.message);
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: "Login successful", session: data.session, user: data.user });
});

module.exports = router;
