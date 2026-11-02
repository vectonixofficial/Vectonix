import { supabase, isSupabaseConfigured, DatabaseStudentProject, DatabaseMentor } from "@/lib/supabase";
import { projectBankService, normalizeDomain } from "@/lib/project-bank";
import { internshipService } from "@/lib/services/internshipService";

export interface AllocationDetails {
    studentProject: DatabaseStudentProject;
    candidateName: string;
    candidateEmail: string;
    collegeName: string;
    domain: string;
}

export function hydrateStudentProject(raw: any): DatabaseStudentProject {
    if (!raw) return raw;
    const proj: any = { ...raw };

    if (proj.status === "Planning") {
        proj.status = "Not Started";
    } else if (proj.status === "In Development") {
        proj.status = "In Progress";
    } else if (proj.status === "Needs Review") {
        proj.status = "Under Review";
    }

    if (Array.isArray(proj.milestones)) {
        const metaItem = proj.milestones.find((m: any) => m && m._meta);
        if (metaItem) {
            if (!proj.assigned_mentor_name) proj.assigned_mentor_name = metaItem.assigned_mentor_name;
            if (!proj.assigned_mentor_id) proj.assigned_mentor_id = metaItem.assigned_mentor_id;
            if (!proj.project_template_id) proj.project_template_id = metaItem.project_template_id;
            if (!proj.start_date) proj.start_date = metaItem.start_date;
            if (!proj.deadline) proj.deadline = metaItem.deadline;
            if (!proj.personalized_instructions) proj.personalized_instructions = metaItem.personalized_instructions;
            if (!proj.current_milestone) proj.current_milestone = metaItem.current_milestone;
            proj.milestones = proj.milestones.filter((m: any) => !m || !m._meta);
        }
    }

    return proj as DatabaseStudentProject;
}

export const allocationService = {
    /**
     * Get all project allocations for a batch
     */
    async getAllocations(batchId: string = "wi26"): Promise<DatabaseStudentProject[]> {
        if (!isSupabaseConfigured) return [];

        try {
            const { data, error } = await supabase
                .from("student_projects")
                .select("*")
                .eq("batch_id", batchId)
                .order("created_at", { ascending: false });

            if (error) {
                console.warn("Error fetching student_projects:", error.message);
                return [];
            }

            return (data || []).map(hydrateStudentProject);
        } catch (e) {
            console.error("Allocation fetch error:", e);
            return [];
        }
    },

    /**
     * Get allocation for a specific student application ID
     */
    async getStudentAllocation(applicationId: string): Promise<DatabaseStudentProject | null> {
        if (!isSupabaseConfigured) return null;

        try {
            const { data, error } = await supabase
                .from("student_projects")
                .select("*")
                .eq("application_id", applicationId)
                .maybeSingle();

            if (error || !data) return null;
            return hydrateStudentProject(data);
        } catch (e) {
            console.error("Error retrieving student allocation:", e);
            return null;
        }
    },

    /**
     * Manually allocate or reallocate a project to a student
     */
    async assignProject(payload: {
        applicationId: string;
        batchId?: string;
        domain: string;
        projectTemplateId: string;
        mentorId?: string;
        mentorName?: string;
        startDate?: string;
        deadline?: string;
        personalizedInstructions?: string;
    }): Promise<{ success: boolean; data?: DatabaseStudentProject; error?: string }> {
        if (!isSupabaseConfigured) {
            return { success: false, error: "Database is not connected." };
        }

        try {
            const template = await projectBankService.getProjectTemplateById(payload.projectTemplateId);
            if (!template) {
                return { success: false, error: "Selected project template does not exist." };
            }

            const standardMilestones = [
                { title: "Milestone 1: Project Proposal & Architecture Design", completed: false, status: "Pending" },
                { title: "Milestone 2: Core Engineering & Implementation", completed: false, status: "Pending" },
                { title: "Milestone 3: Integration, Testing & Optimization", completed: false, status: "Pending" },
                { title: "Milestone 4: Final Deployment & Documentation", completed: false, status: "Pending" }
            ];

            const batchId = payload.batchId || "wi26";
            const startDate = payload.startDate || "2026-11-25";
            const deadline = payload.deadline || "2026-12-25";

            const existing = await this.getStudentAllocation(payload.applicationId);

            const projectRecord: any = {
                application_id: payload.applicationId,
                batch_id: batchId,
                domain: payload.domain,
                project_template_id: template.id,
                project_title: template.title,
                description: template.short_description || template.problem_statement,
                assigned_mentor_id: payload.mentorId || null,
                assigned_mentor_name: payload.mentorName || "Lead Technical Mentor",
                start_date: startDate,
                deadline: deadline,
                personalized_instructions: payload.personalizedInstructions || null,
                status: "Planning",
                progress_percent: 0,
                current_milestone: 1,
                milestones: standardMilestones,
                updated_at: new Date().toISOString()
            };

            let resultData: any = null;

            // 1. Attempt full insert/update
            const firstAttempt = existing
                ? await supabase.from("student_projects").update(projectRecord).eq("application_id", payload.applicationId).select().single()
                : await supabase.from("student_projects").insert({ ...projectRecord, created_at: new Date().toISOString() }).select().single();

            if (!firstAttempt.error) {
                resultData = firstAttempt.data;
            } else {
                // 2. Fallback to base columns packing extra metadata into milestones JSON
                console.warn("Retrying student_projects upsert with schema-compatible base columns:", firstAttempt.error.message);
                const baseRecord: any = {
                    application_id: payload.applicationId,
                    batch_id: batchId,
                    domain: payload.domain,
                    project_title: template.title,
                    description: template.short_description || template.problem_statement,
                    status: "Planning",
                    progress_percent: 0,
                    milestones: [
                        ...standardMilestones,
                        {
                            _meta: true,
                            assigned_mentor_name: payload.mentorName || "Lead Technical Mentor",
                            assigned_mentor_id: payload.mentorId || null,
                            project_template_id: template.id,
                            start_date: startDate,
                            deadline: deadline,
                            personalized_instructions: payload.personalizedInstructions || null,
                            current_milestone: 1
                        }
                    ],
                    updated_at: new Date().toISOString()
                };

                const retryAttempt = existing
                    ? await supabase.from("student_projects").update(baseRecord).eq("application_id", payload.applicationId).select().single()
                    : await supabase.from("student_projects").insert({ ...baseRecord, created_at: new Date().toISOString() }).select().single();

                if (retryAttempt.error) throw retryAttempt.error;
                resultData = retryAttempt.data;
            }

            // Sync mentor allocation table if possible
            if (payload.mentorId) {
                try {
                    await supabase.from("mentor_allocations").upsert({
                        mentor_id: payload.mentorId,
                        application_id: payload.applicationId,
                        batch_id: batchId,
                        domain: payload.domain,
                        created_at: new Date().toISOString()
                    });
                } catch (ignore) {
                    // non-blocking
                }
            }

            return { success: true, data: hydrateStudentProject(resultData) };
        } catch (err: any) {
            console.error("Failed to assign project:", err);
            return { success: false, error: err.message || "Failed to assign project" };
        }
    },

    /**
     * Auto-allocate unassigned students in batch
     */
    async autoAllocateCohort(batchId: string = "wi26"): Promise<{
        success: boolean;
        allocatedCount: number;
        errors: string[];
    }> {
        try {
            const applications = await internshipService.getApplications(batchId);
            if (!applications || applications.length === 0) {
                return { success: true, allocatedCount: 0, errors: [] };
            }

            const existingAllocations = await this.getAllocations(batchId);
            const allocatedAppIds = new Set(existingAllocations.map((a) => a.application_id));

            const unassigned = applications.filter(
                (app) => !allocatedAppIds.has(app.application_id) && !allocatedAppIds.has(app.id)
            );

            if (unassigned.length === 0) {
                return { success: true, allocatedCount: 0, errors: [] };
            }

            const allTemplates = await projectBankService.getProjectTemplates();
            const allMentors = await projectBankService.getMentors();

            const domainTemplates: Record<string, typeof allTemplates> = {
                "Full Stack Development": allTemplates.filter((t) => normalizeDomain(t.domain) === "Full Stack Development"),
                "Cybersecurity": allTemplates.filter((t) => normalizeDomain(t.domain) === "Cybersecurity"),
                "Digital Marketing": allTemplates.filter((t) => normalizeDomain(t.domain) === "Digital Marketing")
            };

            let successCount = 0;
            const errors: string[] = [];

            for (let i = 0; i < unassigned.length; i++) {
                const app = unassigned[i];
                const normalizedDom = normalizeDomain(app.domain || app.internship_domain || "Full Stack Development");
                const availableProjects = domainTemplates[normalizedDom] || allTemplates;

                if (availableProjects.length === 0) {
                    errors.push(`No projects available for domain ${normalizedDom} (Student: ${app.full_name})`);
                    continue;
                }

                const chosenTemplate = availableProjects[i % availableProjects.length];
                const domainMentor = allMentors.find((m) =>
                    m.domains.some((d) => normalizeDomain(d) === normalizedDom)
                ) || allMentors[0];

                const res = await this.assignProject({
                    applicationId: app.application_id || app.id,
                    batchId,
                    domain: normalizedDom,
                    projectTemplateId: chosenTemplate.id,
                    mentorId: domainMentor?.id,
                    mentorName: domainMentor?.name,
                    startDate: "2026-11-25",
                    deadline: "2026-12-25",
                    personalizedInstructions: `Welcome to Winter Internship 2026 (${chosenTemplate.title}). Please review the problem statement and start working on Milestone 1.`
                });

                if (res.success) {
                    successCount++;
                } else {
                    errors.push(`Error allocating to ${app.full_name} (${app.application_id}): ${res.error}`);
                }
            }

            return { success: errors.length === 0, allocatedCount: successCount, errors };
        } catch (err: any) {
            console.error("Auto allocation fatal error:", err);
            return { success: false, allocatedCount: 0, errors: [err.message || "Unknown error"] };
        }
    }
};
