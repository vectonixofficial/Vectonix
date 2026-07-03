const { createClient } = require("@supabase/supabase-js");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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

async function seedDirectly() {
    console.log("Reading all certificates from live Firestore...");
    const snapshot = await getDocs(collection(db, "certificates"));
    console.log(`Found ${snapshot.size} raw documents in Firestore.`);

    const map = new Map();
    snapshot.docs.forEach(doc => {
        const d = doc.data();
        if (d.certificateId) {
            map.set(d.certificateId.trim().toUpperCase(), {
                certificate_id: d.certificateId.trim(),
                student_name: d.studentName || "Student",
                college_name: d.collegeName || "College",
                domain: d.domain || "Technology",
                start_date: sanitizeDate(d.startDate),
                end_date: sanitizeDate(d.endDate),
                issue_date: sanitizeDate(d.issueDate),
                signature_image: d.signatureImage || "",
                verification_status: d.verificationStatus || "verified",
                type: d.type || (d.certificateId.includes("OFF") ? "offer_letter" : "completion"),
                designation: d.designation || "",
                stipend: d.stipend || "",
            });
        }
    });

    const uniqueCerts = Array.from(map.values());
    console.log(`Unique Certificates to Insert: ${uniqueCerts.length}`);

    // Insert records in batches of 10
    let successCount = 0;
    for (let i = 0; i < uniqueCerts.length; i += 10) {
        const batch = uniqueCerts.slice(i, i + 10);
        const { data, error } = await supabase
            .from("certificates")
            .upsert(batch, { onConflict: "certificate_id" })
            .select("id");

        if (error) {
            console.error(`Batch ${i/10 + 1} error:`, error.message);
        } else {
            successCount += data ? data.length : batch.length;
            console.log(`Batch ${i/10 + 1} inserted successfully (${batch.length} items)`);
        }
    }

    // Verify final count in Supabase
    const { count } = await supabase.from("certificates").select("*", { count: "exact", head: true });
    console.log(`FINAL SUPABASE TOTAL COUNT: ${count} certificates!`);
}

seedDirectly();
