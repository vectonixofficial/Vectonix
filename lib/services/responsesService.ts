import { supabase, isSupabaseConfigured, DatabaseRegistration } from "@/lib/supabase";

export const responsesService = {
    async getAll(): Promise<DatabaseRegistration[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching registrations:", error.message);
            return [];
        }

        return data || [];
    },

    async getByEventId(eventId: string): Promise<DatabaseRegistration[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .eq("event_id", eventId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(`Error fetching registrations for event ${eventId}:`, error.message);
            return [];
        }

        return data || [];
    },

    async createRegistration(regData: Omit<DatabaseRegistration, "id">): Promise<string> {
        if (!isSupabaseConfigured) {
            console.warn("Supabase not configured. Saved locally.");
            return `local-${Date.now()}`;
        }

        const { data, error } = await supabase
            .from("registrations")
            .insert([regData])
            .select("id")
            .single();

        if (error) {
            throw new Error(`Failed to save registration: ${error.message}`);
        }

        return data.id;
    },

    async delete(id: string): Promise<void> {
        if (!isSupabaseConfigured) return;

        const { error } = await supabase
            .from("registrations")
            .delete()
            .eq("id", id);

        if (error) {
            throw new Error(`Failed to delete registration: ${error.message}`);
        }
    }
};
