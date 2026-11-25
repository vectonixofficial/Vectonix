import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getEmailTransporter } from "@/lib/services/emailService";
import {
    renderVectonixBrandedEmail,
    VectonixEmailContent,
    SAMPLE_CANDIDATE_DATA
} from "@/lib/services/emailTemplateService";

function getTransporter() {
    return getEmailTransporter();
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            subject,
            message,
            templateContent,
            recipients = [],
            filterCriteria = {},
            isPromotional = false,
            testEmailOnly = null,
            adminUser = "admin@vectonix.in"
        } = body;

        // Base email content either from structured templateContent or from subject/message
        const emailContent: VectonixEmailContent = templateContent || {
            subject: subject || "Vectonix Winter Internship 2026 Update",
            badgeText: isPromotional ? "Announcement" : "Internship Notice",
            badgeVariant: "info",
            greeting: "Hello {{student_name}},",
            messageBody: message || "",
            showCtaButton: true,
            ctaButtonText: "Access Student Dashboard →",
            ctaButtonUrl: "https://vectonix.in/internship/login"
        };

        if (!emailContent.subject || !emailContent.messageBody) {
            return NextResponse.json({ error: "Subject and Message body are required" }, { status: 400 });
        }

        const transporter = getTransporter();
        const senderEmail = process.env.SMTP_FROM || process.env.EMAIL_USER || "vectonixofficial@gmail.com";
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vectonix.in";

        // Prepare local CID attachment if logo exists on disk
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

        // =========================================================================
        // 1. TEST EMAIL DISPATCH MODE
        // =========================================================================
        if (testEmailOnly) {
            const sampleVariables = {
                ...SAMPLE_CANDIDATE_DATA.full_stack,
                email: testEmailOnly,
                student_name: "Rahul Sharma (Admin Test)",
                application_id: "VTX-WI26-TEST"
            };

            const rendered = renderVectonixBrandedEmail(emailContent, sampleVariables, {
                logoUrl: emailLogoUrl,
                isPreview: true
            });

            const testSubject = `[TEST PREVIEW] ${rendered.subject}`;

            if (transporter) {
                try {
                    await transporter.sendMail({
                        from: `"Vectonix Admin Preview" <${senderEmail}>`,
                        to: testEmailOnly,
                        subject: testSubject,
                        text: rendered.text,
                        html: rendered.html,
                        attachments
                    });
                } catch (sendErr: any) {
                    console.error("Test email SMTP error:", sendErr);
                    return NextResponse.json(
                        { error: `SMTP delivery failed: ${sendErr.message}` },
                        { status: 500 }
                    );
                }
            }

            return NextResponse.json({
                success: true,
                message: `Test email successfully dispatched to ${testEmailOnly}`,
                isTest: true,
                renderedSubject: testSubject
            });
        }

        // =========================================================================
        // 2. CAMPAIGN BROADCAST MODE
        // =========================================================================
        if (recipients.length === 0) {
            return NextResponse.json({ error: "No recipients provided" }, { status: 400 });
        }

        const campaignCode = `CAMP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        let sentCount = 0;
        let failedCount = 0;
        const recipientResults: any[] = [];

        // Save campaign record in database
        let campaignDbId: string | null = null;
        if (isSupabaseConfigured) {
            try {
                const { data: cData } = await supabase
                    .from("email_campaigns")
                    .insert({
                        campaign_id: campaignCode,
                        subject: emailContent.subject,
                        message: emailContent.messageBody,
                        created_by: adminUser,
                        total_recipients: recipients.length,
                        sent_count: 0,
                        failed_count: 0,
                        status: "sending",
                        filter_criteria: filterCriteria
                    })
                    .select()
                    .single();

                if (cData) campaignDbId = cData.id;
            } catch (cErr) {
                console.warn("Could not record campaign in DB:", cErr);
            }
        }

        // Process in chunks of 5 with 250ms spacing
        const CHUNK_SIZE = 5;
        for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
            const chunk = recipients.slice(i, i + CHUNK_SIZE);

            await Promise.all(
                chunk.map(async (rcp: any) => {
                    const recipientData = {
                        student_name: rcp.studentName || rcp.name || "Student",
                        application_id: rcp.applicationId || "VTX-WI26-XXXX",
                        email: rcp.email,
                        college_name: rcp.collegeName || "N/A",
                        internship_domain: rcp.domain || "Winter Internship",
                        package_name: rcp.packageName || "Standard",
                        application_status: rcp.status || "Accepted",
                        project_name: rcp.projectName || "Capstone Internship Project",
                        mentor_name: rcp.mentorName || "Vectonix Technical Mentor",
                        milestone_name: rcp.milestoneName || "Milestone 1",
                        meeting_date: rcp.meetingDate || "November 25, 2026",
                        meeting_time: rcp.meetingTime || "6:00 PM – 7:00 PM IST",
                        meeting_link: rcp.meetingLink || "https://meet.google.com/vtx-wi26-ind",
                        dashboard_link: `https://vectonix.in/internship/login?appId=${encodeURIComponent(
                            rcp.applicationId || ""
                        )}&email=${encodeURIComponent(rcp.email || "")}`
                    };

                    const rendered = renderVectonixBrandedEmail(emailContent, recipientData, {
                        logoUrl: emailLogoUrl
                    });

                    let finalHtml = rendered.html;
                    if (isPromotional) {
                        // Append opt-out notice
                        const optOutBlock = `
                            <div style="padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
                                You received this communication because you registered for the Vectonix Winter Internship 2026.<br>
                                <a href="https://vectonix.in/privacy" style="color: #6366f1;">Privacy Policy</a> • 
                                <a href="mailto:vectonixofficial@gmail.com?subject=Unsubscribe" style="color: #6366f1;">Contact Support</a>
                            </div>
                        `;
                        finalHtml = finalHtml.replace("</body>", `${optOutBlock}</body>`);
                    }

                    try {
                        let providerMessageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

                        if (transporter) {
                            const info = await transporter.sendMail({
                                from: `"Vectonix Technologies" <${senderEmail}>`,
                                to: rcp.email, // STRICTLY INDIVIDUAL RECIPIENT
                                subject: rendered.subject,
                                text: rendered.text,
                                html: finalHtml,
                                attachments
                            });
                            providerMessageId = info.messageId || providerMessageId;
                        }

                        sentCount++;
                        recipientResults.push({
                            email: rcp.email,
                            status: "sent",
                            providerMessageId
                        });

                        if (campaignDbId && isSupabaseConfigured) {
                            await supabase.from("email_recipients").insert({
                                campaign_id: campaignDbId,
                                application_id: rcp.applicationIdDb || null,
                                recipient_email: rcp.email,
                                recipient_name: rcp.studentName,
                                delivery_status: "sent",
                                provider_message_id: providerMessageId,
                                sent_at: new Date().toISOString()
                            });
                        }
                    } catch (sendErr: any) {
                        console.error(`Error sending email to ${rcp.email}:`, sendErr);
                        failedCount++;
                        recipientResults.push({
                            email: rcp.email,
                            status: "failed",
                            error: sendErr.message
                        });

                        if (campaignDbId && isSupabaseConfigured) {
                            await supabase.from("email_recipients").insert({
                                campaign_id: campaignDbId,
                                application_id: rcp.applicationIdDb || null,
                                recipient_email: rcp.email,
                                recipient_name: rcp.studentName,
                                delivery_status: "failed",
                                error_message: sendErr.message
                            });
                        }
                    }
                })
            );

            // Rate-limiting delay between chunks
            if (i + CHUNK_SIZE < recipients.length) {
                await new Promise((resolve) => setTimeout(resolve, 250));
            }
        }

        // Finalize campaign record in DB
        if (campaignDbId && isSupabaseConfigured) {
            try {
                await supabase
                    .from("email_campaigns")
                    .update({
                        sent_count: sentCount,
                        failed_count: failedCount,
                        status: failedCount === recipients.length ? "failed" : "completed",
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", campaignDbId);
            } catch (finErr) {
                console.warn("Could not finalize campaign in DB:", finErr);
            }
        }

        return NextResponse.json({
            success: true,
            campaignCode,
            total: recipients.length,
            sent: sentCount,
            failed: failedCount,
            results: recipientResults
        });
    } catch (err: any) {
        console.error("Critical error in email batch API:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
