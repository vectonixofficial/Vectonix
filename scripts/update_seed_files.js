const fs = require("fs");
const path = require("path");

function updateSeedFiles() {
    const rawPath = path.join(__dirname, "..", "all_59_unique_firestore_records.json");
    const records = JSON.parse(fs.readFileSync(rawPath, "utf-8"));

    console.log(`Updating seed files with all ${records.length} unique records...`);

    function escapeSql(str) {
        if (!str) return "''";
        return "'" + String(str).replace(/'/g, "''") + "'";
    }

    const rows = records.map(c => {
        return `(${escapeSql(c.certificateId)}, ${escapeSql(c.studentName)}, ${escapeSql(c.collegeName)}, ${escapeSql(c.domain)}, ${escapeSql(c.startDate)}, ${escapeSql(c.endDate)}, ${escapeSql(c.issueDate)}, ${escapeSql(c.signatureImage)}, ${escapeSql(c.verificationStatus)}, ${escapeSql(c.type)}, ${escapeSql(c.designation)}, ${escapeSql(c.stipend)})`;
    });

    let sqlContent = `-- Auto-generated Supabase Seed File for All ${records.length} Unique Certificates\n\n`;
    sqlContent += `INSERT INTO public.certificates (certificate_id, student_name, college_name, domain, start_date, end_date, issue_date, signature_image, verification_status, type, designation, stipend) VALUES\n`;
    sqlContent += rows.join(",\n");
    sqlContent += `\nON CONFLICT (certificate_id) DO UPDATE SET\n`;
    sqlContent += `  student_name = EXCLUDED.student_name,\n`;
    sqlContent += `  college_name = EXCLUDED.college_name,\n`;
    sqlContent += `  domain = EXCLUDED.domain,\n`;
    sqlContent += `  verification_status = EXCLUDED.verification_status;\n`;

    fs.writeFileSync(path.join(__dirname, "..", "supabase", "seed_data.sql"), sqlContent, "utf-8");

    // Also update full_setup_and_seed.sql
    const setupPath = path.join(__dirname, "..", "supabase", "full_setup_and_seed.sql");
    let fullSetup = fs.readFileSync(setupPath, "utf-8");
    const insertIdx = fullSetup.indexOf("-- 5. SEED ALL CERTIFICATES");
    if (insertIdx !== -1) {
        fullSetup = fullSetup.substring(0, insertIdx) + "-- 5. SEED ALL CERTIFICATES FROM FIRESTORE\n" + sqlContent.substring(sqlContent.indexOf("INSERT INTO"));
        fs.writeFileSync(setupPath, fullSetup, "utf-8");
    }

    console.log("Successfully updated both seed_data.sql and full_setup_and_seed.sql!");
}

updateSeedFiles();
