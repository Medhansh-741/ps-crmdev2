import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: "./apps/web/.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data, error } = await supabase.from("complaints").select("*").limit(5);
  console.log("Error:", error);
  console.log("Data count:", data?.length);
  if (data && data.length > 0) {
    console.log("First row status:", data[0].status);
    console.log("First row severity:", data[0].severity);
  }
}

checkData();
