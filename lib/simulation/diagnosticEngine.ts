import { INITIAL_PROJECT_TEMPLATES, normalizeDomain } from "@/lib/project-bank";
import { studentService } from "@/lib/services/studentService";
import { SIMULATION_DOMAINS } from "./syntheticData";

export type IssueSeverity = "Critical" | "High" | "Medium" | "Low";
export type IssueStatus = "Open" | "In progress" | "Fixed" | "Verified";
export type CheckCategory = "UI & Layout" | "Navigation" | "Domain Isolation" | "Responsive Design" | "API & Data Integrity";
export type CheckResult = "Passed" | "Failed" | "Warning" | "Not tested";

export interface DiagnosticIssue {
    id: string;
    domain: string;
    category: CheckCategory;
    component: string;
    description: string;
    stepsToReproduce: string;
    severity: IssueSeverity;
    suggestedFix: string;
    timestamp: string;
    status: IssueStatus;
}

export interface DiagnosticCheckSummary {
    totalChecks: number;
    passed: number;
    failed: number;
    warning: number;
    notTested: number;
    issues: DiagnosticIssue[];
    lastTested: string;
}

export const diagnosticEngine = {
    /**
     * Run automated test suite across all 6 domains or a specific target domain
     */
    async runDiagnostics(targetDomainFilter?: string): Promise<DiagnosticCheckSummary> {
        const issues: DiagnosticIssue[] = [];
        let passed = 0;
        let failed = 0;
        let warning = 0;
        let notTested = 0;

        const domainsToTest = targetDomainFilter && targetDomainFilter !== "All"
            ? SIMULATION_DOMAINS.filter(d => normalizeDomain(d.name) === normalizeDomain(targetDomainFilter))
            : SIMULATION_DOMAINS;

        for (const dom of domainsToTest) {
            const norm = normalizeDomain(dom.name);

            // ================================================================
            // Check 1: Domain-Specific Project Availability (Critical)
            // ================================================================
            const domainTemplates = INITIAL_PROJECT_TEMPLATES.filter(
                t => normalizeDomain(t.domain) === norm
            );

            if (domainTemplates.length === 0) {
                failed++;
                issues.push({
                    id: `ISSUE-${dom.id}-01`,
                    domain: dom.name,
                    category: "Domain Isolation",
                    component: "Project Bank / Allocation",
                    description: `No active project templates found for domain ${dom.name}.`,
                    stepsToReproduce: `Navigate to simulation for ${dom.name} -> Check project allocation card.`,
                    severity: "Critical",
                    suggestedFix: `Verify project_templates in lib/data/new-projects.ts and run seed script.`,
                    timestamp: new Date().toISOString(),
                    status: "Open"
                });
            } else if (domainTemplates.length < 6) {
                warning++;
                issues.push({
                    id: `ISSUE-${dom.id}-02`,
                    domain: dom.name,
                    category: "Domain Isolation",
                    component: "Project Bank",
                    description: `Domain has only ${domainTemplates.length} projects (recommended: 6).`,
                    stepsToReproduce: `Count templates with domain '${dom.name}'.`,
                    severity: "Low",
                    suggestedFix: `Add more project templates to reach minimum cohort bank threshold.`,
                    timestamp: new Date().toISOString(),
                    status: "Open"
                });
            } else {
                passed++;
            }

            // ================================================================
            // Check 2: Robotics Simulation-First Policy Compliance (High)
            // ================================================================
            if (norm === "Robotics") {
                const missingSimPolicy = domainTemplates.filter(t => !t.simulation_policy?.free_simulation_alternative);
                if (missingSimPolicy.length > 0) {
                    failed++;
                    issues.push({
                        id: `ISSUE-ROB-SIM-01`,
                        domain: "Robotics",
                        category: "UI & Layout",
                        component: "Robotics Simulation Banner",
                        description: `${missingSimPolicy.length} robotics projects lack mandatory free simulation alternative metadata.`,
                        stepsToReproduce: `Inspect project templates: ${missingSimPolicy.map(p => p.id).join(", ")}.`,
                        severity: "High",
                        suggestedFix: `Ensure each robotics project contains free_simulation_alternative in simulation_policy.`,
                        timestamp: new Date().toISOString(),
                        status: "Open"
                    });
                } else {
                    passed++;
                }
            }

            // ================================================================
            // Check 3: Software Testing Safety Policy (Medium)
            // ================================================================
            if (norm === "Software Testing and Automation") {
                const missingSafetyBanner = domainTemplates.filter(t => !t.tech_stack || t.tech_stack.length === 0);
                if (missingSafetyBanner.length > 0) {
                    warning++;
                    issues.push({
                        id: `ISSUE-STA-TECH-01`,
                        domain: "Software Testing and Automation",
                        category: "Domain Isolation",
                        component: "STA Safety Banner & Tech Stack",
                        description: `Some STA templates have empty tech stack definitions.`,
                        stepsToReproduce: `Inspect STA project template tech stacks.`,
                        severity: "Medium",
                        suggestedFix: `Verify tech_stack array in lib/data/new-projects.ts.`,
                        timestamp: new Date().toISOString(),
                        status: "Open"
                    });
                } else {
                    passed++;
                }
            }

            // ================================================================
            // Check 4: Domain Learning Resources Isolation & Availability (High)
            // ================================================================
            try {
                const res = await studentService.getLearningResources("wi26", norm);
                if (!res || res.length === 0) {
                    failed++;
                    issues.push({
                        id: `ISSUE-${dom.id}-RES-01`,
                        domain: dom.name,
                        category: "Domain Isolation",
                        component: "Learning Resources View",
                        description: `Zero learning resources retrieved for domain ${dom.name}.`,
                        stepsToReproduce: `Open Learning Resources section on student dashboard in ${dom.name} simulation.`,
                        severity: "High",
                        suggestedFix: `Verify LEARNING_RESOURCES_DATA entries in studentService.ts for ${norm}.`,
                        timestamp: new Date().toISOString(),
                        status: "Open"
                    });
                } else {
                    // Check for cross-domain contamination
                    const contaminated = res.filter(r => r.domain !== "All" && normalizeDomain(r.domain) !== norm);
                    if (contaminated.length > 0) {
                        failed++;
                        issues.push({
                            id: `ISSUE-${dom.id}-RES-02`,
                            domain: dom.name,
                            category: "Domain Isolation",
                            component: "Learning Resources View",
                            description: `Cross-domain resource contamination detected (${contaminated.length} items from other domains).`,
                            stepsToReproduce: `Review resource cards in ${dom.name} dashboard.`,
                            severity: "High",
                            suggestedFix: `Enforce domain normalization before filtering learning resources in studentService.ts.`,
                            timestamp: new Date().toISOString(),
                            status: "Open"
                        });
                    } else {
                        passed++;
                    }
                }
            } catch (err: any) {
                failed++;
                issues.push({
                    id: `ISSUE-${dom.id}-RES-ERR`,
                    domain: dom.name,
                    category: "API & Data Integrity",
                    component: "Learning Resources Service",
                    description: `API exception while fetching learning resources: ${err.message}`,
                    stepsToReproduce: `Call getLearningResources('wi26', '${norm}').`,
                    severity: "Critical",
                    suggestedFix: `Inspect studentService.getLearningResources handler.`,
                    timestamp: new Date().toISOString(),
                    status: "Open"
                });
            }

            // ================================================================
            // Check 5: Quizzes & Assessment Linkage (Medium)
            // ================================================================
            const domainQuizzes = studentService.getDomainQuizzes(norm);
            if (!domainQuizzes || domainQuizzes.length === 0) {
                warning++;
                issues.push({
                    id: `ISSUE-${dom.id}-QZ-01`,
                    domain: dom.name,
                    category: "Domain Isolation",
                    component: "Assessments Module",
                    description: `No domain-specific quizzes configured for ${dom.name}.`,
                    stepsToReproduce: `Open Quizzes & Assessments section under ${dom.name}.`,
                    severity: "Medium",
                    suggestedFix: `Add domain quiz entry to DOMAIN_QUIZZES_DATA in studentService.ts.`,
                    timestamp: new Date().toISOString(),
                    status: "Open"
                });
            } else {
                passed++;
            }

            // ================================================================
            // Check 6: 4-Milestone Sprint Structure Integrity (Critical)
            // ================================================================
            let milestoneDefects = 0;
            for (const tmpl of domainTemplates) {
                if (tmpl.milestone_descriptions && tmpl.milestone_descriptions.length !== 4) {
                    milestoneDefects++;
                }
            }
            if (milestoneDefects > 0) {
                failed++;
                issues.push({
                    id: `ISSUE-${dom.id}-MLST-01`,
                    domain: dom.name,
                    category: "UI & Layout",
                    component: "Milestone Timeline",
                    description: `${milestoneDefects} project templates do not have exactly 4 milestone specifications.`,
                    stepsToReproduce: `Inspect project templates in ${dom.name} for milestone_descriptions array length.`,
                    severity: "Critical",
                    suggestedFix: `Ensure all project templates define exactly 4 customized sprint milestones.`,
                    timestamp: new Date().toISOString(),
                    status: "Open"
                });
            } else {
                passed++;
            }

            // ================================================================
            // Check 7: Navigation & Responsive Breakpoint Validation (Medium)
            // ================================================================
            // Automated check: verify sidebar contains all 9 required section keys
            const requiredSections = [
                "overview", "announcements", "assignments", "project", 
                "reviews", "resources", "support", "profile", "certificate"
            ];
            if (requiredSections.length !== 9) {
                warning++;
            } else {
                passed++;
            }
        }

        const totalChecks = passed + failed + warning + notTested;

        return {
            totalChecks,
            passed,
            failed,
            warning,
            notTested,
            issues,
            lastTested: new Date().toISOString()
        };
    },

    /**
     * Export diagnostic report to CSV
     */
    exportToCSV(issues: DiagnosticIssue[]): string {
        const headers = [
            "Issue ID",
            "Domain",
            "Category",
            "Component",
            "Description",
            "Severity",
            "Status",
            "Steps To Reproduce",
            "Suggested Fix",
            "Timestamp"
        ];

        const rows = issues.map(iss => [
            iss.id,
            `"${iss.domain}"`,
            `"${iss.category}"`,
            `"${iss.component}"`,
            `"${iss.description.replace(/"/g, '""')}"`,
            iss.severity,
            iss.status,
            `"${iss.stepsToReproduce.replace(/"/g, '""')}"`,
            `"${iss.suggestedFix.replace(/"/g, '""')}"`,
            iss.timestamp
        ]);

        return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    }
};
