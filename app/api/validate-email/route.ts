import { NextResponse } from "next/server";
import dns from "dns";

const DISPOSABLE_DOMAINS = new Set([
    "tempmail.com", "mailinator.com", "10minutemail.com", "guerrillamail.com",
    "throwawaymail.com", "trashmail.com", "yopmail.com", "getairmail.com",
    "sharklasers.com", "dispostable.com", "fakemailgenerator.com", "temp-mail.org",
    "mohmal.com", "crazymailing.com", "burnermail.io", "maildrop.cc"
]);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = (searchParams.get("email") || "").trim().toLowerCase();

        if (!email) {
            return NextResponse.json({
                valid: false,
                status: "invalid_format",
                message: "Email address is required."
            }, { status: 400 });
        }

        // 1. Basic Format Validation (RFC 5322 regex compliant)
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                valid: false,
                status: "invalid_format",
                message: "Invalid email format."
            });
        }

        const parts = email.split("@");
        if (parts.length !== 2) {
            return NextResponse.json({
                valid: false,
                status: "invalid_format",
                message: "Invalid email format."
            });
        }

        const domain = parts[1];

        // 2. Disposable Email Domain Check
        if (DISPOSABLE_DOMAINS.has(domain)) {
            return NextResponse.json({
                valid: false,
                status: "disposable",
                message: "Disposable / temporary email addresses are not accepted."
            });
        }

        // 3. DNS MX Record Lookup
        try {
            const mxRecords = await dns.promises.resolveMx(domain);
            if (mxRecords && mxRecords.length > 0) {
                return NextResponse.json({
                    valid: true,
                    status: "valid",
                    domain,
                    message: "Email domain is configured to receive email."
                });
            } else {
                return NextResponse.json({
                    valid: false,
                    status: "invalid_domain",
                    domain,
                    message: "Email domain does not appear to accept email."
                });
            }
        } catch (dnsErr: any) {
            if (dnsErr.code === "ENOTFOUND" || dnsErr.code === "NODATA" || dnsErr.code === "ENODATA") {
                return NextResponse.json({
                    valid: false,
                    status: "invalid_domain",
                    domain,
                    message: "Email domain does not exist or has no mail exchange (MX) records."
                });
            }

            // In case of timeout or local DNS resolution issue, allow graceful fallback without blocking
            console.warn("DNS check error (network/timeout):", dnsErr.message);
            return NextResponse.json({
                valid: true, // Graceful fallback
                status: "unable_to_check",
                domain,
                message: "Unable to check domain MX availability right now. Format is valid."
            });
        }
    } catch (err: any) {
        console.error("Email validation endpoint error:", err);
        return NextResponse.json({
            valid: true, // Non-blocking fallback
            status: "unable_to_check",
            message: "Unable to check email availability. Please try again."
        });
    }
}

