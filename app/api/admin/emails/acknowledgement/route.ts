import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function getTransporter() {
    const user = process.env.SMTP_USER || process.env.EMAIL_USER || "vectonixofficial@gmail.com";
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || "Vectonix#12@";

    if (process.env.SMTP_HOST && process.env.SMTP_HOST !== "smtp.gmail.com") {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true",
            auth: { user, pass },
        });
    }

    // Default to Gmail transporter with provided credentials
    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentName, email, applicationId, internshipDomain, packageName, collegeName, applicationIdDb } = body;

        if (!email || !applicationId) {
            return NextResponse.json({ error: "Missing required details" }, { status: 400 });
        }

        const transporter = getTransporter();
        const senderEmail = process.env.SMTP_FROM || process.env.EMAIL_USER || "vectonixofficial@gmail.com";

        const subject = `Welcome to Vectonix Winter Internship 2026! (Application ID: ${applicationId})`;

        const textBody = `Hello ${studentName || "Student"},

Congratulations!
Your application for the Vectonix Winter Internship 2026 has been received.

Application ID: ${applicationId}
Selected Domain: ${internshipDomain || "N/A"}
Selected Package: ${packageName || "Standard"}
College: ${collegeName || "N/A"}

We look forward to having you as part of Vectonix Technologies.

Regards,
Team Vectonix Technologies
vectonixofficial@gmail.com
6382340278 / 7538872586`;

        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Vectonix Technologies</h1>
                    <p style="color: #c7d2fe; margin: 4px 0 0 0; font-size: 13px;">VECTONIX PRIVATE LIMITED</p>
                </div>
                <div style="background-color: #ffffff; padding: 28px;">
                    <p style="font-size: 15px; margin-top: 0;">Hello <strong>${studentName || "Student"}</strong>,</p>
                    <p style="font-size: 15px;">Congratulations!<br>Your application for the <strong>Vectonix Winter Internship 2026</strong> has been received.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 6px 0; font-size: 14px;"><strong>Application ID:</strong> <span style="font-family: monospace; font-size: 15px; color: #4f46e5; font-weight: bold;">${applicationId}</span></p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>Selected Domain:</strong> ${internshipDomain || "N/A"}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>Selected Package:</strong> ${packageName || "Standard"}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>College:</strong> ${collegeName || "N/A"}</p>
                    </div>

                    <p style="font-size: 14px;">We look forward to having you as part of Vectonix Technologies.</p>
                    
                    <div style="margin: 24px 0; text-align: center;">
                        <a href="https://vectonix.in/internship/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Access Student Dashboard</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    
                    <p style="font-size: 13px; color: #475569; margin: 0;">
                        Regards,<br>
                        <strong>Team Vectonix Technologies</strong><br>
                        <a href="mailto:vectonixofficial@gmail.com" style="color: #4f46e5;">vectonixofficial@gmail.com</a><br>
                        6382340278 / 7538872586<br>
                        <a href="https://vectonix.in" style="color: #4f46e5; font-size: 12px;">https://vectonix.in</a>
                    </p>
                </div>
            </div>
        `;

        let providerMessageId = `ack_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        let deliveryStatus = "queued";

        if (transporter) {
            try {
                const info = await transporter.sendMail({
                    from: `"Vectonix Technologies" <${senderEmail}>`,
                    to: email,
                    subject,
                    text: textBody,
                    html: htmlBody,
                });
                providerMessageId = info.messageId || providerMessageId;
                deliveryStatus = "sent";
            } catch (mailErr: any) {
                console.error("Transporter delivery warning:", mailErr.message);
                deliveryStatus = "failed";
            }
        } else {
            console.log("Email transporter not configured. Logged confirmation dispatch for:", email);
            deliveryStatus = "simulated";
        }

        // Record in Supabase if configured
        if (isSupabaseConfigured) {
            try {
                await supabase.from("email_recipients").insert({
                    recipient_email: email,
                    recipient_name: studentName,
                    application_id: applicationIdDb || null,
                    delivery_status: deliveryStatus === "sent" ? "sent" : "queued",
                    provider_message_id: providerMessageId,
                    sent_at: new Date().toISOString()
                });
            } catch (recErr) {
                console.warn("Could not record ack recipient:", recErr);
            }
        }

        return NextResponse.json({
            success: true,
            status: deliveryStatus,
            providerMessageId
        });
    } catch (err: any) {
        console.error("Acknowledgement email endpoint error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
