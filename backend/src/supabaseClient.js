if (!process.env.VERCEL) {
  require("dotenv").config();
}

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error(
    "[supabaseClient] Missing SUPABASE_URL or SUPABASE_SECRET_KEY.\n" +
    "  Local dev: add them to backend/.env (see backend/.env.example)\n" +
    "  Vercel: add them in Project Settings > Environment Variables"
  );
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

module.exports = supabase;
module.exports.supabaseAdmin = supabase;

module.exports.supabaseAdmin = supabase;
