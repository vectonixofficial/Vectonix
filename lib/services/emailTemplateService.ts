/**
 * VECTONIX TECHNOLOGIES — DEFAULT BRANDED EMAIL TEMPLATE SYSTEM
 * 
 * Reusable, production-grade email rendering engine for the Vectonix Winter Internship 2026.
 * Enforces corporate Vectonix branding, logo placement, typography, card styling, and footer
 * while allowing full dynamic editing of subject, message body, status badges, details cards,
 * bullet lists, meeting links, and CTA buttons.
 */

export interface EmailDetailItem {
    label: string;
    value: string;
    isCode?: boolean;
    highlight?: boolean;
}

export interface EmailMeetingDetails {
    date: string;
    time: string;
    platform?: string;
    link: string;
    agenda?: string;
}

export interface VectonixEmailContent {
    id?: string;
    templateName?: string;
    category?: string;
    subject: string;
    badgeText?: string;
    badgeVariant?: "success" | "info" | "warning" | "danger" | "neutral";
    title?: string;
    greeting?: string;
    messageBody: string;
    
    // Optional Details Table Card
    showDetailsCard?: boolean;
    detailsCardTitle?: string;
    detailsItems?: EmailDetailItem[];
    
    // Optional Highlight Info Box (e.g. "What happens next?" or "Important Notice")
    showInfoCard?: boolean;
    infoCardTitle?: string;
    infoCardBullets?: string[];
    
    // Optional Meeting Details Box
    showMeetingCard?: boolean;
    meetingDetails?: EmailMeetingDetails;
    
    // Optional Call-to-Action Button
    showCtaButton?: boolean;
    ctaButtonText?: string;
    ctaButtonUrl?: string;
    
    // Closing Statement
    closingMessage?: string;
    
    isDefault?: boolean;
    isSystem?: boolean;
    updatedAt?: string;
}

export interface RenderedEmailOutput {
    subject: string;
    text: string;
    html: string;
}

export interface VariableValidationResult {
    isValid: boolean;
    missingVariables: string[];
    foundVariables: string[];
}

/**
 * Standard dynamic variables supported across all Vectonix email templates
 */
export const SUPPORTED_VARIABLES = [
    { key: "{{student_name}}", label: "Student Full Name", sample: "Rahul Sharma" },
    { key: "{{application_id}}", label: "Application ID", sample: "VTX-WI26-0142" },
    { key: "{{internship_domain}}", label: "Internship Domain", sample: "Full Stack Development" },
    { key: "{{package_name}}", label: "Package Name", sample: "Premium (₹999)" },
    { key: "{{college_name}}", label: "College / University", sample: "V.S.B. Engineering College" },
    { key: "{{application_status}}", label: "Application Status", sample: "Accepted" },
    { key: "{{project_name}}", label: "Allocated Project Title", sample: "Smart Campus ERP & Student Analytics Portal" },
    { key: "{{mentor_name}}", label: "Mentor Name", sample: "Dr. Ananya Sen" },
    { key: "{{milestone_name}}", label: "Milestone Name", sample: "Milestone 1: Architecture & Design Rubric" },
    { key: "{{meeting_date}}", label: "Meeting / Review Date", sample: "November 25, 2026" },
    { key: "{{meeting_time}}", label: "Meeting Time", sample: "6:00 PM – 7:00 PM IST" },
    { key: "{{meeting_link}}", label: "Meeting Link", sample: "https://meet.google.com/vtx-wi26-ind" },
    { key: "{{dashboard_link}}", label: "Student Portal Link", sample: "https://vectonix.in/internship/login" },
] as const;

/**
 * Sample candidate context for live previewing and testing
 */
export const SAMPLE_CANDIDATE_DATA: Record<string, Record<string, string>> = {
    full_stack: {
        student_name: "Rahul Sharma",
        application_id: "VTX-WI26-0142",
        internship_domain: "Full Stack Development",
        package_name: "Premium (₹999)",
        college_name: "V.S.B. Engineering College",
        application_status: "Accepted",
        project_name: "Smart Campus ERP & Student Analytics Portal",
        mentor_name: "Dr. Ananya Sen",
        milestone_name: "Milestone 1: Architecture & System Wireframes",
        meeting_date: "November 25, 2026",
        meeting_time: "6:00 PM – 7:00 PM IST",
        meeting_link: "https://meet.google.com/vtx-wi26-ind",
        dashboard_link: "https://vectonix.in/internship/login",
    },
    aiml: {
        student_name: "Priya Patel",
        application_id: "VTX-WI26-0205",
        internship_domain: "AI / Machine Learning",
        package_name: "Standard (₹749)",
        college_name: "Anna University, Chennai",
        application_status: "Accepted",
        project_name: "AI Resume Analyzer & Career Recommendation System",
        mentor_name: "Karthik Subramanian",
        milestone_name: "Milestone 1: Model Architecture & NLP Pipeline",
        meeting_date: "November 25, 2026",
        meeting_time: "6:00 PM – 7:00 PM IST",
        meeting_link: "https://meet.google.com/vtx-wi26-aiml",
        dashboard_link: "https://vectonix.in/internship/login",
    },
    robotics: {
        student_name: "Arjun Verma",
        application_id: "VTX-WI26-0318",
        internship_domain: "Robotics",
        package_name: "Free Package (₹0)",
        college_name: "PSG College of Technology",
        application_status: "Accepted",
        project_name: "Autonomous Warehouse Navigation Robot",
        mentor_name: "Divya Nambiar",
        milestone_name: "Milestone 1: Gazebo URDF World Setup",
        meeting_date: "November 25, 2026",
        meeting_time: "6:00 PM – 7:00 PM IST",
        meeting_link: "https://meet.google.com/vtx-wi26-rob",
        dashboard_link: "https://vectonix.in/internship/login",
    }
};

/**
 * Replace all {{variable}} occurrences in a string safely
 */
export function resolveVariables(text: string, variables: Record<string, string>): string {
    if (!text) return "";
    return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
        if (variables[key] !== undefined && variables[key] !== null) {
            return String(variables[key]);
        }
        return match;
    });
}

/**
 * Validate whether an email content string contains any unresolved variables
 */
export function validateVariables(content: VectonixEmailContent, variables: Record<string, string>): VariableValidationResult {
    const rawContent = [
        content.subject,
        content.title,
        content.greeting,
        content.messageBody,
        content.ctaButtonText,
        content.ctaButtonUrl,
        content.closingMessage,
        ...(content.infoCardBullets || []),
        ...(content.detailsItems || []).map((i) => `${i.label} ${i.value}`)
    ].filter(Boolean).join(" ");

    const matches = rawContent.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) || [];
    const uniqueKeys = Array.from(new Set(matches.map((m) => m.replace(/[\{\}\s]/g, ""))));

    const missingVariables: string[] = [];
    const foundVariables: string[] = [];

    uniqueKeys.forEach((k) => {
        if (variables[k] === undefined || variables[k] === null || variables[k].trim() === "") {
            missingVariables.push(`{{${k}}}`);
        } else {
            foundVariables.push(`{{${k}}}`);
        }
    });

    return {
        isValid: missingVariables.length === 0,
        missingVariables,
        foundVariables
    };
}

/**
 * Get CSS badge colors for status indicators
 */
function getBadgeStyles(variant: VectonixEmailContent["badgeVariant"] = "info") {
    switch (variant) {
        case "success":
            return {
                bg: "#ecfdf5",
                border: "#a7f3d0",
                text: "#047857"
            };
        case "warning":
            return {
                bg: "#fffbeb",
                border: "#fde68a",
                text: "#b45309"
            };
        case "danger":
            return {
                bg: "#fff1f2",
                border: "#fecdd3",
                text: "#be123c"
            };
        case "neutral":
            return {
                bg: "#f1f5f9",
                border: "#cbd5e1",
                text: "#475569"
            };
        case "info":
        default:
            return {
                bg: "#eef2ff",
                border: "#c7d2fe",
                text: "#4338ca"
            };
    }
}

/**
 * Render the definitive, responsive, client-compatible Vectonix branded HTML email.
 * This layout is fixed and ensures 100% brand consistency across Gmail, Outlook, and mobile clients.
 */
export function renderVectonixBrandedEmail(
    content: VectonixEmailContent,
    variables: Record<string, string> = SAMPLE_CANDIDATE_DATA.full_stack,
    options: { logoUrl?: string; isPreview?: boolean } = {}
): RenderedEmailOutput {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vectonix.in";
    const defaultLogo = `${siteUrl}/vectonix-email-logo.png`;
    const logoUrl = options.logoUrl || defaultLogo;

    // Resolve all variables in editable fields
    const resolvedSubject = resolveVariables(content.subject, variables);
    const resolvedBadge = content.badgeText ? resolveVariables(content.badgeText, variables) : undefined;
    const resolvedTitle = content.title ? resolveVariables(content.title, variables) : undefined;
    const resolvedGreeting = content.greeting ? resolveVariables(content.greeting, variables) : undefined;
    const resolvedMessage = resolveVariables(content.messageBody, variables);
    const resolvedCtaText = content.ctaButtonText ? resolveVariables(content.ctaButtonText, variables) : "Access Student Dashboard →";
    const resolvedCtaUrl = content.ctaButtonUrl ? resolveVariables(content.ctaButtonUrl, variables) : "https://vectonix.in/internship/login";
    const resolvedClosing = content.closingMessage ? resolveVariables(content.closingMessage, variables) : undefined;

    // Badge styling
    const badgeStyle = getBadgeStyles(content.badgeVariant);

    // Format message paragraphs
    const paragraphs = resolvedMessage
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

    // Construct plain text version
    const textLines: string[] = [];
    if (resolvedGreeting) textLines.push(resolvedGreeting, "");
    if (resolvedTitle) textLines.push(resolvedTitle.toUpperCase(), "");
    paragraphs.forEach((p) => textLines.push(p, ""));

    if (content.showDetailsCard && content.detailsItems && content.detailsItems.length > 0) {
        textLines.push("--- " + (content.detailsCardTitle || "INTERNSHIP DETAILS") + " ---");
        content.detailsItems.forEach((item) => {
            textLines.push(`${resolveVariables(item.label, variables)}: ${resolveVariables(item.value, variables)}`);
        });
        textLines.push("");
    }

    if (content.showInfoCard && content.infoCardBullets && content.infoCardBullets.length > 0) {
        textLines.push("--- " + (content.infoCardTitle || "WHAT HAPPENS NEXT") + " ---");
        content.infoCardBullets.forEach((bullet) => {
            textLines.push(`• ${resolveVariables(bullet, variables)}`);
        });
        textLines.push("");
    }

    if (content.showMeetingCard && content.meetingDetails) {
        textLines.push("--- MEETING DETAILS ---");
        textLines.push(`Date: ${resolveVariables(content.meetingDetails.date, variables)}`);
        textLines.push(`Time: ${resolveVariables(content.meetingDetails.time, variables)}`);
        if (content.meetingDetails.platform) textLines.push(`Platform: ${content.meetingDetails.platform}`);
        textLines.push(`Link: ${resolveVariables(content.meetingDetails.link, variables)}`);
        textLines.push("");
    }

    if (content.showCtaButton) {
        textLines.push(`${resolvedCtaText}: ${resolvedCtaUrl}`, "");
    }

    if (resolvedClosing) {
        textLines.push(resolvedClosing, "");
    }

    textLines.push(
        "Best Regards,",
        "Team Vectonix Technologies",
        "Vectonix Private Limited",
        "Website: https://vectonix.in",
        "Email: vectonixofficial@gmail.com",
        "Helpline: 6382340278 / 7538872586",
        "Learn • Build • Grow"
    );

    const textOutput = textLines.join("\n");

    // Construct HTML email version
    const htmlOutput = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${resolvedSubject}</title>
    <!--[if mso]>
    <style type="text/css">
        table { border-collapse: collapse; }
        body, table, td, p, a, li { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; width: 100%; min-width: 100%; padding: 24px 12px;">
        <tr>
            <td align="center" style="padding: 0;">
                <!-- Main Email Card -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    
                    <!-- Fixed Header (Original Vectonix Logo & Subtitle) -->
                    <tr>
                        <td align="center" style="background-color: #ffffff; padding: 36px 28px 22px 28px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                            <img src="${logoUrl}" alt="Vectonix Technologies" width="185" style="display: block; width: 185px; max-width: 100%; height: auto; border: 0; outline: none; margin: 0 auto; pointer-events: none; -webkit-user-select: none; user-select: none;" />
                            <p style="color: #64748b; margin: 8px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase;">
                                VECTONIX TECHNOLOGIES • WINTER INTERNSHIP 2026
                            </p>
                        </td>
                    </tr>

                    <!-- Main Dynamic Content Area -->
                    <tr>
                        <td style="padding: 32px 28px 24px 28px;">
                            
                            <!-- Dynamic Status Badge -->
                            ${
                                resolvedBadge
                                    ? `<div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: ${badgeStyle.bg}; border: 1px solid ${badgeStyle.border}; color: ${badgeStyle.text}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                                        ${resolvedBadge}
                                       </div>`
                                    : ""
                            }

                            <!-- Greeting -->
                            ${
                                resolvedGreeting
                                    ? `<p style="font-size: 15px; margin: 0 0 14px 0; color: #0f172a; line-height: 1.5;">${resolvedGreeting}</p>`
                                    : ""
                            }

                            <!-- Headline / Title -->
                            ${
                                resolvedTitle
                                    ? `<h1 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; line-height: 1.35; letter-spacing: -0.2px;">
                                        ${resolvedTitle}
                                       </h1>`
                                    : ""
                            }

                            <!-- Message Paragraphs -->
                            ${paragraphs
                                .map(
                                    (para) =>
                                        `<p style="font-size: 14px; color: #334155; margin: 0 0 16px 0; line-height: 1.7;">${para.replace(
                                            /\n/g,
                                            "<br>"
                                        )}</p>`
                                )
                                .join("")}

                            <!-- Optional Details Card -->
                            ${
                                content.showDetailsCard && content.detailsItems && content.detailsItems.length > 0
                                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0 24px 0; overflow: hidden;">
                                        <tr>
                                            <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
                                                <strong style="font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    ${content.detailsCardTitle || "Internship Information"}
                                                </strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 14px 20px;">
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="6" border="0">
                                                    ${content.detailsItems
                                                        .map((item) => {
                                                            const itemLabel = resolveVariables(item.label, variables);
                                                            const itemValue = resolveVariables(item.value, variables);
                                                            return `<tr>
                                                                <td width="38%" style="font-size: 13px; color: #64748b; font-weight: 600; padding: 4px 0;">${itemLabel}:</td>
                                                                <td style="font-size: 13px; color: ${
                                                                    item.highlight ? "#4f46e5; font-weight: 700;" : "#0f172a;"
                                                                } ${item.isCode ? "font-family: monospace; font-size: 14px; font-weight: 700;" : ""} padding: 4px 0;">
                                                                    ${itemValue}
                                                                </td>
                                                            </tr>`;
                                                        })
                                                        .join("")}
                                                </table>
                                            </td>
                                        </tr>
                                       </table>`
                                    : ""
                            }

                            <!-- Optional Highlight Info Card ("What happens next?" or "Important Notice") -->
                            ${
                                content.showInfoCard && content.infoCardBullets && content.infoCardBullets.length > 0
                                    ? `<div style="background-color: #eef2ff; border-left: 4px solid #4f46e5; padding: 18px 20px; border-radius: 0 12px 12px 0; margin: 20px 0 24px 0;">
                                        <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #3730a3; text-transform: uppercase; letter-spacing: 0.5px;">
                                            ${content.infoCardTitle || "What Happens Next?"}
                                        </h3>
                                        <ul style="margin: 0; padding-left: 18px; color: #334155; font-size: 13px; line-height: 1.8;">
                                            ${content.infoCardBullets
                                                .map((bullet) => `<li>${resolveVariables(bullet, variables)}</li>`)
                                                .join("")}
                                        </ul>
                                       </div>`
                                    : ""
                            }

                            <!-- Optional Meeting Card -->
                            ${
                                content.showMeetingCard && content.meetingDetails
                                    ? `<div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 18px 20px; margin: 20px 0 24px 0;">
                                        <div style="font-size: 12px; font-weight: 700; color: #7e22ce; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                                            📅 Orientation & Review Meeting Details
                                        </div>
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="4" border="0" style="font-size: 13px;">
                                            <tr>
                                                <td width="30%" style="color: #6b21a8; font-weight: 600;">Date:</td>
                                                <td style="color: #0f172a; font-weight: 600;">${resolveVariables(content.meetingDetails.date, variables)}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #6b21a8; font-weight: 600;">Time:</td>
                                                <td style="color: #0f172a; font-weight: 600;">${resolveVariables(content.meetingDetails.time, variables)}</td>
                                            </tr>
                                            ${
                                                content.meetingDetails.platform
                                                    ? `<tr>
                                                        <td style="color: #6b21a8; font-weight: 600;">Platform:</td>
                                                        <td style="color: #0f172a;">${content.meetingDetails.platform}</td>
                                                       </tr>`
                                                    : ""
                                            }
                                            <tr>
                                                <td style="color: #6b21a8; font-weight: 600;">Meeting Link:</td>
                                                <td>
                                                    <a href="${resolveVariables(content.meetingDetails.link, variables)}" style="color: #7e22ce; font-weight: 700; text-decoration: underline;" target="_blank">
                                                        Click Here to Join Meeting →
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                       </div>`
                                    : ""
                            }

                            <!-- Optional Call-to-Action Button -->
                            ${
                                content.showCtaButton
                                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0 24px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="${resolvedCtaUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.25);">
                                                    ${resolvedCtaText}
                                                </a>
                                            </td>
                                        </tr>
                                       </table>`
                                    : ""
                            }

                            <!-- Closing Message -->
                            ${
                                resolvedClosing
                                    ? `<p style="font-size: 14px; font-weight: 600; color: #4f46e5; margin: 20px 0 24px 0; line-height: 1.6;">
                                        ${resolvedClosing}
                                       </p>`
                                    : ""
                            }

                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

                            <!-- Fixed Corporate Footer Signature -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="font-size: 12px; color: #64748b; line-height: 1.7;">
                                        <strong>Best Regards,</strong><br>
                                        <span style="color: #0f172a; font-weight: 700;">Team Vectonix Technologies</span><br>
                                        <span style="color: #475569; font-size: 11px;">Internship Coordination Team</span><br>
                                        <strong>VECTONIX PRIVATE LIMITED</strong><br>
                                        Website: <a href="https://vectonix.in" target="_blank" style="color: #4f46e5; text-decoration: none;">https://vectonix.in</a><br>
                                        Official Email: <a href="mailto:vectonixofficial@gmail.com" style="color: #4f46e5; text-decoration: none;">vectonixofficial@gmail.com</a><br>
                                        Student Helpline: <span style="color: #0f172a; font-weight: 600;">6382340278 / 7538872586</span><br>
                                        <span style="color: #4f46e5; font-weight: 700; letter-spacing: 0.8px;">Learn • Build • Grow</span>
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

    return {
        subject: resolvedSubject,
        text: textOutput,
        html: htmlOutput
    };
}

/**
 * 9 Standard Factory Templates covering every stage of the Vectonix Winter Internship
 */
export const DEFAULT_VECTONIX_TEMPLATES: VectonixEmailContent[] = [
    // 1. Application Received / Acknowledgement
    {
        id: "tpl_app_received",
        templateName: "Application Received (Acknowledgement)",
        category: "Applications",
        subject: "Application Received: Vectonix Winter Internship 2026 (ID: {{application_id}})",
        badgeText: "Application Received",
        badgeVariant: "info",
        title: "We have received your internship application!",
        greeting: "Hello {{student_name}},",
        messageBody: `Thank you for applying to the Vectonix Winter Internship 2026! We have safely received your registration and our academic team is currently evaluating your profile.

We appreciate your interest in joining Vectonix Private Limited. You will receive an official status update regarding your selection and onboarding instructions shortly.`,
        showDetailsCard: true,
        detailsCardTitle: "Your Application Summary",
        detailsItems: [
            { label: "Application ID", value: "{{application_id}}", isCode: true, highlight: true },
            { label: "Internship Track", value: "Vectonix Winter Internship 2026" },
            { label: "Selected Domain", value: "{{internship_domain}}" },
            { label: "Package Chosen", value: "{{package_name}}" },
            { label: "Institution", value: "{{college_name}}" },
            { label: "Application Status", value: "Under Review" }
        ],
        showInfoCard: true,
        infoCardTitle: "What to expect next?",
        infoCardBullets: [
            "Our review committee evaluates applications on a rolling basis.",
            "Once evaluated, you will receive an official decision email with your student portal credentials.",
            "No further action is required from you at this time."
        ],
        showCtaButton: true,
        ctaButtonText: "Check Application Status →",
        ctaButtonUrl: "{{dashboard_link}}",
        closingMessage: "Welcome to the Vectonix learning community! We look forward to reviewing your profile.",
        isDefault: true,
        isSystem: true
    },

    // 2. Application Accepted
    {
        id: "tpl_app_accepted",
        templateName: "Application Accepted (Induction & Portal Activation)",
        category: "Applications",
        subject: "Congratulations! Your Application Has Been Accepted – Vectonix Winter Internship 2026",
        badgeText: "Application Accepted",
        badgeVariant: "success",
        title: "Congratulations! Welcome to Vectonix Winter Internship 2026",
        greeting: "Dear {{student_name}},",
        messageBody: `We are pleased to inform you that your application for the Vectonix Winter Internship 2026 has been successfully accepted!

We appreciate your interest in joining Vectonix Private Limited, and we are excited to have you as part of our rigorous technical internship cohort. You now have full access to your student dashboard, assigned project workspace, and learning resources.`,
        showDetailsCard: true,
        detailsCardTitle: "Internship Details",
        detailsItems: [
            { label: "Application ID", value: "{{application_id}}", isCode: true, highlight: true },
            { label: "Internship Program", value: "Vectonix Winter Internship 2026" },
            { label: "Allocated Domain", value: "{{internship_domain}}" },
            { label: "Duration", value: "25 November 2026 – 25 December 2026" },
            { label: "Enrolled Package", value: "{{package_name}}" },
            { label: "Application Status", value: "Accepted" }
        ],
        showInfoCard: true,
        infoCardTitle: "What happens next?",
        infoCardBullets: [
            "Access your student dashboard using your Application ID and registered email.",
            "Review your assigned industry project and inspect the four-milestone sprint schedule.",
            "Join the mandatory Online Induction & Orientation on November 25, 2026 at 6:00 PM IST.",
            "Weekly mentor reviews and milestone submissions take place every week."
        ],
        showCtaButton: true,
        ctaButtonText: "Access Student Dashboard →",
        ctaButtonUrl: "{{dashboard_link}}",
        closingMessage: "We look forward to seeing your dedication and impactful projects. Welcome to Vectonix!",
        isDefault: true,
        isSystem: true
    },

    // 3. Application Rejected / Encouragement
    {
        id: "tpl_app_rejected",
        templateName: "Application Update (Respectful Not Selected)",
        category: "Applications",
        subject: "Application Update – Vectonix Winter Internship 2026",
        badgeText: "Application Status Update",
        badgeVariant: "neutral",
        title: "Update Regarding Your Internship Application",
        greeting: "Dear {{student_name}},",
        messageBody: `Thank you for applying to the Vectonix Winter Internship 2026 and for showing keen interest in becoming part of Vectonix Private Limited.

After carefully reviewing your application against our current cohort capacity, we regret to inform you that your application has not been selected for this batch.

We understand the time and effort you invested in applying, and we genuinely appreciate your enthusiasm. Please do not let this decision discourage you—we encourage you to continue developing your technical skills and applying for future opportunities with Vectonix.`,
        showDetailsCard: true,
        detailsCardTitle: "Application Summary",
        detailsItems: [
            { label: "Application ID", value: "{{application_id}}", isCode: true },
            { label: "Internship Track", value: "Vectonix Winter Internship 2026" },
            { label: "Domain Applied", value: "{{internship_domain}}" },
            { label: "Application Status", value: "Not Selected" }
        ],
        showInfoCard: true,
        infoCardTitle: "Continuous Learning & Resources",
        infoCardBullets: [
            "Free technical tutorials and project ideas remain accessible at https://vectonix.in/learning.",
            "Feel free to re-apply for our upcoming Spring & Summer cohorts.",
            "Our team is always open to reviewing your future open-source projects."
        ],
        showCtaButton: true,
        ctaButtonText: "Explore Free Learning Resources →",
        ctaButtonUrl: "https://vectonix.in/learning",
        closingMessage: "We wish you all the very best in your academic journey and future professional career.",
        isDefault: false,
        isSystem: true
    },

    // 4. Induction Program Invitation
    {
        id: "tpl_induction_invite",
        templateName: "Induction Program & Orientation Invitation",
        category: "Events",
        subject: "Invitation: Mandatory Online Induction Program – Vectonix Winter Internship 2026",
        badgeText: "Orientation Program",
        badgeVariant: "info",
        title: "Official Induction Program & Orientation Walkthrough",
        greeting: "Hello {{student_name}},",
        messageBody: `You are cordially invited to attend the official Online Student Induction Program for the Vectonix Winter Internship 2026!

During this 60-minute session, our leadership and technical mentors will walk you through the company introduction, domain roadmaps, project allocation rubric, four-milestone workflow, weekly review expectations, and certificate eligibility rules. Attendance is mandatory for all accepted candidates.`,
        showMeetingCard: true,
        meetingDetails: {
            date: "Wednesday, November 25, 2026",
            time: "6:00 PM – 7:00 PM IST (sharp)",
            platform: "Google Meet / YouTube Live Stream",
            link: "https://meet.google.com/vtx-wi26-ind"
        },
        showInfoCard: true,
        infoCardTitle: "Orientation Agenda & Guidelines",
        infoCardBullets: [
            "6:00 PM – 6:15 PM: Vectonix Private Limited Introduction & Company Mission.",
            "6:15 PM – 6:35 PM: Domain Overviews (Full Stack, AI/ML, Robotics, STA, Cyber, Marketing).",
            "6:35 PM – 6:50 PM: Four-Milestone Sprint Schedule, Review Rubric & Submission Walkthrough.",
            "6:50 PM – 7:00 PM: Live Q&A Session with Technical Mentors.",
            "Join 5 minutes prior to start time with a stable internet connection."
        ],
        showCtaButton: true,
        ctaButtonText: "Join Induction Session →",
        ctaButtonUrl: "https://meet.google.com/vtx-wi26-ind",
        closingMessage: "We look forward to meeting you at the orientation! Come ready with your questions.",
        isDefault: false,
        isSystem: true
    },

    // 5. General Cohort Announcement
    {
        id: "tpl_announcement",
        templateName: "Cohort Announcement & Important Update",
        category: "Announcements",
        subject: "Important Announcement: Vectonix Winter Internship 2026 ({{internship_domain}})",
        badgeText: "Cohort Announcement",
        badgeVariant: "warning",
        title: "Important Batch Notice & Instructions",
        greeting: "Hello {{student_name}},",
        messageBody: `Please take note of this important technical update regarding the Vectonix Winter Internship 2026 (Batch WI26).

All interns in the {{internship_domain}} track must ensure their local development environments, GitHub repositories, and student portal credentials are confirmed.

Ensure you check your student dashboard regularly for live notifications, weekly review meeting links, and learning resource releases.`,
        showInfoCard: true,
        infoCardTitle: "Action Items for Candidates",
        infoCardBullets: [
            "Log in to your student portal at least once every 48 hours.",
            "Review your weekly milestones and commit your code progress to GitHub frequently.",
            "In case of any blockers, submit a query through the Mentor Support Desk."
        ],
        showCtaButton: true,
        ctaButtonText: "Open Student Dashboard →",
        ctaButtonUrl: "{{dashboard_link}}",
        closingMessage: "Thank you for your active participation and technical commitment.",
        isDefault: false,
        isSystem: true
    },

    // 6. Milestone Submission Reminder
    {
        id: "tpl_milestone_reminder",
        templateName: "Milestone Submission Deadline Reminder",
        category: "Milestones",
        subject: "Reminder: {{milestone_name}} Submission Window Is Open – Vectonix WI26",
        badgeText: "Milestone Reminder",
        badgeVariant: "warning",
        title: "Sprint Deadline Reminder: {{milestone_name}}",
        greeting: "Hello {{student_name}},",
        messageBody: `This is a friendly reminder that the submission window for {{milestone_name}} is currently open!

As per the Vectonix four-milestone sequential schedule, all deliverable links (GitHub repo, live deployment URL, or architecture documentation) must be uploaded through the student portal before Day 7 evaluation.`,
        showDetailsCard: true,
        detailsCardTitle: "Milestone Submission Details",
        detailsItems: [
            { label: "Application ID", value: "{{application_id}}", isCode: true },
            { label: "Allocated Project", value: "{{project_name}}" },
            { label: "Current Sprint", value: "{{milestone_name}}" },
            { label: "Assigned Mentor", value: "{{mentor_name}}" },
            { label: "Evaluation Status", value: "Submission Awaited" }
        ],
        showInfoCard: true,
        infoCardTitle: "Submission Checklist",
        infoCardBullets: [
            "Ensure your GitHub repository is public or accessible to your mentor.",
            "Include a clean README with setup instructions and architecture notes.",
            "Verify that cloud deployment links are live and error-free.",
            "Late submissions require mentor approval via the support desk."
        ],
        showCtaButton: true,
        ctaButtonText: "Submit Your Deliverable Now →",
        ctaButtonUrl: "{{dashboard_link}}",
        closingMessage: "Consistent weekly submissions ensure smooth progression to your certificate of completion.",
        isDefault: false,
        isSystem: true
    },

    // 7. Weekly Project Review Notification
    {
        id: "tpl_weekly_review",
        templateName: "Weekly Review Meeting Schedule",
        category: "Reviews",
        subject: "Scheduled: Weekly Project Review Meeting – Vectonix WI26 ({{internship_domain}})",
        badgeText: "Weekly Review",
        badgeVariant: "info",
        title: "Weekly Code & Milestone Review Meeting",
        greeting: "Dear {{student_name}},",
        messageBody: `Your technical mentor has scheduled the upcoming Weekly Project Review session for your domain track ({{internship_domain}}).

During this session, your code submissions, architectural decisions, and milestone progress will be evaluated. Be prepared to present a brief demonstration of your project.`,
        showMeetingCard: true,
        meetingDetails: {
            date: "{{meeting_date}}",
            time: "{{meeting_time}}",
            platform: "Google Meet",
            link: "{{meeting_link}}",
            agenda: "Code Walkthrough, Milestone Verification & Technical Feedback"
        },
        showInfoCard: true,
        infoCardTitle: "Preparation Guidelines",
        infoCardBullets: [
            "Have your development environment running locally or staged on cloud.",
            "Keep your GitHub commit log ready for inspection.",
            "Prepare 2-3 specific technical challenges or questions you encountered during the sprint."
        ],
        showCtaButton: true,
        ctaButtonText: "Open Project Workspace →",
        ctaButtonUrl: "{{dashboard_link}}",
        closingMessage: "Active participation in weekly reviews directly contributes to your final evaluation grade.",
        isDefault: false,
        isSystem: true
    },

    // 8. Certificate & Completion Notification
    {
        id: "tpl_certificate",
        templateName: "Certificate & Internship Completion Notification",
        category: "Certificates",
        subject: "Congratulations! Your Vectonix Internship Certificate Is Ready",
        badgeText: "Program Completed",
        badgeVariant: "success",
        title: "Internship Completed! Verified Certificate Issued",
        greeting: "Dear {{student_name}},",
        messageBody: `Congratulations on successfully completing the Vectonix Winter Internship 2026 in {{internship_domain}}!

Our evaluation committee and your mentors have reviewed your project deliverables across all four milestones and certified your satisfactory completion of the internship requirements.

Your official, cryptographically verifiable certificate of completion has been generated and is ready for download.`,
        showDetailsCard: true,
        detailsCardTitle: "Certificate Information",
        detailsItems: [
            { label: "Student Name", value: "{{student_name}}" },
            { label: "Credential ID", value: "{{application_id}}", isCode: true, highlight: true },
            { label: "Domain Completed", value: "{{internship_domain}}" },
            { label: "Project Completed", value: "{{project_name}}" },
            { label: "Verification Status", value: "Verified & Digitally Signed" }
        ],
        showInfoCard: true,
        infoCardTitle: "Certificate Verification & LinkedIn Sharing",
        infoCardBullets: [
            "Your certificate carries a tamper-proof QR code and unique credential ID.",
            "Anyone can independently verify your credential at https://vectonix.in/verify.",
            "Add this achievement to your LinkedIn profile under 'Licenses & Certifications'."
        ],
        showCtaButton: true,
        ctaButtonText: "Download Verified Certificate →",
        ctaButtonUrl: "https://vectonix.in/verify",
        closingMessage: "Thank you for being an exceptional intern at Vectonix. We wish you continued success!",
        isDefault: false,
        isSystem: true
    },

    // 9. General Student Update
    {
        id: "tpl_general_update",
        templateName: "General Student Update",
        category: "General",
        subject: "Vectonix Winter Internship 2026: General Candidate Update",
        badgeText: "General Update",
        badgeVariant: "info",
        title: "Vectonix Winter Internship 2026 Update",
        greeting: "Hello {{student_name}},",
        messageBody: `We hope your internship journey is progressing smoothly!

This is a general update regarding the Vectonix Winter Internship 2026 program. If you need any assistance with your project, mentor allocation, or milestone submissions, please reach out to our team.`,
        showCtaButton: true,
        ctaButtonText: "Visit Student Dashboard →",
        ctaButtonUrl: "{{dashboard_link}}",
        closingMessage: "Keep building and learning with Vectonix!",
        isDefault: false,
        isSystem: true
    }
];

/**
 * Service to manage templates with persistence and fallback
 */
export const emailTemplateService = {
    /**
     * Get all templates (default built-ins + custom ones)
     */
    getTemplates(): VectonixEmailContent[] {
        if (typeof window === "undefined") {
            return DEFAULT_VECTONIX_TEMPLATES;
        }

        try {
            const stored = localStorage.getItem("vtx_email_templates");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn("Could not read local email templates:", e);
        }

        return DEFAULT_VECTONIX_TEMPLATES;
    },

    /**
     * Save or update a template
     */
    saveTemplate(template: VectonixEmailContent): VectonixEmailContent[] {
        const templates = this.getTemplates();
        const existingIdx = templates.findIndex((t) => t.id === template.id);

        const updatedTemplate: VectonixEmailContent = {
            ...template,
            updatedAt: new Date().toISOString()
        };

        let newTemplates: VectonixEmailContent[];
        if (existingIdx >= 0) {
            newTemplates = [...templates];
            newTemplates[existingIdx] = updatedTemplate;
        } else {
            const newId = template.id || `tpl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            newTemplates = [
                {
                    ...updatedTemplate,
                    id: newId,
                    isSystem: false
                },
                ...templates
            ];
        }

        if (typeof window !== "undefined") {
            try {
                localStorage.setItem("vtx_email_templates", JSON.stringify(newTemplates));
            } catch (e) {
                console.warn("Could not save local email templates:", e);
            }
        }

        return newTemplates;
    },

    /**
     * Duplicate a template
     */
    duplicateTemplate(templateId: string): VectonixEmailContent[] {
        const templates = this.getTemplates();
        const found = templates.find((t) => t.id === templateId);
        if (!found) return templates;

        const copy: VectonixEmailContent = {
            ...found,
            id: `tpl_copy_${Date.now()}`,
            templateName: `${found.templateName} (Copy)`,
            isDefault: false,
            isSystem: false,
            updatedAt: new Date().toISOString()
        };

        const newTemplates = [copy, ...templates];
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem("vtx_email_templates", JSON.stringify(newTemplates));
            } catch {}
        }
        return newTemplates;
    },

    /**
     * Set a template as default
     */
    setDefaultTemplate(templateId: string): VectonixEmailContent[] {
        const templates = this.getTemplates();
        const updated = templates.map((t) => ({
            ...t,
            isDefault: t.id === templateId
        }));

        if (typeof window !== "undefined") {
            try {
                localStorage.setItem("vtx_email_templates", JSON.stringify(updated));
            } catch {}
        }
        return updated;
    },

    /**
     * Restore all factory default templates
     */
    restoreDefaultTemplates(): VectonixEmailContent[] {
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem("vtx_email_templates", JSON.stringify(DEFAULT_VECTONIX_TEMPLATES));
            } catch {}
        }
        return DEFAULT_VECTONIX_TEMPLATES;
    },

    /**
     * Render HTML and text
     */
    render(content: VectonixEmailContent, variables?: Record<string, string>, options?: { logoUrl?: string }) {
        return renderVectonixBrandedEmail(content, variables, options);
    }
};
