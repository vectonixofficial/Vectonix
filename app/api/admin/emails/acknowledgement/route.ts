import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getEmailTransporter } from "@/lib/services/emailService";
import {
    renderVectonixBrandedEmail,
    DEFAULT_VECTONIX_TEMPLATES
} from "@/lib/services/emailTemplateService";

function getTransporter() {
    return getEmailTransporter();
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

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vectonix.in";
        const logoPath = path.join(process.cwd(), "public/vectonix-email-logo.png");
        const fallbackLogoPath = path.join(process.cwd(), "public/vectonix-logo.png");
        const actualLogoPath = fs.existsSync(logoPath) ? logoPath : fallbackLogoPath;
        const attachments: any[] = [];
        let emailLogoUrl = `${siteUrl}/vectonix-email-logo.png`;

        if (fs.existsSync(actualLogoPath)) {
            attachments.push({
                filename: "vectonix-email-logo.png",
                path: actualLogoPath,
                cid: "vectonix-email-logo"
            });
            emailLogoUrl = "cid:vectonix-email-logo";
        }

        // Render using the official Vectonix Default Template System
        const appReceivedTemplate = DEFAULT_VECTONIX_TEMPLATES[0]; // Application Received (Acknowledgement)
        const rendered = renderVectonixBrandedEmail(
            appReceivedTemplate,
            {
                student_name: studentName || "Student",
                application_id: applicationId,
                internship_domain: internshipDomain || "Winter Internship",
                package_name: packageName || "Standard",
                college_name: collegeName || "N/A",
                dashboard_link: `${siteUrl}/internship/login?appId=${encodeURIComponent(applicationId)}&email=${encodeURIComponent(email)}`
            },
            { logoUrl: emailLogoUrl }
        );

        let providerMessageId = `ack_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        let deliveryStatus = "queued";
        let lastErrorMsg: string | null = null;

        if (transporter) {
            try {
                const info = await transporter.sendMail({
                    from: `"Vectonix Technologies" <${senderEmail}>`,
                    to: email,
                    subject: rendered.subject,
                    text: rendered.text,
                    html: rendered.html,
                    attachments
                });
                providerMessageId = info.messageId || providerMessageId;
                deliveryStatus = "sent";
            } catch (smtpErr: any) {
                console.error("SMTP error sending acknowledgement email:", smtpErr);
                deliveryStatus = "failed";
                lastErrorMsg = smtpErr.message;
            }
        } else {
            // Simulated sent in development if SMTP credentials not present
            deliveryStatus = "sent";
        }

        // Log delivery status into database
        if (isSupabaseConfigured) {
            try {
                await supabase.from("email_recipients").insert({
                    recipient_email: email,
                    recipient_name: studentName,
                    application_id: applicationIdDb || applicationId,
                    delivery_status: deliveryStatus,
                    provider_message_id: providerMessageId,
                    error_message: lastErrorMsg,
                    sent_at: new Date().toISOString()
                });
            } catch (dbErr) {
                console.warn("Could not log acknowledgement to email_recipients:", dbErr);
            }
        }

        return NextResponse.json({
            success: deliveryStatus === "sent",
            deliveryStatus,
            providerMessageId,
            error: lastErrorMsg
        });
    } catch (err: any) {
        console.error("Acknowledgement email endpoint error:", err);
        return NextResponse.json({ error: err.message || "Failed to process acknowledgement email" }, { status: 500 });
    }
}
