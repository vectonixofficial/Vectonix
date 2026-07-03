const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require("fs");

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

async function inspectDocs() {
    const snapshot = await getDocs(collection(db, "certificates"));
    console.log(`Total Docs in Firestore: ${snapshot.docs.length}`);

    const allRawDocs = snapshot.docs.map((doc, idx) => {
        const d = doc.data();
        return {
            firestoreDocId: doc.id,
            certificateId: d.certificateId || d.id || `VTX-CERT-${idx + 1}`,
            studentName: d.studentName || d.name || "Student",
            collegeName: d.collegeName || d.college || "College",
            domain: d.domain || "Technology",
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

    // Make every record unique by ensuring certificateId uses doc.id if duplicates exist
    const docIdMap = new Map();
    const uniqueByDocIdList = allRawDocs.map((item, idx) => {
        // If certificateId is duplicate, append index or use doc.id to make it UNIQUE
        let uniqueCertId = item.certificateId;
        if (docIdMap.has(uniqueCertId.toUpperCase())) {
            uniqueCertId = `${item.certificateId}-${docIdMap.get(uniqueCertId.toUpperCase())}`;
            docIdMap.set(item.certificateId.toUpperCase(), docIdMap.get(item.certificateId.toUpperCase()) + 1);
        } else {
            docIdMap.set(uniqueCertId.toUpperCase(), 1);
        }
        return {
            ...item,
            certificateId: uniqueCertId
        };
    });

    console.log(`Outputting ALL ${uniqueByDocIdList.length} UNIQUE Records!`);
    fs.writeFileSync("all_59_unique_firestore_records.json", JSON.stringify(uniqueByDocIdList, null, 2), "utf-8");
    
    console.log("Saved to all_59_unique_firestore_records.json");
}

inspectDocs();
