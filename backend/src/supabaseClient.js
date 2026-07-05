require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env file");
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

module.exports = supabase;
