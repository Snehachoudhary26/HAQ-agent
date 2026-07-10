const express = require("express");
const cors = require("cors");
const { checkEligibility, schemes } = require("./eligibility");
const personas = require("./data/personas.json");
const authRoutes = require("./authRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/schemes", (req, res) => res.json(schemes));
app.get("/api/personas", (req, res) => res.json(personas));

app.post("/api/check-eligibility", (req, res) => {
  const profile = req.body;
  if (!profile || typeof profile !== "object") {
    return res.status(400).json({ error: "Missing profile in request body" });
  }
  const matches = checkEligibility(profile);
  res.json({ profile, matches, checkedAt: new Date().toISOString() });
});

app.get("/api/check-eligibility/persona/:id", (req, res) => {
  const persona = personas.find((p) => p.id === Number(req.params.id));
  if (!persona) return res.status(404).json({ error: "Persona not found" });
  const matches = checkEligibility(persona);
  res.json({ persona, matches });
});

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Haq Agent backend running on http://localhost:${PORT}`));
}

module.exports = app;
