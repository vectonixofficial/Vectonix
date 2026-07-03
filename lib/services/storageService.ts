import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const storageService = {
    async uploadFile(bucketName: "signatures" | "events" | "documents", filePath: string, file: File | Blob): Promise<string> {
        if (!isSupabaseConfigured) {
            throw new Error("Supabase is not configured.");
        }

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, { upsert: true });

        if (error) {
            throw new Error(`Storage upload failed: ${error.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path);

        return publicUrlData.publicUrl;
    },

    async uploadBase64(bucketName: "signatures" | "events" | "documents", fileName: string, base64Data: string): Promise<string> {
        if (!isSupabaseConfigured) {
            return base64Data;
        }

        const match = base64Data.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (!match) return base64Data;

        const contentType = match[1];
        const byteCharacters = atob(match[2]);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return this.uploadFile(bucketName, `${Date.now()}_${fileName}`, blob);
    }
};
