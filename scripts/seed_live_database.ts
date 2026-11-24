import { createClient } from "@supabase/supabase-js";
import { AI_ML_PROJECTS, ROBOTICS_PROJECTS, STA_PROJECTS, ADDITIONAL_MENTORS } from "../lib/data/new-projects";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://asrnrvsfbogrgspixyvg.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcm5ydnNmYm9ncmdzcGl4eXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDU3NTMsImV4cCI6MjA5ODU4MTc1M30.Qb-lgMU3xRRomdrlDeUCtpDoiK82YNjAlwbr0c-kYw0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
    console.log("=== VECTONIX LIVE DATABASE PROJECT BANK SEEDER ===");
    console.log(`Connecting to: ${supabaseUrl}`);

    const allNewProjects = [...AI_ML_PROJECTS, ...ROBOTICS_PROJECTS, ...STA_PROJECTS];
    console.log(`Total new projects to seed: ${allNewProjects.length}`);

    // Check DB columns
    const { data: sampleRow } = await supabase.from("project_templates").select("*").limit(1);
    const existingColumns = new Set(Object.keys(sampleRow?.[0] || {}));
    console.log("Columns recognized in live table:", Array.from(existingColumns));

    let projectSuccess = 0;
    let projectFails = 0;

    for (const proj of allNewProjects) {
        // Prepare base record matching standard columns
        const baseRecord: Record<string, any> = {
            id: proj.id,
            title: proj.title,
            domain: proj.domain,
            short_description: proj.short_description,
            problem_statement: proj.problem_statement,
            objectives: proj.objectives,
            requirements: proj.requirements,
            expected_features: proj.expected_features,
            tech_stack: proj.tech_stack,
            difficulty_level: proj.difficulty_level,
            expected_deliverables: proj.expected_deliverables,
            duration_weeks: proj.duration_weeks,
            evaluation_criteria: proj.evaluation_criteria,
            reference_materials: proj.reference_materials,
            is_active: proj.is_active,
            updated_at: new Date().toISOString()
        };

        // First attempt: upsert with all extended fields if column exists
        const extendedRecord = { ...proj, updated_at: new Date().toISOString() };
        let { error } = await supabase.from("project_templates").upsert(extendedRecord);

        if (error) {
            // Fallback to standard base columns if extra columns don't exist in DB schema yet
            const fallbackAttempt = await supabase.from("project_templates").upsert(baseRecord);
            if (fallbackAttempt.error) {
                console.error(`FAILED: ${proj.id} - ${proj.title}: ${fallbackAttempt.error.message}`);
                projectFails++;
            } else {
                console.log(`OK (base columns): ${proj.id} - ${proj.title}`);
                projectSuccess++;
            }
        } else {
            console.log(`OK (full record): ${proj.id} - ${proj.title}`);
            projectSuccess++;
        }
    }

    console.log(`\nProjects Seed Result: ${projectSuccess} succeeded, ${projectFails} failed.`);

    // 2. Seed Mentors
    console.log("\n=== SEEDING NEW MENTORS ===");
    for (const mentor of ADDITIONAL_MENTORS) {
        const { error } = await supabase.from("mentors").upsert({
            id: mentor.id,
            name: mentor.name,
            email: mentor.email,
            domains: mentor.domains,
            designation: mentor.designation,
            bio: mentor.bio,
            max_students: mentor.max_students,
            is_active: mentor.is_active,
            updated_at: new Date().toISOString()
        }, { onConflict: "email" });

        if (error) {
            console.error(`Mentor ${mentor.name} failed:`, error.message);
        } else {
            console.log(`OK Mentor: ${mentor.name} (${mentor.email})`);
        }
    }

    // 3. Verify total projects in DB
    const { data: totalInDb, error: countErr } = await supabase.from("project_templates").select("id, domain, title");
    if (!countErr && totalInDb) {
        console.log(`\nTotal project templates currently in database: ${totalInDb.length}`);
        const byDomain: Record<string, number> = {};
        totalInDb.forEach((p) => {
            byDomain[p.domain] = (byDomain[p.domain] || 0) + 1;
        });
        console.log("Projects per domain in DB:", byDomain);
    }

    console.log("\nSeeding finished successfully!");
}

main().catch(console.error);
