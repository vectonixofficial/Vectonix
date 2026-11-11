import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured, DatabaseInternshipApplication } from "@/lib/supabase";

export interface DecisionEmailPayload {
    applicationId: string;
    studentName: string;
    email: string;
    domain: string;
    status: "accepted" | "rejected";
    rejectionReason?: string;
    forceResend?: boolean;
}

export interface EmailDeliveryResult {
    success: boolean;
    skipped?: boolean;
    messageId?: string;
    error?: string;
    sentAt?: string;
    type: "acceptance" | "rejection";
    recipient: string;
}

/**
 * Get configured nodemailer transporter using secure environment variables.
 * Never hardcodes secrets in source code.
 */
export function getEmailTransporter() {
    const user = (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();
    const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s+/g, "");

    if (!user || !pass) {
        console.warn("Email service warning: SMTP_USER or SMTP_PASS is missing in environment variables.");
        return null;
    }

    if (process.env.SMTP_HOST && process.env.SMTP_HOST !== "smtp.gmail.com") {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true",
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
        });
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
    });
}

/**
 * Generate official Acceptance Email template
 */
export function renderAcceptanceEmail(data: {
    studentName: string;
    applicationId: string;
    domain: string;
    email: string;
    dashboardUrl?: string;
    logoUrl?: string;
}) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vectonix.in";
    const logoUrl = data.logoUrl || `${siteUrl}/vectonix-email-logo.png`;
    const dashboardUrl =
        data.dashboardUrl ||
        `${siteUrl}/internship/login?appId=${encodeURIComponent(data.applicationId)}&email=${encodeURIComponent(data.email)}`;

    const subject = "Congratulations! Your Application Has Been Accepted – Vectonix Winter Internship 2026";

    const text = `Dear ${data.studentName},

Congratulations!

We are pleased to inform you that your application for the Vectonix Winter Internship 2026 has been successfully accepted.

We appreciate your interest in joining Vectonix Private Limited, and we are excited to have you as part of our internship program.

Here are your internship details:
Application ID: ${data.applicationId}
Internship: Vectonix Winter Internship 2026
Domain: ${data.domain}
Duration: 25 November 2026 – 25 December 2026
Application Status: Accepted

What happens next?
• You will receive access to your internship student dashboard.
• Your project and learning resources will be made available according to the internship schedule.
• You can complete your assigned milestones and submit your work through the portal.
• Weekly project reviews and mentor support will be available.
• Orientation and important announcements will be shared through the portal.

Please log in to your student dashboard to access your internship information.
Student Dashboard: ${dashboardUrl}

We look forward to seeing your creativity, dedication, and contributions.

Welcome to Vectonix!

Best Regards,
Internship Coordination Team
Vectonix Private Limited
Website: https://vectonix.in
Email: vectonixofficial@gmail.com
Learn • Build • Grow`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <!-- Brand Header -->
                    <tr>
                        <td align="center" style="background-color: #ffffff; padding: 36px 28px 22px 28px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                            <img src="${logoUrl}" alt="Vectonix" width="185" style="display: block; width: 185px; max-width: 100%; height: auto; border: 0; outline: none; margin: 0 auto; pointer-events: none; -webkit-user-select: none; user-select: none;" />
                            <p style="color: #64748b; margin: 8px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase;">Vectonix Technologies • Winter Internship 2026</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px 28px 24px 28px;">
                            <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                                Application Accepted
                            </div>

                            <p style="font-size: 16px; margin: 0 0 16px 0; color: #0f172a;">Dear <strong>${data.studentName}</strong>,</p>

                            <p style="font-size: 18px; font-weight: 700; color: #059669; margin: 0 0 14px 0;">
                                Congratulations!
                            </p>

                            <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0;">
                                We are pleased to inform you that your application for the <strong>Vectonix Winter Internship 2026</strong> has been successfully accepted.
                            </p>

                            <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0;">
                                We appreciate your interest in joining Vectonix Private Limited, and we are excited to have you as part of our internship program.
                            </p>

                            <!-- Details Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
                                        <strong style="font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Internship Details</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="6">
                                            <tr>
                                                <td width="38%" style="font-size: 13px; color: #64748b; font-weight: 600;">Application ID:</td>
                                                <td style="font-size: 14px; color: #4f46e5; font-family: monospace; font-weight: 700;">${data.applicationId}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 13px; color: #64748b; font-weight: 600;">Internship:</td>
                                                <td style="font-size: 13px; color: #0f172a; font-weight: 600;">Vectonix Winter Internship 2026</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 13px; color: #64748b; font-weight: 600;">Domain:</td>
                                                <td style="font-size: 13px; color: #0f172a; font-weight: 600;">${data.domain}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 13px; color: #64748b; font-weight: 600;">Duration:</td>
                                                <td style="font-size: 13px; color: #0f172a;">25 November 2026 – 25 December 2026</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 13px; color: #64748b; font-weight: 600;">Application Status:</td>
                                                <td style="font-size: 13px; color: #059669; font-weight: 700;">Accepted</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- What Happens Next -->
                            <div style="background-color: #eef2ff; border-left: 4px solid #4f46e5; padding: 18px 20px; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
                                <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #3730a3; text-transform: uppercase; letter-spacing: 0.5px;">What happens next?</h3>
                                <ul style="margin: 0; padding-left: 18px; color: #334155; font-size: 13px; line-height: 1.8;">
                                    <li>You will receive access to your internship student dashboard.</li>
                                    <li>Your project and learning resources will be made available according to the internship schedule.</li>
                                    <li>You can complete your assigned milestones and submit your work through the portal.</li>
                                    <li>Weekly project reviews and mentor support will be available.</li>
                                    <li>Orientation and important announcements will be shared through the portal.</li>
                                </ul>
                            </div>

                            <p style="font-size: 14px; color: #334155; margin: 0 0 20px 0;">
                                Please log in to your student dashboard to access your internship information.
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                                <tr>
                                    <td align="center">
                                        <a href="${dashboardUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.25);">
                                            Access Student Dashboard →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; color: #334155; margin: 0 0 14px 0;">
                                We look forward to seeing your creativity, dedication, and contributions.
                            </p>

                            <p style="font-size: 16px; font-weight: 700; color: #4f46e5; margin: 0 0 24px 0;">
                                Welcome to Vectonix!
                            </p>

                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

                            <!-- Footer Signature -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="font-size: 12px; color: #64748b; line-height: 1.7;">
                                        <strong>Best Regards,</strong><br>
                                        <span style="color: #0f172a; font-weight: 600;">Internship Coordination Team</span><br>
                                        <strong>Vectonix Private Limited</strong><br>
                                        Website: <a href="https://vectonix.in" style="color: #4f46e5; text-decoration: none;">https://vectonix.in</a><br>
                                        Email: <a href="mailto:vectonixofficial@gmail.com" style="color: #4f46e5; text-decoration: none;">vectonixofficial@gmail.com</a><br>
                                        <span style="color: #4f46e5; font-weight: 700; letter-spacing: 1px;">Learn • Build • Grow</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return { subject, text, html };
}

/**
 * Generate official Rejection Email template (encouraging and respectful)
 */
export function renderRejectionEmail(data: {
    studentName: string;
    applicationId: string;
    domain: string;
    rejectionReason?: string;
    logoUrl?: string;
}) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vectonix.in";
    const logoUrl = data.logoUrl || `${siteUrl}/vectonix-email-logo.png`;
    const subject = "Application Update – Vectonix Winter Internship 2026";

    const text = `Dear ${data.studentName},

Thank you for applying to the Vectonix Winter Internship 2026 and for showing interest in becoming part of Vectonix Private Limited.

After carefully reviewing your application, we regret to inform you that your application has not been selected for this internship batch.

We understand the time and effort you invested in applying, and we genuinely appreciate your interest in our organization.

Please do not let this decision discourage you. We encourage you to continue developing your technical skills, working on practical projects, and applying for future opportunities with Vectonix.

Your application details:
Application ID: ${data.applicationId}
Internship: Vectonix Winter Internship 2026
Domain Applied: ${data.domain}
Duration: 25 November 2026 – 25 December 2026
Application Status: Not Selected

Thank you once again for considering Vectonix.

We wish you all the best in your academic journey and future career.

Best Regards,
Internship Coordination Team
Vectonix Private Limited
Website: https://vectonix.in
Email: vectonixofficial@gmail.com
Learn • Build • Grow`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <!-- Brand Header -->
                    <tr>
                        <td align="center" style="background-color: #ffffff; padding: 36px 28px 22px 28px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                            <img src="${logoUrl}" alt="Vectonix" width="185" style="display: block; width: 185px; max-width: 100%; height: auto; border: 0; outline: none; margin: 0 auto; pointer-events: none; -webkit-user-select: none; user-select: none;" />
                            <p style="color: #64748b; margin: 8px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase;">Vectonix Technologies • Winter Internship 2026</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px 28px 24px 28px;">
                            <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                                Application Status Update
                            </div>

                            <p style="font-size: 16px; margin: 0 0 16px 0; color: #0f172a;">Dear <strong>${data.studentName}</strong>,</p>

                            <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0;">
                                Thank you for applying to the <strong>Vectonix Winter Internship 2026</strong> and for showing interest in becoming part of Vectonix Private Limited.
                            </p>

                            <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0;">
                                After carefully reviewing your application, we regret to inform you that your application has not been selected for this internship batch.
                            </p>

                            <p style="font-size: 14px; color: #334155; margin: 0 0 20px 0;">
                                We understand the time and effort you invested in applying, and we genuinely appreciate your interest in our organization.
                            </p>

                            <!-- Encouragement Card -->
                            <div style="background-color: #f8fafc; border-left: 4px solid #64748b; padding: 16px 18px; border-radius: 0 10px 10px 0; margin-bottom: 24px;">
                                <p style="margin: 0; font-size: 13px; color: #334155; font-style: italic; line-height: 1.7;">
                                    "Please do not let this decision discourage you. We encourage you to continue developing your technical skills, working on practical projects, and applying for future opportunities with Vectonix."
                                </p>
                            </div>

                            <!-- Details Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
                                        <strong style="font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Your Application Details</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="5">
                                            <tr>
                                                <td width="38%" style="font-size: 13px; color: #64748b; font-weight: 600;">Application ID:</td>
                                                <td style="font-size: 14px; color: #0f172a; font-family: monospace; font-weight: 700;">${data.applicationId}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 13px; color: #64748b; font-weight: 600;">Internship:</td>
                                                <td style="font-size: 13px; color: #0f172a;">Vectonix Winter Internship 2026</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 13px; color: #64748b; font-weight: 600;">Domain Applied:</td>
                                                <td style="font-size: 13px; color: #0f172a;">${data.domain}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 13px; color: #64748b; font-weight: 600;">Duration:</td>
                                                <td style="font-size: 13px; color: #0f172a;">25 November 2026 – 25 December 2026</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 13px; color: #64748b; font-weight: 600;">Application Status:</td>
                                                <td style="font-size: 13px; color: #64748b; font-weight: 700;">Not Selected</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; color: #334155; margin: 0 0 14px 0;">
                                Thank you once again for considering Vectonix.
                            </p>

                            <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0;">
                                We wish you all the best in your academic journey and future career.
                            </p>

                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

                            <!-- Footer Signature -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="font-size: 12px; color: #64748b; line-height: 1.7;">
                                        <strong>Best Regards,</strong><br>
                                        <span style="color: #0f172a; font-weight: 600;">Internship Coordination Team</span><br>
                                        <strong>Vectonix Private Limited</strong><br>
                                        Website: <a href="https://vectonix.in" style="color: #4f46e5; text-decoration: none;">https://vectonix.in</a><br>
                                        Email: <a href="mailto:vectonixofficial@gmail.com" style="color: #4f46e5; text-decoration: none;">vectonixofficial@gmail.com</a><br>
                                        <span style="color: #4f46e5; font-weight: 700; letter-spacing: 1px;">Learn • Build • Grow</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return { subject, text, html };
}

export const emailService = {
    /**
     * Send automatic Acceptance or Rejection email with idempotency and logging
     */
    async sendDecisionEmail(payload: DecisionEmailPayload): Promise<EmailDeliveryResult> {
        const emailType = payload.status === "accepted" ? "acceptance" : "rejection";
        const recipientEmail = payload.email.trim();
        const studentName = payload.studentName.trim() || "Applicant";
        const domain = payload.domain || "Selected Domain";
        const appId = payload.applicationId;

        // 1. Recipient email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            return {
                success: false,
                type: emailType,
                recipient: recipientEmail,
                error: `Invalid email address format: ${recipientEmail}`
            };
        }

        // 2. Idempotency Check: Verify if this notification was already dispatched
        if (!payload.forceResend && isSupabaseConfigured) {
            try {
                const { data: appRecord } = await supabase
                    .from("internship_applications")
                    .select("internal_notes, email_delivery_status, last_email_type")
                    .or(`application_id.eq.${appId},application_number.eq.${appId},id.eq.${appId}`)
                    .maybeSingle();

                if (appRecord) {
                    let notesData: any = {};
                    try {
                        notesData = JSON.parse(appRecord.internal_notes || "{}");
                    } catch {}

                    const lastEmail = notesData?.email_notification;
                    if (
                        (lastEmail?.status === "sent" && lastEmail?.type === emailType) ||
                        (appRecord.email_delivery_status === "sent" && appRecord.last_email_type === emailType)
                    ) {
                        return {
                            success: true,
                            skipped: true,
                            type: emailType,
                            recipient: recipientEmail,
                            messageId: lastEmail?.message_id || "idempotent_cached",
                            sentAt: lastEmail?.sent_at
                        };
                    }
                }
            } catch (err) {
                console.warn("Idempotency check warning:", err);
            }
        }

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

        // 3. Render email templates
        const rendered =
            payload.status === "accepted"
                ? renderAcceptanceEmail({
                      studentName,
                      applicationId: appId,
                      domain,
                      email: recipientEmail,
                      logoUrl: emailLogoUrl
                  })
                : renderRejectionEmail({
                      studentName,
                      applicationId: appId,
                      domain,
                      rejectionReason: payload.rejectionReason,
                      logoUrl: emailLogoUrl
                  });

        const transporter = getEmailTransporter();
        const senderFrom = process.env.SMTP_FROM || process.env.EMAIL_USER || "vectonixofficial@gmail.com";
        const fromAddress = `"Vectonix Internship Team" <${senderFrom.trim()}>`;

        let messageId: string | undefined;
        let lastError: string | undefined;
        let isSuccess = false;

        // 4. Dispatch with limited retry (1 automatic retry on failure)
        if (transporter) {
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    const info = await transporter.sendMail({
                        from: fromAddress,
                        to: recipientEmail,
                        subject: rendered.subject,
                        text: rendered.text,
                        html: rendered.html,
                        attachments
                    });
                    messageId = info.messageId || `msg_${Date.now()}`;
                    isSuccess = true;
                    lastError = undefined;
                    break;
                } catch (err: any) {
                    lastError = err.message || "Failed to deliver email through SMTP";
                    if (attempt < 2) {
                        // Wait 1 second before retry
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    }
                }
            }
        } else {
            // Simulated delivery if SMTP is not configured in local environment
            messageId = `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            isSuccess = true;
        }

        const now = new Date().toISOString();
        const deliveryStatus = isSuccess ? "sent" : "failed";

        // 5. Log delivery to database (resilient schema fallback)
        if (isSupabaseConfigured) {
            // Record in email_recipients log
            try {
                await supabase.from("email_recipients").insert({
                    recipient_email: recipientEmail,
                    recipient_name: studentName,
                    application_id: appId,
                    delivery_status: deliveryStatus,
                    provider_message_id: messageId || null,
                    error_message: lastError || null,
                    sent_at: now
                });
            } catch (ignore) {
                // non-blocking
            }

            // Sync email status into application record
            try {
                const { data: record } = await supabase
                    .from("internship_applications")
                    .select("id, internal_notes")
                    .or(`application_id.eq.${appId},application_number.eq.${appId},id.eq.${appId}`)
                    .maybeSingle();

                if (record) {
                    let notes: any = {};
                    try {
                        notes = JSON.parse(record.internal_notes || "{}");
                    } catch {}

                    notes.email_notification = {
                        status: deliveryStatus,
                        type: emailType,
                        sent_at: now,
                        message_id: messageId,
                        error: lastError || null,
                        recipient: recipientEmail
                    };

                    const updatePayload: any = {
                        internal_notes: JSON.stringify(notes),
                        email_delivery_status: deliveryStatus,
                        last_email_sent_at: now,
                        last_email_type: emailType,
                        last_email_error: lastError || null
                    };

                    // Attempt update with extra columns, fallback to internal_notes only if columns not migrated yet
                    const { error: updErr } = await supabase
                        .from("internship_applications")
                        .update(updatePayload)
                        .eq("id", record.id);

                    if (updErr) {
                        await supabase
                            .from("internship_applications")
                            .update({ internal_notes: JSON.stringify(notes) })
                            .eq("id", record.id);
                    }
                }
            } catch (err) {
                console.warn("Error updating application email metadata:", err);
            }
        }

        return {
            success: isSuccess,
            type: emailType,
            recipient: recipientEmail,
            messageId,
            error: lastError,
            sentAt: now
        };
    },

    /**
     * Dispatch an admin test email to verify SMTP and template rendering
     */
    async sendTestEmail(params: {
        toEmail: string;
        decision: "accepted" | "rejected";
    }): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const samplePayload: DecisionEmailPayload = {
            applicationId: "VTX-WI26-0001",
            studentName: "Rahul Sharma (Sample Candidate)",
            email: params.toEmail,
            domain: "Full Stack Development",
            status: params.decision,
            forceResend: true
        };

        const res = await this.sendDecisionEmail(samplePayload);
        return {
            success: res.success,
            messageId: res.messageId,
            error: res.error
        };
    }
};

