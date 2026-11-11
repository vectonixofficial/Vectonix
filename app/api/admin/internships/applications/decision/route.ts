import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { emailService, renderAcceptanceEmail, renderRejectionEmail } from "@/lib/services/emailService";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            applicationId,
            status,
            internalNotes,
            forceResend = false,
            testEmail,
            previewOnly = false
        } = body;

        if (!status || (status !== "accepted" && status !== "rejected")) {
            return NextResponse.json(
                { error: "Valid status ('accepted' or 'rejected') is required." },
                { status: 400 }
            );
        }

        // 1. TEST EMAIL MODE
        if (testEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(testEmail)) {
                return NextResponse.json({ error: "Invalid test email address format." }, { status: 400 });
            }

            const testResult = await emailService.sendTestEmail({
                toEmail: testEmail,
                decision: status
            });

            return NextResponse.json({
                success: testResult.success,
                isTest: true,
                message: testResult.success
                    ? `Test ${status} email dispatched successfully to ${testEmail}`
                    : `Test email delivery failed: ${testResult.error}`,
                details: testResult
            });
        }

        if (!applicationId) {
            return NextResponse.json({ error: "applicationId is required." }, { status: 400 });
        }

        // 2. Fetch current application record
        let appRecord: any = null;
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from("internship_applications")
                .select("*")
                .or(`id.eq.${applicationId},application_id.eq.${applicationId},application_number.eq.${applicationId}`)
                .maybeSingle();

            if (error) {
                console.warn("Supabase query error in decision API:", error.message);
            }
            appRecord = data;
        }

        if (!appRecord) {
            return NextResponse.json(
                { error: `Application not found for ID: ${applicationId}` },
                { status: 404 }
            );
        }

        const studentName = appRecord.full_name || "Applicant";
        const studentEmail = appRecord.email || appRecord.mobile_number || "";
        const studentDomain = appRecord.internship_domain || appRecord.domain || "Selected Domain";
        const officialAppId = appRecord.application_id || appRecord.application_number || appRecord.id;

        // 3. PREVIEW EMAIL MODE (For Admin "View Email" feature)
        if (previewOnly) {
            const logoPath = path.join(process.cwd(), "public/vectonix-logo.png");
            let previewLogoUrl = "https://vectonix.in/vectonix-logo.png";
            try {
                if (fs.existsSync(logoPath)) {
                    const b64 = fs.readFileSync(logoPath).toString("base64");
                    previewLogoUrl = `data:image/png;base64,${b64}`;
                }
            } catch {}

            const previewData =
                status === "accepted"
                    ? renderAcceptanceEmail({
                          studentName,
                          applicationId: officialAppId,
                          domain: studentDomain,
                          email: studentEmail,
                          logoUrl: previewLogoUrl
                      })
                    : renderRejectionEmail({
                          studentName,
                          applicationId: officialAppId,
                          domain: studentDomain,
                          rejectionReason: internalNotes || appRecord.internal_notes,
                          logoUrl: previewLogoUrl
                      });

            return NextResponse.json({
                success: true,
                preview: {
                    subject: previewData.subject,
                    html: previewData.html,
                    text: previewData.text,
                    recipient: studentEmail,
                    studentName,
                    applicationId: officialAppId,
                    domain: studentDomain,
                    type: status
                }
            });
        }

        const previousStatus = appRecord.status || appRecord.application_status || "pending";
        const isStatusChanging = previousStatus !== status;

        // 4. Update Application Status in Database
        let updatedNotes = appRecord.internal_notes || "";
        if (internalNotes !== undefined) {
            try {
                let parsed = JSON.parse(appRecord.internal_notes || "{}");
                if (typeof parsed !== "object" || parsed === null) parsed = {};
                parsed.admin_note = internalNotes;
                parsed.status_updated_at = new Date().toISOString();
                updatedNotes = JSON.stringify(parsed);
            } catch {
                updatedNotes = internalNotes;
            }
        }

        if (isSupabaseConfigured) {
            const updatePayload: any = {
                status,
                application_status: status,
                internal_notes: updatedNotes,
                updated_at: new Date().toISOString()
            };

            const { error: updateErr } = await supabase
                .from("internship_applications")
                .update(updatePayload)
                .eq("id", appRecord.id);

            if (updateErr) {
                return NextResponse.json(
                    { error: `Failed to update application status: ${updateErr.message}` },
                    { status: 500 }
                );
            }
        }

        // 5. Automatic Email Trigger Rules:
        // Trigger if:
        // a) forceResend is true (Admin clicked "Resend Email")
        // b) status is actually transitioning (e.g. pending -> accepted, pending -> rejected)
        let emailResult: any = null;

        if (isStatusChanging || forceResend) {
            emailResult = await emailService.sendDecisionEmail({
                applicationId: officialAppId,
                studentName,
                email: studentEmail,
                domain: studentDomain,
                status,
                rejectionReason: internalNotes,
                forceResend
            });
        } else {
            emailResult = {
                success: true,
                skipped: true,
                reason: `Application was already ${status}. No duplicate notification sent.`
            };
        }

        return NextResponse.json({
            success: true,
            status,
            previousStatus,
            applicationId: officialAppId,
            emailDelivery: emailResult,
            message: emailResult.skipped
                ? `Application status kept as ${status} (email notification skipped: duplicate)`
                : emailResult.success
                ? `Application marked as ${status} and decision email sent to ${studentEmail}.`
                : `Application marked as ${status}, but email delivery failed: ${emailResult.error}`
        });
    } catch (err: any) {
        console.error("Decision API fatal error:", err);
        return NextResponse.json(
            { error: err.message || "Internal server error processing application decision." },
            { status: 500 }
        );
    }
}

