const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("./supabaseClient");
const { checkEligibility, schemes } = require("./eligibility");

router.post("/scheme-watch", async (req, res) => {
  const { userId, email, profile } = req.body;
  if (!userId || !email || !profile) {
    return res.status(400).json({ error: "userId, email, and profile are required" });
  }

  const currentMatches = checkEligibility(profile).map((m) => m.schemeId);

  const { data, error } = await supabaseAdmin
    .from("user_scheme_watches")
    .upsert(
      {
        user_id: userId,
        email,
        profile,
        notified_scheme_ids: currentMatches,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("scheme-watch save error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ watch: data });
});

// Returns a user's saved profile + which schemes they currently match.
// Used by the Schemes page to enable "Apply Now" only for schemes they qualify for.
router.get("/scheme-watch/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data: watch, error } = await supabaseAdmin
    .from("user_scheme_watches")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("scheme-watch fetch error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  if (!watch) {
    return res.json({ hasProfile: false, matchedSchemeIds: [] });
  }

  const matches = checkEligibility(watch.profile);
  res.json({
    hasProfile: true,
    profile: watch.profile,
    matchedSchemeIds: matches.map((m) => m.schemeId),
    matches,
  });
});

router.get("/cron/check-scheme-matches", async (req, res) => {
  const secret = req.headers.authorization?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data: watches, error } = await supabaseAdmin
    .from("user_scheme_watches")
    .select("*");

  if (error) {
    console.error("cron fetch watches error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  let emailsSent = 0;
  const results = [];

  for (const watch of watches || []) {
    const currentMatches = checkEligibility(watch.profile);
    const currentIds = currentMatches.map((m) => m.schemeId);
    const alreadyNotified = new Set(watch.notified_scheme_ids || []);
    const newMatches = currentMatches.filter((m) => !alreadyNotified.has(m.schemeId));

    if (newMatches.length > 0) {
      await sendNewMatchEmail(watch.email, newMatches);
      emailsSent++;
    }

    await supabaseAdmin
      .from("user_scheme_watches")
      .update({ notified_scheme_ids: currentIds, updated_at: new Date().toISOString() })
      .eq("user_id", watch.user_id);

    results.push({ userId: watch.user_id, newMatches: newMatches.length });
  }

  res.json({ checked: (watches || []).length, emailsSent, results });
});

async function sendNewMatchEmail(email, matches) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set — skipping notification email");
    return;
  }

  const schemeListHtml = matches
    .map((m) => `<li><strong>${m.name}</strong> (${m.amount}) — ${m.reasons[0]}</li>`)
    .join("");

  const body = {
    from: "Haq Agent <onboarding@resend.dev>",
    to: email,
    subject: `You now qualify for ${matches.length} new scheme${matches.length > 1 ? "s" : ""}`,
    html: `
      <h2>New schemes you qualify for</h2>
      <p>Haq Agent found ${matches.length} new government scheme${matches.length > 1 ? "s" : ""} matching your profile:</p>
      <ul>${schemeListHtml}</ul>
      <p>Log in to Haq Agent to see full details and apply.</p>
    `,
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Resend send error:", text);
    }
  } catch (err) {
    console.error("Resend send exception:", err.message);
  }
}

module.exports = router;
