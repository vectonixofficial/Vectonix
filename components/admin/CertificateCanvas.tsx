"use client";
import { useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import QRCode from "qrcode";

export interface CertificateData {
    studentName: string;
    collegeName: string;
    domain: string;
    startDate: string;
    endDate: string;
    issueDate: string;
    certificateId: string;
    signatureImage?: string;
    type?: "completion" | "offer_letter";
    designation?: string;
    stipend?: string;
}

export interface CertificateCanvasRef {
    downloadPDF: () => Promise<void>;
    getDataURL: () => Promise<string>;
}

const TW = 1054;
const TH = 1492;

function fmt(iso: string) {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric"
    });
}

// Scientifically measured pixel positions from PowerShell pixel analysis for Completion Certificate
const ZONES = {
    issueDate: { top: 244, left: 476, width: 240, height: 32 },
    name: { top: 557, left: 185, width: 684, height: 80 },
    underline: { top: 639, left: 260, width: 534 },
    college: { top: 713, left: 270, width: 514, height: 34 },
    domain: { top: 817, left: 215, width: 624, height: 48 },
    dateLine: { top: 882, left: 180, width: 694, height: 32 },
    signature: { top: 1098, left: 50, width: 292, height: 112 },
    qr: { top: 1096, right: 50, width: 196, height: 196 },
};

function Cover({ z, children }: { z: typeof ZONES[keyof typeof ZONES] & { right?: number }, children: React.ReactNode }) {
    const style: React.CSSProperties = {
        position: "absolute",
        top: z.top,
        width: z.width,
        height: (z as any).height ?? 2,
        left: (z as any).right !== undefined ? undefined : (z as any).left,
        right: (z as any).right,
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    };
    return <div style={style}>{children}</div>;
}

function QROverlay({ id, size = 184, border = true }: { id: string; size?: number; border?: boolean }) {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://vectonix.in";
        const verifyUrl = baseUrl.includes("localhost") ? "https://vectonix.in" : baseUrl;
        QRCode.toCanvas(ref.current, `${verifyUrl}/verify/${id}`, {
            width: size, margin: 1,
            color: { dark: "#1e3a8a", light: "#ffffff" },
        }).catch(console.error);
    }, [id, size]);

    if (!border) {
        return <canvas ref={ref} width={size} height={size} />;
    }

    return (
        <div style={{
            position: "absolute",
            top: ZONES.qr.top, right: ZONES.qr.right,
            width: ZONES.qr.width, height: ZONES.qr.height,
            border: "3px solid #1e3a8a", background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            <canvas ref={ref} width={size} height={size} />
        </div>
    );
}

const CertificateCanvas = forwardRef<CertificateCanvasRef, { data: CertificateData; scale?: number }>(
    ({ data, scale = 1 }, ref) => {
        const divRef = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => ({
            async downloadPDF() {
                if (!divRef.current) return;
                const html2canvas = (await import("html2canvas")).default;
                const { jsPDF } = await import("jspdf");
                const canvas = await html2canvas(divRef.current, {
                    scale: 2, useCORS: true, allowTaint: true,
                    backgroundColor: "#ffffff", logging: false,
                });
                const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                pdf.addImage(canvas.toDataURL("image/png", 1.0), "PNG", 0, 0, 210, 297);
                const prefix = data.type === "offer_letter" ? "OfferLetter" : "Certificate";
                pdf.save(`${prefix}_${(data.studentName || "student").replace(/\s+/g, "_")}_${data.certificateId}.pdf`);
            },
            async getDataURL() {
                if (!divRef.current) return "";
                const html2canvas = (await import("html2canvas")).default;
                const c = await html2canvas(divRef.current, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff" });
                return c.toDataURL("image/png");
            },
        }));

        const navy = "#1a3a8f";
        const green = "#16a34a";
        const isOffer = data.type === "offer_letter";

        return (
            <>
                {/* eslint-disable-next-line @next/next/no-page-custom-font */}
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" />
                <div style={{ width: TW * scale, height: TH * scale, overflow: "hidden", flexShrink: 0 }}>
                    <div ref={divRef} style={{
                        width: TW, height: TH, position: "relative",
                        transform: `scale(${scale})`, transformOrigin: "top left",
                        backgroundColor: "#ffffff",
                    }}>
                        {isOffer ? (
                            /* ── OFFER LETTER TEMPLATE ──────────────────────────── */
                            <div style={{
                                width: TW, height: TH, padding: "60px 70px", boxSizing: "border-box",
                                fontFamily: "'Montserrat', sans-serif", color: "#1e293b", position: "relative",
                                display: "flex", flexDirection: "column", justifyContent: "space-between",
                                background: "#ffffff"
                            }}>
                                {/* Decorative Accent Borders */}
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 14, background: "linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)" }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, background: "#1e3a8a" }} />
                                <div style={{ position: "absolute", inset: 24, border: "1px solid #e2e8f0", pointerEvents: "none" }} />

                                <div>
                                    {/* Company Header */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1e3a8a", paddingBottom: 24, marginBottom: 36 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/logo.png" alt="Logo" crossOrigin="anonymous" style={{ width: 70, height: 70, borderRadius: 12, objectFit: "contain" }} />
                                            <div>
                                                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e3a8a", letterSpacing: "-0.5px" }}>VECTONIX TECHNOLOGIES</h1>
                                                <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: "#0284c7" }}>Smart Digital Solutions & AI Innovations</p>
                                                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b" }}>Hosur, Tamil Nadu 635109 | Email: vectonixofficial@gmail.com</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ background: "#f1f5f9", padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
                                                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#475569" }}>DOCUMENT REF</p>
                                                <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, color: "#1e3a8a", fontFamily: "monospace" }}>{data.certificateId}</p>
                                            </div>
                                            <p style={{ margin: "10px 0 0", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Date: <strong style={{ color: "#0f172a" }}>{fmt(data.issueDate)}</strong></p>
                                        </div>
                                    </div>

                                    {/* Document Title Banner */}
                                    <div style={{ textAlign: "center", marginBottom: 36 }}>
                                        <span style={{
                                            display: "inline-block", background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                                            color: "#ffffff", padding: "10px 36px", borderRadius: 30, fontSize: 18, fontWeight: 800,
                                            letterSpacing: "2px", textTransform: "uppercase", boxShadow: "0 4px 12px rgba(30, 58, 138, 0.2)"
                                        }}>
                                            Internship Offer Letter
                                        </span>
                                    </div>

                                    {/* Recipient Details */}
                                    <div style={{ marginBottom: 30, background: "#f8fafc", padding: "18px 24px", borderRadius: 12, borderLeft: "4px solid #2563eb" }}>
                                        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>To,</p>
                                        <h2 style={{ margin: "4px 0 2px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{data.studentName || "Candidate Name"}</h2>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#334155" }}>{data.collegeName || "University / College"}</p>
                                    </div>

                                    {/* Body Text */}
                                    <div style={{ fontSize: 14.5, lineHeight: 1.7, color: "#334155" }}>
                                        <p style={{ marginTop: 0 }}>
                                            Dear <strong>{data.studentName || "Candidate"}</strong>,
                                        </p>
                                        <p>
                                            We are delighted to offer you an internship position as a <strong>{data.designation || data.domain || "Intern"}</strong> at <strong>Vectonix Technologies</strong>. Following our review of your credentials and academic background, we are confident that your passion and expertise will make a valuable contribution to our team.
                                        </p>
                                    </div>

                                    {/* Terms Summary Table */}
                                    <div style={{ margin: "28px 0", border: "1px solid #cbd5e1", borderRadius: 12, overflow: "hidden" }}>
                                        <div style={{ background: "#1e3a8a", color: "#ffffff", padding: "10px 20px", fontSize: 13, fontWeight: 700, letterSpacing: "0.5px" }}>
                                            OFFER & INTERNSHIP SUMMARY
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#e2e8f0" }}>
                                            <div style={{ background: "#ffffff", padding: "12px 20px" }}>
                                                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block" }}>DOMAIN / FIELD</span>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{data.domain || "Web Development"}</span>
                                            </div>
                                            <div style={{ background: "#ffffff", padding: "12px 20px" }}>
                                                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block" }}>DESIGNATION</span>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: "#2563eb" }}>{data.designation || "Software Engineering Intern"}</span>
                                            </div>
                                            <div style={{ background: "#ffffff", padding: "12px 20px" }}>
                                                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block" }}>START DATE</span>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{fmt(data.startDate)}</span>
                                            </div>
                                            <div style={{ background: "#ffffff", padding: "12px 20px" }}>
                                                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block" }}>END DATE</span>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{fmt(data.endDate)}</span>
                                            </div>
                                            <div style={{ background: "#ffffff", padding: "12px 20px", gridColumn: "span 2" }}>
                                                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block" }}>STIPEND & TERMS</span>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>{data.stipend || "Performance-Based Stipend / Industrial Learning Program"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Responsibilities & Notes */}
                                    <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "#475569" }}>
                                        <p>
                                            During this internship, you will work closely with our core technology team on live industrial projects. You will be expected to maintain high professional standards and uphold confidentiality policies.
                                        </p>
                                        <p style={{ marginBottom: 0 }}>
                                            This offer letter is digitally verified and issued under the authority of Vectonix Technologies.
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Signatures & QR Code */}
                                <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Sincerely,</p>
                                        <p style={{ margin: "2px 0 8px", fontSize: 15, fontWeight: 800, color: "#1e3a8a" }}>Vectonix Technologies</p>
                                        <div style={{ height: 60, display: "flex", alignItems: "center" }}>
                                            {data.signatureImage ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={data.signatureImage} alt="Signature" crossOrigin="anonymous" style={{ maxHeight: 54, maxWidth: 220, objectFit: "contain" }} />
                                            ) : (
                                                <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 26, fontWeight: 600, color: "#1e3a8a" }}>
                                                    Vectonix Team
                                                </div>
                                            )}
                                        </div>
                                        <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 700, color: "#334155" }}>Authorized Signatory</p>
                                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>Tech Development & HR Dept.</p>
                                    </div>

                                    <div style={{ textAlign: "center", background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                                        <div style={{ background: "#ffffff", padding: 6, borderRadius: 8, display: "inline-block", border: "1px solid #cbd5e1" }}>
                                            <QROverlay id={data.certificateId} size={110} border={false} />
                                        </div>
                                        <p style={{ margin: "6px 0 0", fontSize: 10, fontWeight: 700, color: "#1e3a8a" }}>VERIFY ONLINE</p>
                                        <p style={{ margin: "1px 0 0", fontSize: 9, color: "#64748b" }}>vectonix.in/verify</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ── COMPLETION CERTIFICATE TEMPLATE ────────────────── */
                            <>
                                {/* Template image */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/certificate-template.png" alt="" crossOrigin="anonymous"
                                    style={{ position: "absolute", inset: 0, width: TW, height: TH, zIndex: 0 }} />

                                {/* Overlays */}
                                <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>

                                    {/* ── ISSUE DATE ─────────────────────────────── */}
                                    <Cover z={ZONES.issueDate}>
                                        <span style={{
                                            fontFamily: "'Montserrat',sans-serif", fontWeight: 700,
                                            fontSize: 15, color: navy, whiteSpace: "nowrap",
                                        }}>
                                            {fmt(data.issueDate)}
                                        </span>
                                    </Cover>

                                    {/* ── STUDENT NAME ──────────────────────────── */}
                                    <Cover z={ZONES.name}>
                                        <span style={{
                                            fontFamily: "'Times New Roman',Times,serif",
                                            fontStyle: "italic", fontWeight: 400,
                                            fontSize: 52, color: navy,
                                            textAlign: "center", display: "block",
                                            maxWidth: 660, lineHeight: 1.1,
                                        }}>
                                            {data.studentName || "Student Name"}
                                        </span>
                                    </Cover>

                                    {/* Green underline — y=639, centered under name zone */}
                                    <div style={{
                                        position: "absolute",
                                        top: ZONES.underline.top,
                                        left: ZONES.underline.left,
                                        width: ZONES.underline.width,
                                        height: 3, background: "#22c55e",
                                    }} />

                                    {/* ── COLLEGE NAME ─────────────────────────── */}
                                    <Cover z={ZONES.college}>
                                        <span style={{
                                            fontFamily: "'Montserrat',sans-serif", fontWeight: 700,
                                            fontSize: 18, color: navy,
                                            textAlign: "center", maxWidth: 490,
                                        }}>
                                            {data.collegeName || "College / University Name"}
                                        </span>
                                    </Cover>

                                    {/* ── DOMAIN NAME ──────────────────────────── */}
                                    <Cover z={ZONES.domain}>
                                        <span style={{
                                            fontFamily: "'Montserrat',sans-serif", fontWeight: 700,
                                            fontSize: 36, color: green,
                                            textAlign: "center", maxWidth: 600,
                                        }}>
                                            {data.domain || "Domain Name"}
                                        </span>
                                    </Cover>

                                    {/* ── DATE LINE ────────────────────────────── */}
                                    <Cover z={ZONES.dateLine}>
                                        <div style={{
                                            fontFamily: "'Montserrat',sans-serif", fontSize: 14.5,
                                            color: "#333", textAlign: "center", whiteSpace: "nowrap",
                                        }}>
                                            {"at "}
                                            <strong style={{ color: navy }}>Vectonix Technologies</strong>
                                            {" from  "}
                                            <strong style={{ color: navy }}>{fmt(data.startDate)}</strong>
                                            {"  to  "}
                                            <strong style={{ color: navy }}>{fmt(data.endDate)}</strong>
                                            {"."}
                                        </div>
                                    </Cover>

                                    {/* ── SIGNATURE ────────────────────────────── */}
                                    <Cover z={ZONES.signature}>
                                        {data.signatureImage
                                            ? <img src={data.signatureImage} alt="sig"   // eslint-disable-line
                                                style={{ maxWidth: 270, maxHeight: 100, objectFit: "contain" }} />
                                            : null}
                                    </Cover>

                                    {/* ── QR CODE ──────────────────────────────── */}
                                    <QROverlay id={data.certificateId} />

                                </div>
                            </>
                        )}
                    </div>
                </div>
            </>
        );
    }
);

CertificateCanvas.displayName = "CertificateCanvas";
export default CertificateCanvas;
