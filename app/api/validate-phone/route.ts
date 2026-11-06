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
        // Remove leading country code if provided (+91 or 91)
        let phone = digitsOnly;
        if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
            phone = digitsOnly.slice(2);
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
            phone = digitsOnly.slice(1);
        }

        if (!phone) {
            return NextResponse.json(
                { valid: false, status: "required", message: "Mobile number is required." },
                { status: 400 }
            );
        }

        // 2. Strict Indian 10-digit mobile number format check: Starts with 6, 7, 8, or 9
        const indianMobileRegex = /^[6-9]\d{9}$/;
        if (!indianMobileRegex.test(phone)) {
            return NextResponse.json({
                valid: false,
                status: "invalid_format",
                message: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
            });
        }

        // 3. Reject invalid fake patterns (all repeating digits or simple sequential)
        const allRepeating = /^(\d)\1{9}$/.test(phone);
        const sequential = "01234567890123456789".includes(phone) || "98765432109876543210".includes(phone);
        if (allRepeating || sequential) {
            return NextResponse.json({
                valid: false,
                status: "invalid_format",
                message: "Please enter an authentic personal contact number."
            });
        }

        // 4. Check for duplicate registration in Supabase
        if (supabaseUrl && supabaseAnonKey) {
            const { data: existing, error } = await supabase
                .from("internship_applications")
                .select("id, application_id, full_name, phone, whatsapp_number")
                .eq("batch_id", batchId)
                .or(`phone.eq.${phone},phone.eq.+91${phone},whatsapp_number.eq.${phone},whatsapp_number.eq.+91${phone}`)
                .limit(1);

            if (!error && existing && existing.length > 0) {
                return NextResponse.json({
                    valid: false,
                    status: "duplicate",
                    phone,
                    message: "This mobile number is already registered for the Winter Internship 2026 cohort."
                });
            }
        }

        return NextResponse.json({
            valid: true,
            status: "valid",
            phone,
            message: "Mobile number verified and ready."
        });
    } catch (err: any) {
        console.error("Phone validation error:", err);
        return NextResponse.json(
            { valid: true, status: "fallback", message: "Mobile number accepted." },
            { status: 200 }
        );
    }
}

