const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const supabaseUrl = 'https://asrnrvsfbogrgspixyvg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcm5ydnNmYm9ncmdzcGl4eXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDU3NTMsImV4cCI6MjA5ODU4MTc1M30.Qb-lgMU3xRRomdrlDeUCtpDoiK82YNjAlwbr0c-kYw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    // Check seed file SQL rows count
    const seedContent = fs.readFileSync("supabase/seed_data.sql", "utf-8");
    const matches = seedContent.match(/\('VT/g) || [];
    const matchesVtx = seedContent.match(/\('VTX/g) || [];
    const totalSeedRows = matches.length + matchesVtx.length;

    console.log(`[SEED FILE CHECK] Total Certificate Rows in seed_data.sql: ${totalSeedRows}`);

    // Check live Supabase DB count
    const { count, error } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true });

    if (error) {
        console.error("[SUPABASE DB CHECK] Error:", error.message);
    } else {
        console.log(`[SUPABASE DB CHECK] Current Rows in Supabase Database: ${count}`);
    }
}

verify();
