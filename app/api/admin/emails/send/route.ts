import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

function replacePlaceholders(template: string, data: Record<string, string>): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
        return data[key] !== undefined ? data[key] : `{{${key}}}`;
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            subject,
            message,
            recipients = [],
            filterCriteria = {},
            isPromotional = false,
            testEmailOnly = null,
            adminUser = "admin@vectonix.in"
        } = body;

        if (!subject || !message) {
            return NextResponse.json({ error: "Subject and Message are required" }, { status: 400 });
        }

        const transporter = getTransporter();
        const senderEmail = process.env.SMTP_FROM || process.env.EMAIL_USER || "vectonixofficial@gmail.com";

        // TEST EMAIL MODE
        if (testEmailOnly) {
            const sampleData = {
                student_name: "Rahul Sharma (Sample)",
                application_id: "VTX-WI26-0001",
                email: testEmailOnly,
                college_name: "V.S.B. Engineering College",
                internship_domain: "Full Stack Development",
                package_name: "Premium (₹999)",
            };

            const renderedSubject = `[TEST] ${replacePlaceholders(subject, sampleData)}`;
            const renderedHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
                    <div style="background-color: #f1f5f9; border-bottom: 2px dashed #94a3b8; padding: 10px; font-size: 12px; color: #475569; text-align: center;">
                        <strong>THIS IS A PREVIEW TEST EMAIL</strong>
                    </div>
                    <div style="padding: 24px;">
                        ${replacePlaceholders(message, sampleData).replace(/\n/g, "<br>")}
                    </div>
                </div>
            `;

            if (transporter) {
                await transporter.sendMail({
                    from: `"Vectonix Admin" <${senderEmail}>`,
                    to: testEmailOnly,
                    subject: renderedSubject,
                    html: renderedHtml,
                });
            }

            return NextResponse.json({
                success: true,
                message: `Test email dispatched to ${testEmailOnly} (simulated or sent)`,
                isTest: true
            });
        }

        if (recipients.length === 0) {
            return NextResponse.json({ error: "No recipients provided" }, { status: 400 });
        }

        // BATCH PROCESSING
        const campaignCode = `CAMP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        let sentCount = 0;
        let failedCount = 0;
        const recipientResults: any[] = [];

        // Save campaign record if Supabase is available
        let campaignDbId: string | null = null;
        if (isSupabaseConfigured) {
            try {
                const { data: cData } = await supabase
                    .from("email_campaigns")
                    .insert({
                        campaign_id: campaignCode,
                        subject,
                        message,
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
                    };

                    const personalizedSubject = replacePlaceholders(subject, recipientData);
                    let personalizedBody = replacePlaceholders(message, recipientData).replace(/\n/g, "<br>");

                    if (isPromotional) {
                        personalizedBody += `
                            <br><br>
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                            <p style="font-size: 11px; color: #94a3b8; text-align: center;">
                                You received this promotional email because you opted in during Vectonix registration.<br>
                                <a href="https://vectonix.in/privacy" style="color: #6366f1;">Privacy Policy</a> • 
                                <a href="mailto:vectonixofficial@gmail.com?subject=Unsubscribe" style="color: #6366f1;">Unsubscribe</a>
                            </p>
                        `;
                    }

                    try {
                        let providerMessageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

                        if (transporter) {
                            const info = await transporter.sendMail({
                                from: `"Vectonix Technologies" <${senderEmail}>`,
                                to: rcp.email, // STRICTLY INDIVIDUAL RECIPIENT
                                subject: personalizedSubject,
                                html: personalizedBody,
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

        // Update campaign status
        if (campaignDbId && isSupabaseConfigured) {
            await supabase
                .from("email_campaigns")
                .update({
                    sent_count: sentCount,
                    failed_count: failedCount,
                    status: failedCount === 0 ? "completed" : "failed",
                    updated_at: new Date().toISOString()
                })
                .eq("id", campaignDbId);
        }

        return NextResponse.json({
            success: true,
            campaignCode,
            totalRecipients: recipients.length,
            sentCount,
            failedCount,
            results: recipientResults
        });
    } catch (err: any) {
        console.error("Bulk email failure:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
