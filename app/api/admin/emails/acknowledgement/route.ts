import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function getTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== "your-google-app-password-here") {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    return null;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentName, email, applicationId, internshipDomain, packageName, collegeName } = body;

        if (!email || !applicationId) {
            return NextResponse.json({ error: "Missing required details" }, { status: 400 });
        }

        const transporter = getTransporter();
        if (!transporter) {
            console.log("Email transporter not configured. Skipping acknowledgement email dispatch for:", email);
            return NextResponse.json({ message: "Transporter not configured, skipped" });
        }

        const senderEmail = process.env.SMTP_FROM || process.env.EMAIL_USER || "vectonixofficial@gmail.com";

        const subject = `Welcome to Vectonix Winter Internship 2026! (Application ID: ${applicationId})`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
                <div style="background-color: #4f46e5; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Vectonix Technologies</h1>
                    <p style="color: #c7d2fe; margin: 4px 0 0 0; font-size: 14px;">Winter Internship 2026 (Batch WI26)</p>
                </div>
                <div style="background-color: #ffffff; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                    <p>Hello <strong>${studentName || "Student"}</strong>,</p>
                    <p>Congratulations! Your registration for the <strong>Vectonix Winter Internship 2026</strong> has been successfully received.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #4f46e5; font-size: 15px;">Application Summary</h3>
                        <p style="margin: 4px 0;"><strong>Official Application ID:</strong> <span style="font-family: monospace; font-size: 16px; color: #0f172a; font-weight: bold;">${applicationId}</span></p>
                        <p style="margin: 4px 0;"><strong>Selected Domain:</strong> ${internshipDomain || "N/A"}</p>
                        <p style="margin: 4px 0;"><strong>Selected Package:</strong> ${packageName || "Standard"}</p>
                        <p style="margin: 4px 0;"><strong>College/University:</strong> ${collegeName || "N/A"}</p>
                    </div>

                    <p>Our academic and technical team will review your cohort allocation. Look out for the batch schedule, Discord community invite, and orientation instructions in your inbox.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    
                    <p style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
                        Need assistance? Contact us at:
                    </p>
                    <p style="font-size: 13px; color: #334155; margin-top: 0;">
                        <strong>Team Vectonix Technologies</strong><br>
                        Email: <a href="mailto:vectonixofficial@gmail.com" style="color: #4f46e5;">vectonixofficial@gmail.com</a><br>
                        Helpline: 6382340278 / 7538872586
                    </p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Vectonix Technologies" <${senderEmail}>`,
            to: email,
            subject,
            html,
        });

        return NextResponse.json({ success: true, message: "Acknowledgement email delivered" });
    } catch (err: any) {
        console.error("Acknowledgement email error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

