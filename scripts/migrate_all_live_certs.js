const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const firebaseConfig = {
  apiKey: "AIzaSyCyQ8iVITfWJXmUwEoytXeB8xv3530FTlQ",
  authDomain: "vectonix-cca3d.firebaseapp.com",
  projectId: "vectonix-cca3d",
  storageBucket: "vectonix-cca3d.firebasestorage.app",
  messagingSenderId: "349218922055",
  appId: "1:349218922055:web:26c0966e8537b0930a1b62"
};

const supabaseUrl = 'https://asrnrvsfbogrgspixyvg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcm5ydnNmYm9ncmdzcGl4eXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDU3NTMsImV4cCI6MjA5ODU4MTc1M30.Qb-lgMU3xRRomdrlDeUCtpDoiK82YNjAlwbr0c-kYw0';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const supabase = createClient(supabaseUrl, supabaseKey);

function sanitizeDate(d) {
    if (!d || typeof d !== "string" || d.trim() === "") return "2026-06-01";
    return d.trim();
}

function escapeSql(str) {
    if (!str) return "''";
    return "'" + String(str).replace(/'/g, "''") + "'";
}

async function migrateAllData() {
    console.log("Fetching live certificates from Firestore (project: vectonix-cca3d)...");
    try {
        const snapshot = await getDocs(collection(db, "certificates"));
        console.log(`Found ${snapshot.size} certificates in live Firestore!`);
        
        const certRecords = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                certificate_id: data.certificateId,
                student_name: data.studentName || "Student",
                college_name: data.collegeName || "College",
                domain: data.domain || "Technology",
                start_date: sanitizeDate(data.startDate),
                end_date: sanitizeDate(data.endDate),
                issue_date: sanitizeDate(data.issueDate),
                signature_image: data.signatureImage || "",
                verification_status: data.verificationStatus || "verified",
                type: data.type || (data.certificateId?.includes("OFF") ? "offer_letter" : "completion"),
                designation: data.designation || "",
                stipend: data.stipend || "",
            };
        }).filter(c => c.certificate_id);

        console.log(`Extracted ${certRecords.length} certificate records.`);

        // Generate comprehensive seed SQL file
        let sqlContent = `-- Auto-generated Supabase Seed File for All ${certRecords.length} Certificates\n\n`;
        sqlContent += `INSERT INTO public.certificates (certificate_id, student_name, college_name, domain, start_date, end_date, issue_date, signature_image, verification_status, type, designation, stipend) VALUES\n`;

        const sqlRows = certRecords.map(c => {
            return `(${escapeSql(c.certificate_id)}, ${escapeSql(c.student_name)}, ${escapeSql(c.college_name)}, ${escapeSql(c.domain)}, ${escapeSql(c.start_date)}, ${escapeSql(c.end_date)}, ${escapeSql(c.issue_date)}, ${escapeSql(c.signature_image)}, ${escapeSql(c.verification_status)}, ${escapeSql(c.type)}, ${escapeSql(c.designation)}, ${escapeSql(c.stipend)})`;
        });

        sqlContent += sqlRows.join(",\n");
        sqlContent += `\nON CONFLICT (certificate_id) DO UPDATE SET\n`;
        sqlContent += `  student_name = EXCLUDED.student_name,\n`;
        sqlContent += `  college_name = EXCLUDED.college_name,\n`;
        sqlContent += `  domain = EXCLUDED.domain,\n`;
        sqlContent += `  verification_status = EXCLUDED.verification_status;\n`;

        const seedFilePath = path.join(__dirname, "..", "supabase", "seed_data.sql");
        fs.writeFileSync(seedFilePath, sqlContent, "utf-8");
        console.log(`SUCCESS! Written all ${certRecords.length} certificates to ${seedFilePath}`);

        // Try direct Supabase insertion
        const { data, error } = await supabase
            .from("certificates")
            .upsert(certRecords, { onConflict: "certificate_id" })
            .select("id");

        if (error) {
            console.log("Supabase direct API note:", error.message);
        } else {
            console.log(`Direct API Success: Inserted ${data.length} certificates into Supabase!`);
        }

    } catch (err) {
        console.error("Firestore error:", err);
    }
}

migrateAllData();
