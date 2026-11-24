import { projectBankService, normalizeDomain } from "../lib/project-bank";
import { studentService } from "../lib/services/studentService";
import { supabase } from "../lib/supabase";

async function verifyAll() {
    console.log("====================================================");
    console.log("VECTONIX WI26 - PROJECT BANK VERIFICATION SUITE");
    console.log("====================================================\n");

    // 1. Check Project Templates
    console.log("1. Fetching all project templates via ProjectBank API...");
    const templates = await projectBankService.getProjectTemplates();
    console.log(`✓ Total project templates loaded: ${templates.length}`);

    const expectedDomains = [
        "Full Stack Development",
        "Cybersecurity",
        "Digital Marketing",
        "AI / Machine Learning",
        "Robotics",
        "Software Testing and Automation"
    ];

    const domainCounts: Record<string, number> = {};
    for (const t of templates) {
        domainCounts[t.domain] = (domainCounts[t.domain] || 0) + 1;
    }
    console.log("✓ Projects per domain:", domainCounts);

    for (const d of expectedDomains) {
        if (!domainCounts[d] || domainCounts[d] < 6) {
            throw new Error(`Domain ${d} has only ${domainCounts[d] || 0} projects, expected 6+`);
        }
    }
    console.log("✓ All 6 domains have at least 6 active project templates.");

    // 2. Specific check for AI/ML projects (AI-ML-01 to AI-ML-06)
    console.log("\n2. Validating AI/ML Projects (AI-ML-01 to AI-ML-06)...");
    for (let i = 1; i <= 6; i++) {
        const id = `AI-ML-0${i}`;
        const proj = templates.find(t => t.id === id);
        if (!proj) throw new Error(`Missing project ${id}`);
        console.log(`  - [${proj.id}] ${proj.title} (${proj.difficulty_level}, ${proj.duration_weeks}w)`);
        if (!proj.objectives || proj.objectives.length === 0) throw new Error(`${id} missing objectives`);
        if (!proj.tech_stack || proj.tech_stack.length === 0) throw new Error(`${id} missing tech_stack`);
        if (!proj.milestone_descriptions || proj.milestone_descriptions.length !== 4) {
            throw new Error(`${id} does not have 4 milestone descriptions!`);
        }
    }
    console.log("✓ All 6 AI/ML projects verified with 4 customized milestones.");

    // 3. Specific check for Robotics projects (ROB-01 to ROB-06) & Simulation-First Policy
    console.log("\n3. Validating Robotics Projects (ROB-01 to ROB-06) & Hardware Policy...");
    for (let i = 1; i <= 6; i++) {
        const id = `ROB-0${i}`;
        const proj = templates.find(t => t.id === id);
        if (!proj) throw new Error(`Missing project ${id}`);
        console.log(`  - [${proj.id}] ${proj.title}`);
        if (!proj.simulation_policy) {
            throw new Error(`Robotics project ${id} is missing simulation_policy!`);
        }
        if (!proj.simulation_policy.free_simulation_alternative) {
            throw new Error(`Robotics project ${id} is missing free_simulation_alternative!`);
        }
        console.log(`    * Free Simulation: ${proj.simulation_policy.free_simulation_alternative.slice(0, 60)}...`);
        console.log(`    * Optional Hardware: ${proj.simulation_policy.optional_hardware.slice(0, 50)}...`);
    }
    console.log("✓ All 6 Robotics projects adhere strictly to Simulation-First Policy.");

    // 4. Specific check for Software Testing projects (STA-01 to STA-06)
    console.log("\n4. Validating Software Testing Projects (STA-01 to STA-06)...");
    for (let i = 1; i <= 6; i++) {
        const id = `STA-0${i}`;
        const proj = templates.find(t => t.id === id);
        if (!proj) throw new Error(`Missing project ${id}`);
        console.log(`  - [${proj.id}] ${proj.title}`);
        if (!proj.milestone_descriptions || proj.milestone_descriptions.length !== 4) {
            throw new Error(`${id} does not have 4 milestone descriptions!`);
        }
    }
    console.log("✓ All 6 Software Testing projects verified with 4 customized milestones.");

    // 5. Test Domain Normalization
    console.log("\n5. Testing Domain Normalization...");
    const testCases: [string, string][] = [
        ["AI / Machine Learning", "AI / Machine Learning"],
        ["AI/ML", "AI / Machine Learning"],
        ["Artificial Intelligence", "AI / Machine Learning"],
        ["Robotics & IoT", "Robotics"],
        ["Robotics", "Robotics"],
        ["Software Testing and Automation", "Software Testing and Automation"],
        ["STA", "Software Testing and Automation"],
        ["Full Stack Development", "Full Stack Development"],
        ["Cybersecurity", "Cybersecurity"],
        ["Digital Marketing", "Digital Marketing"],
    ];

    for (const [input, expected] of testCases) {
        const normalized = normalizeDomain(input);
        if (normalized !== expected) {
            throw new Error(`normalizeDomain("${input}") returned "${normalized}", expected "${expected}"`);
        }
    }
    console.log("✓ normalizeDomain handles all domain abbreviations and aliases properly.");

    // 6. Test Learning Resources
    console.log("\n6. Testing Official Documentation Learning Resources...");
    const aimlResources = await studentService.getLearningResources("wi26", "AI / Machine Learning");
    console.log(`✓ AI/ML resources count: ${aimlResources.length}`);
    const hasPython = aimlResources.some(r => r.title.includes("Python"));
    const hasScikit = aimlResources.some(r => r.title.includes("Scikit-Learn"));
    if (!hasPython || !hasScikit) throw new Error("AI/ML missing official Python or Scikit-learn docs!");

    const robResources = await studentService.getLearningResources("wi26", "Robotics");
    console.log(`✓ Robotics resources count: ${robResources.length}`);
    const hasRos2 = robResources.some(r => r.title.includes("ROS 2"));
    const hasGazebo = robResources.some(r => r.title.includes("Gazebo"));
    if (!hasRos2 || !hasGazebo) throw new Error("Robotics missing official ROS 2 or Gazebo docs!");

    const staResources = await studentService.getLearningResources("wi26", "Software Testing and Automation");
    console.log(`✓ STA resources count: ${staResources.length}`);
    const hasSelenium = staResources.some(r => r.title.includes("Selenium"));
    if (!hasSelenium) throw new Error("STA missing official Selenium docs!");

    // 7. Verify Mentors
    console.log("\n7. Validating Domain Mentors in Database...");
    const { data: mentors, error: mentorErr } = await supabase.from("mentors").select("*");
    if (mentorErr) throw mentorErr;
    console.log(`✓ Total mentors in database: ${mentors.length}`);
    for (const m of mentors) {
        console.log(`  - ${m.name} (${m.email}): domains=${JSON.stringify(m.domains)}`);
    }

    console.log("\n====================================================");
    console.log("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
    console.log("====================================================");
}

verifyAll().catch(err => {
    console.error("Verification failed:", err);
    process.exit(1);
});
