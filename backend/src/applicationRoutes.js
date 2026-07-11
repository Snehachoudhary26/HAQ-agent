const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("./supabaseClient");
const { schemes } = require("./eligibility");

// Create a new application (called when a user applies to a scheme)
router.post("/applications", async (req, res) => {
  const { userId, schemeId, schemeName, requiredDocuments } = req.body;
  if (!userId || !schemeId || !schemeName) {
    return res.status(400).json({ error: "userId, schemeId, and schemeName are required" });
  }

  const { data: application, error } = await supabaseAdmin
    .from("applications")
    .insert({ user_id: userId, scheme_id: schemeId, scheme_name: schemeName, status: "submitted" })
    .select()
    .single();

  if (error) {
    console.error("create application error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  // Pre-create document rows as "missing" so the Track Application page has something to show
  if (Array.isArray(requiredDocuments) && requiredDocuments.length > 0) {
    const docRows = requiredDocuments.map((docType) => ({
      application_id: application.id,
      document_type: docType,
      status: "missing",
    }));
    await supabaseAdmin.from("application_documents").insert(docRows);
  }

  res.json({ application });
});

// List all applications for a user (Track Application page)
router.get("/applications/user/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data: applications, error } = await supabaseAdmin
    .from("applications")
    .select("*, application_documents(*)")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("list applications error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  const enriched = (applications || []).map((app) => {
    const scheme = schemes.find((s) => s.id === app.scheme_id);
    const rawSource = scheme?.source?.split("/")[0]?.trim(); // "pmkisan.gov.in / PIB" -> "pmkisan.gov.in"
    return {
      ...app,
      official_site: rawSource ? `https://${rawSource}` : null,
    };
  });

  res.json({ applications: enriched });
});

// Mark a document as uploaded (call this after the file itself is saved to Supabase Storage)
router.patch("/applications/:applicationId/documents/:documentId/upload", async (req, res) => {
  const { documentId } = req.params;
  const { storagePath } = req.body;
  if (!storagePath) {
    return res.status(400).json({ error: "storagePath is required" });
  }

  const { data, error } = await supabaseAdmin
    .from("application_documents")
    .update({ status: "uploaded", storage_path: storagePath, uploaded_at: new Date().toISOString() })
    .eq("id", documentId)
    .select()
    .single();

  if (error) {
    console.error("upload document error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ document: data });
});

// APPROVE or REJECT a specific document (this is "how you approve the data")
// reviewerId should identify the admin/reviewer doing this — for now, pass any string (e.g. your own name)
router.patch("/applications/:applicationId/documents/:documentId/review", async (req, res) => {
  const { documentId } = req.params;
  const { decision, reviewerId } = req.body; // decision: "verified" or "rejected"
  if (!["verified", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "decision must be 'verified' or 'rejected'" });
  }

  const { data, error } = await supabaseAdmin
    .from("application_documents")
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId || "admin",
    })
    .eq("id", documentId)
    .select()
    .single();

  if (error) {
    console.error("review document error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ document: data });
});

// Update overall application status (approve/reject the whole application)
router.patch("/applications/:applicationId/status", async (req, res) => {
  const { applicationId } = req.params;
  const { status, nextStep } = req.body; // status: submitted | action_required | approved | rejected
  if (!["submitted", "action_required", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const { data, error } = await supabaseAdmin
    .from("applications")
    .update({ status, next_step: nextStep || null, updated_at: new Date().toISOString() })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    console.error("update application status error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ application: data });
});

module.exports = router;
