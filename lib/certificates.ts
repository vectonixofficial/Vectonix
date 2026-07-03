import { certificatesService } from "@/lib/services/certificatesService";

export interface Certificate {
    id?: string;
    certificateId: string;
    studentName: string;
    collegeName: string;
    domain: string;
    startDate: string;
    endDate: string;
    issueDate: string;
    signatureImage?: string; // base64 data URL
    verificationStatus: "verified" | "revoked";
    type?: "completion" | "offer_letter";
    designation?: string;
    stipend?: string;
    createdAt?: any;
}

export async function generateCertificateId(type: "completion" | "offer_letter" = "completion"): Promise<string> {
    return certificatesService.generateCertificateId(type);
}

export async function addCertificate(
    data: Omit<Certificate, "id">
): Promise<string> {
    return certificatesService.create(data);
}

export async function getCertificates(): Promise<Certificate[]> {
    return certificatesService.getAll();
}

export async function getCertificateByCode(
    certificateId: string
): Promise<Certificate | null> {
    return certificatesService.getByCode(certificateId);
}

export async function updateCertificate(
    id: string,
    data: Partial<Certificate>
): Promise<void> {
    return certificatesService.update(id, data);
}

export async function deleteCertificate(id: string): Promise<void> {
    return certificatesService.delete(id);
}

export async function syncAllCertificates(certificates: Omit<Certificate, "id">[]): Promise<number> {
    return certificatesService.syncAll(certificates);
}

export const DEFAULT_CERTIFICATES: Omit<Certificate, "id" | "createdAt">[] = [
    {
        certificateId: "VT/INT/FS/2026/0001",
        studentName: "Thilagavathi S",
        collegeName: "V.S.B Engineering College, Karur (B.E. CCE)",
        domain: "Artificial Intelligence",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0002",
        studentName: "Lohit D",
        collegeName: "VSB Engineering College, Karur (B.Tech)",
        domain: "Artificial Intelligence and Data Science (Web Development)",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0003",
        studentName: "Antony Sujin A",
        collegeName: "V.S.B College of Engineering and Technical Campus (B.E.)",
        domain: "Full Stack Development",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0004",
        studentName: "Mounishwaran L",
        collegeName: "VSB Engineering College (B.Tech AI & DS)",
        domain: "Full Stack Development",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0005",
        studentName: "Reena S",
        collegeName: "V.S.B College of Engineering Technical Campus, Coimbatore (B.E. ECE)",
        domain: "Artificial Intelligence",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0006",
        studentName: "Jeevananthan S",
        collegeName: "VSB Engineering College (B.Tech AI & DS)",
        domain: "Full Stack Development",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0007",
        studentName: "Kanagavalli V",
        collegeName: "VSB Engineering College, Karur (B.Tech)",
        domain: "Full Stack Development",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0008",
        studentName: "Ruchika Ashok Kumar",
        collegeName: "KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)",
        domain: "Cyber Security",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0009",
        studentName: "Sandiya S",
        collegeName: "KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)",
        domain: "Cyber Security",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0010",
        studentName: "Saranya M",
        collegeName: "KIT — Kalaignar Karunanidhi Institute of Technology (B.E.)",
        domain: "Cyber Security",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0011",
        studentName: "Sakthi Manoj M",
        collegeName: "VSB Engineering College (B.E. CCE)",
        domain: "Artificial Intelligence",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0012",
        studentName: "Nagalakshmi P",
        collegeName: "Christian College of Engineering and Technology (B.E.)",
        domain: "Artificial Intelligence",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0013",
        studentName: "Sivane K",
        collegeName: "SRM Madurai College for Engineering and Technology (B.E. CSE)",
        domain: "MERN Stack Development",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0014",
        studentName: "Rithicka Shree P",
        collegeName: "KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)",
        domain: "Cyber Security",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0015",
        studentName: "Dhanu Sri R",
        collegeName: "KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)",
        domain: "Cyber Security",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0018",
        studentName: "Dharshini C",
        collegeName: "VSB Engineering College (B.E. ECE)",
        domain: "Full Stack Development",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0019",
        studentName: "Malini M",
        collegeName: "VSB Engineering College, Karur (B.Tech AI & DS)",
        domain: "Artificial Intelligence",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified"
    },
    {
        certificateId: "VT/INT/FS/2026/0020",
        studentName: "Dhanush M",
        collegeName: "VSB Engineering College (B.Tech)",
        domain: "Artificial Intelligence",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        issueDate: "2026-07-01",
        signatureImage: "",
        verificationStatus: "verified",
        type: "completion"
    }
];
