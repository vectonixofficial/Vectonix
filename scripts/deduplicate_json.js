const fs = require("fs");
const path = require("path");

function deduplicate() {
    const rawPath = path.join(__dirname, "..", "all_59_certificates.json");
    if (!fs.existsSync(rawPath)) {
        console.error("all_59_certificates.json not found!");
        return;
    }

    const rawData = JSON.parse(fs.readFileSync(rawPath, "utf-8"));
    console.log(`Raw certificates count before deduplication: ${rawData.length}`);

    const uniqueMap = new Map();

    rawData.forEach(item => {
        const id = (item.certificateId || item.id || "").trim();
        if (id) {
            const key = id.toUpperCase();
            // Store or update if richer record
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, item);
            } else {
                const existing = uniqueMap.get(key);
                // Keep whichever has signature or more fields
                if (!existing.signatureImage && item.signatureImage) {
                    uniqueMap.set(key, item);
                }
            }
        }
    });

    const cleanList = Array.from(uniqueMap.values());
    console.log(`Deduplicated count of UNIQUE certificates: ${cleanList.length}`);

    const cleanPath = path.join(__dirname, "..", "clean_unique_certificates.json");
    fs.writeFileSync(cleanPath, JSON.stringify(cleanList, null, 2), "utf-8");
    console.log(`Saved clean list to ${cleanPath}`);

    // Also output browser console deduplication script
    console.log("\n--- DEDUPLICATED JSON START ---");
    console.log(JSON.stringify(cleanList, null, 2));
    console.log("--- DEDUPLICATED JSON END ---\n");
}

deduplicate();
