import { NextResponse } from "next/server";
import { getEmailTransporter } from "@/lib/services/emailService";

export async function GET() {
    const user = (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();
    const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || "";
    const pass = rawPass.replace(/\s+/g, "");

    const isAppPasswordFormat = /^[a-z]{16}$/i.test(pass);

    const transporter = getEmailTransporter();
    if (!transporter) {
        return NextResponse.json({
            success: false,
            user,
            isAppPasswordFormat,
            error: "SMTP credentials missing in environment variables (SMTP_USER / SMTP_PASS).",
            guidance: "Please set SMTP_USER and SMTP_PASS in your environment configuration (.env.local / Vercel Environment Variables)."
        });
    }

    try {
        await transporter.verify();
        return NextResponse.json({
            success: true,
            user,
            isAppPasswordFormat,
            message: "Gmail SMTP connected and verified successfully! Emails will be dispatched reliably."
        });
    } catch (err: any) {
        const isBadCredentials =
            err.message?.includes("535") ||
            err.message?.includes("BadCredentials") ||
            err.message?.includes("Username and Password not accepted");

        return NextResponse.json({
            success: false,
            user,
            isAppPasswordFormat,
            error: err.message,
            isBadCredentials,
            guidance: isBadCredentials
                ? "Google SMTP requires a 16-character Google App Password (not your normal Gmail login password). Go to https://myaccount.google.com/apppasswords, create an app password for 'Vectonix' (e.g. 'abcd efgh ijkl mnop'), and set EMAIL_PASS in your Vercel Environment Variables."
                : err.message
        });
    }
}

