"use client";
import { useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import QRCode from "qrcode";

export interface CertificateData {
    studentName: string; collegeName: string; domain: string;
    startDate: string; endDate: string; issueDate: string;
    certificateId: string; signatureImage?: string;
}
export interface CertificateCanvasRef {
    downloadPDF: () => Promise<void>;
    getDataURL: () => Promise<string>;
}

const TW = 1054; const TH = 1492;

function fmt(iso: string) {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric"
    });
}

// Scientifically measured pixel positions from PowerShell pixel analysis
// Each zone: exact cover over template placeholder + centered text on top
const ZONES = {
    // Issue date  "June 30, 2026" — y=250-267, x ends at 698
    issueDate: { top: 244, left: 476, width: 240, height: 32 },
    // Student name "Mr. Your Name Here" — y=571-623, x=299-780
    name:      { top: 557, left: 185, width: 684, height: 80 },
    // Green underline below name — y=643-644
    underline: { top: 639, left: 260, width: 534 },
    // College "[ College / University Name ]" — y=720-736, x=377-689
    college:   { top: 713, left: 270, width: 514, height: 34 },
    // Domain "[ Domain Name ]" — y=825-852, x=390-671
    domain:    { top: 817, left: 215, width: 624, height: 48 },
    // Date line — y=889-902, x=272-752
    dateLine:  { top: 882, left: 180, width: 694, height: 32 },
    // Signature — left area, below cursive "Vectonix Team"
    signature: { top: 1098, left: 50, width: 292, height: 112 },
    // QR code — bottom right
    qr:        { top: 1096, right: 50, width: 196, height: 196 },
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

function QROverlay({ id }: { id: string }) {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        QRCode.toCanvas(ref.current, `https://vectonix.netlify.app/verify/${id}`, {
            width: 184, margin: 1,
            color: { dark: "#1e3a8a", light: "#ffffff" },
        }).catch(console.error);
    }, [id]);
    return (
        <div style={{
            position: "absolute",
            top: ZONES.qr.top, right: ZONES.qr.right,
            width: ZONES.qr.width, height: ZONES.qr.height,
            border: "3px solid #1e3a8a", background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            <canvas ref={ref} width={184} height={184} />
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
                    backgroundColor: null, logging: false,
                });
                const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                pdf.addImage(canvas.toDataURL("image/png", 1.0), "PNG", 0, 0, 210, 297);
                pdf.save(`${(data.studentName || "cert").replace(/\s+/g, "_")}_${data.certificateId}.pdf`);
            },
            async getDataURL() {
                if (!divRef.current) return "";
                const html2canvas = (await import("html2canvas")).default;
                const c = await html2canvas(divRef.current, { scale: 2, useCORS: true, allowTaint: true });
                return c.toDataURL("image/png");
            },
        }));

        const navy = "#1a3a8f";
        const green = "#16a34a";

        return (
            <>
                {/* eslint-disable-next-line @next/next/no-page-custom-font */}
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" />
                <div style={{ width: TW * scale, height: TH * scale, overflow: "hidden", flexShrink: 0 }}>
                    <div ref={divRef} style={{
                        width: TW, height: TH, position: "relative",
                        transform: `scale(${scale})`, transformOrigin: "top left",
                    }}>
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
                    </div>
                </div>
            </>
        );
    }
);

CertificateCanvas.displayName = "CertificateCanvas";
export default CertificateCanvas;
