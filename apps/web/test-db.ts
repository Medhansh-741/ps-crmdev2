import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envStr = fs.readFileSync(".env.local", "utf8");
const env: Record<string, string> = {};
envStr.split("\n").forEach(line => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length > 0) env[key.trim()] = vals.join("=").trim().replace(/^"|"$/g, '');
});

const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"] || "";
const supabaseKey = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data, error } = await supabase.from("complaints").select("id, ticket_id, location, severity, effective_severity, sla_breached, assigned_department, title, description, status, created_at, ward_name, escalation_level").limit(5);
  console.log("Error:", error);
  console.log("Data count:", data?.length);
  if (data && data.length > 0) {
    console.log("First row status:", data[0].status);
    console.log("First row severity:", data[0].severity, data[0].effective_severity);
    console.log("First row escalation_level:", data[0].escalation_level);
    console.log("First row sla_breached:", data[0].sla_breached);
  }
}

checkData();
