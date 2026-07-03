const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function export59Json() {
    console.log("Fetching all 59 records directly from Firebase Firestore...");
    const snapshot = await getDocs(collection(db, "certificates"));
    
    const records = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
            certificateId: d.certificateId || "",
            studentName: d.studentName || "",
            collegeName: d.collegeName || "",
            domain: d.domain || "",
            startDate: d.startDate || "2026-06-01",
            endDate: d.endDate || "2026-07-01",
            issueDate: d.issueDate || "2026-07-01",
            signatureImage: d.signatureImage || "",
            verificationStatus: d.verificationStatus || "verified",
            type: d.type || (d.certificateId?.includes("OFF") ? "offer_letter" : "completion"),
            designation: d.designation || "",
            stipend: d.stipend || "",
        };
    });

    console.log(`TOTAL RECORDS EXTRACTED FROM FIREBASE: ${records.length}`);
    const jsonPath = path.join(__dirname, "..", "all_59_certificates.json");
    fs.writeFileSync(jsonPath, JSON.stringify(records, null, 2), "utf-8");
    console.log(`Saved to ${jsonPath}`);

    // Print JSON output for display
    console.log("\n--- JSON OUTPUT START ---");
    console.log(JSON.stringify(records, null, 2));
    console.log("--- JSON OUTPUT END ---\n");
}

export59Json();
