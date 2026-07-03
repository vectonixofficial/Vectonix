import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Certificate Verification | Vectonix Technologies",
    description:
        "Verify the authenticity of an internship completion certificate issued by Vectonix Technologies.",
    icons: { icon: "/logo.png" },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
