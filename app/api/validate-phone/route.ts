import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase server client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const rawPhone = (searchParams.get("phone") || "").trim();
        const batchId = (searchParams.get("batchId") || "wi26").trim().toLowerCase();

        // 1. Clean phone - extract digits only
        const digitsOnly = rawPhone.replace(/\D/g, "");

        if (!digitsOnly) {
            return NextResponse.json(
                { valid: false, status: "required", message: "Phone number is required." },
                { status: 400 }
            );
        }

        // 2. International standard format check (ITU-T E.164: 7 to 15 digits)
        if (digitsOnly.length < 7 || digitsOnly.length > 15) {
            return NextResponse.json({
                valid: false,
                status: "invalid_format",
                message: "Please enter a valid phone number (7 to 15 digits, including country code if outside India)."
            });
        }

        // 3. Reject invalid fake patterns (all repeating digits or simple sequential)
        const allRepeating = /^(\d)\1+$/.test(digitsOnly);
        const sequential =
            "01234567890123456789".includes(digitsOnly) ||
            "98765432109876543210".includes(digitsOnly);

        if (allRepeating || (digitsOnly.length >= 8 && sequential)) {
            return NextResponse.json({
                valid: false,
                status: "invalid_format",
                message: "Please enter an authentic personal contact number."
            });
        }

        // 4. Normalized phone string for storage & display
        const hasPlus = rawPhone.startsWith("+");
        const normalizedPhone = hasPlus ? `+${digitsOnly}` : digitsOnly;

        // 5. Check for duplicate registration in Supabase across possible formatting variants
        if (supabaseUrl && supabaseAnonKey) {
            const candidateValues = new Set<string>();
            candidateValues.add(digitsOnly);
            candidateValues.add(`+${digitsOnly}`);
            if (rawPhone) candidateValues.add(rawPhone);

            // If 10 digits without prefix (e.g. Indian number), check variants
            if (digitsOnly.length === 10) {
                candidateValues.add(`+91${digitsOnly}`);
                candidateValues.add(`91${digitsOnly}`);
            }
            // If 12 digits starting with 91, check 10-digit variant
            if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
                candidateValues.add(digitsOnly.slice(2));
            }

            const orFilter = Array.from(candidateValues)
                .flatMap((val) => [`phone.eq.${val}`, `whatsapp_number.eq.${val}`])
                .join(",");

            const { data: existing, error } = await supabase
                .from("internship_applications")
                .select("id, application_id, full_name, phone, whatsapp_number")
                .eq("batch_id", batchId)
                .or(orFilter)
                .limit(1);

            if (!error && existing && existing.length > 0) {
                return NextResponse.json({
                    valid: false,
                    status: "duplicate",
                    phone: normalizedPhone,
                    message: "This phone number is already registered for this internship batch."
                });
            }
        }

        return NextResponse.json({
            valid: true,
            status: "valid",
            phone: normalizedPhone,
            message: "Phone number verified and ready."
        });
    } catch (err: any) {
        console.error("Phone validation error:", err);
        return NextResponse.json(
            { valid: true, status: "fallback", message: "Phone number accepted." },
            { status: 200 }
        );
    }
}
