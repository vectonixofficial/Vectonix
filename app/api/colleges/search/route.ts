import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { INDIAN_COLLEGES, CollegeRecord } from "@/lib/data/collegesData";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = (searchParams.get("q") || "").trim().toLowerCase();

        if (!query) {
            // Return top premier institutions if no query provided
            return NextResponse.json({
                colleges: INDIAN_COLLEGES.slice(0, 15),
                total: INDIAN_COLLEGES.length
            });
        }

        // 1. Try querying Supabase if configured
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from("indian_colleges")
                    .select("id, name, city, state, category")
                    .or(`name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`)
                    .limit(20);

                if (!error && data && data.length > 0) {
                    return NextResponse.json({
                        colleges: data,
                        source: "database"
                    });
                }
            } catch (dbErr) {
                console.warn("Colleges database lookup failed, falling back to embedded dataset:", dbErr);
            }
        }

        // 2. High-speed In-Memory / Embedded Fallback
        const filtered = INDIAN_COLLEGES.filter((col) => {
            return (
                col.name.toLowerCase().includes(query) ||
                col.city.toLowerCase().includes(query) ||
                col.state.toLowerCase().includes(query)
            );
        }).slice(0, 20);

        return NextResponse.json({
            colleges: filtered,
            source: "static_dataset"
        });
    } catch (err: any) {
        console.error("College search error:", err);
        return NextResponse.json({ error: "Failed to search colleges" }, { status: 500 });
    }
}

