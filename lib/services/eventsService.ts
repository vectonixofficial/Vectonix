import { supabase, isSupabaseConfigured, DatabaseEvent } from "@/lib/supabase";

export const eventsService = {
    async getAll(): Promise<DatabaseEvent[]> {
        if (!isSupabaseConfigured) {
            return [];
        }

        const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching events from Supabase:", error.message);
            return [];
        }

        return data || [];
    },

    async getById(id: string): Promise<DatabaseEvent | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) {
            console.error(`Error fetching event ${id}:`, error.message);
            return null;
        }

        return data;
    },

    async create(eventData: Omit<DatabaseEvent, "id">): Promise<string> {
        if (!isSupabaseConfigured) {
            throw new Error("Supabase is not configured.");
        }

        const { data, error } = await supabase
            .from("events")
            .insert([eventData])
            .select("id")
            .single();

        if (error) {
            throw new Error(`Failed to create event: ${error.message}`);
        }

        return data.id;
    },

    async update(id: string, eventData: Partial<DatabaseEvent>): Promise<void> {
        if (!isSupabaseConfigured) return;

        const { error } = await supabase
            .from("events")
            .update(eventData)
            .eq("id", id);

        if (error) {
            throw new Error(`Failed to update event: ${error.message}`);
        }
    },

    async delete(id: string): Promise<void> {
        if (!isSupabaseConfigured) return;

        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", id);

        if (error) {
            throw new Error(`Failed to delete event: ${error.message}`);
        }
    }
};
