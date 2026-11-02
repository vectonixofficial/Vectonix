import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
    const user = (process.env.SMTP_USER || process.env.EMAIL_USER || "vectonixofficial@gmail.com").trim();
    const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || "wxuzlwkkfamlayvz";
    const pass = rawPass.replace(/\s+/g, "");

    const isAppPasswordFormat = /^[a-z]{16}$/i.test(pass);

    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_HOST !== "smtp.gmail.com") {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true",
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
        });
    } else {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user, pass },
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

