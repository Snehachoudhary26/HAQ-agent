const express = require("express");
const cors = require("cors");
const { checkEligibility, schemes } = require("./eligibility");
const personas = require("./data/personas.json");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// List all schemes (with sourcing info, so the UI can show "last verified")
app.get("/api/schemes", (req, res) => res.json(schemes));

// List the 30 test personas (for demo/dev use only)
app.get("/api/personas", (req, res) => res.json(personas));

// Core agent action: given a user profile, return matched schemes + reasons
app.post("/api/check-eligibility", (req, res) => {
  const profile = req.body;
  if (!profile || typeof profile !== "object") {
    return res.status(400).json({ error: "Missing profile in request body" });
  }
  const matches = checkEligibility(profile);
  res.json({ profile, matches, checkedAt: new Date().toISOString() });
});

// Quick test endpoint: run eligibility against a specific persona by id
app.get("/api/check-eligibility/persona/:id", (req, res) => {
  const persona = personas.find((p) => p.id === Number(req.params.id));
  if (!persona) return res.status(404).json({ error: "Persona not found" });
  const matches = checkEligibility(persona);
  res.json({ persona, matches });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Haq Agent backend running on http://localhost:${PORT}`));