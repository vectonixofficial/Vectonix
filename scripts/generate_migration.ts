import { AI_ML_PROJECTS, ROBOTICS_PROJECTS, STA_PROJECTS, ADDITIONAL_MENTORS } from '../lib/data/new-projects';
import * as fs from 'fs';

const allProjects = [...AI_ML_PROJECTS, ...ROBOTICS_PROJECTS, ...STA_PROJECTS];

let sql = '-- ============================================================================\n';
sql += '-- VECTONIX WI26 - AI/ML, ROBOTICS & SOFTWARE TESTING PROJECT BANK MIGRATION\n';
sql += '-- ============================================================================\n\n';

sql += '-- 1. Optional schema extension for rich project specifications\n';
sql += 'ALTER TABLE public.project_templates ADD COLUMN IF NOT EXISTS learning_outcomes JSONB DEFAULT \'[]\'::jsonb;\n';
sql += 'ALTER TABLE public.project_templates ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT \'[]\'::jsonb;\n';
sql += 'ALTER TABLE public.project_templates ADD COLUMN IF NOT EXISTS required_hardware_software JSONB DEFAULT \'[]\'::jsonb;\n';
sql += 'ALTER TABLE public.project_templates ADD COLUMN IF NOT EXISTS functional_requirements JSONB DEFAULT \'[]\'::jsonb;\n';
sql += 'ALTER TABLE public.project_templates ADD COLUMN IF NOT EXISTS non_functional_requirements JSONB DEFAULT \'[]\'::jsonb;\n';
sql += 'ALTER TABLE public.project_templates ADD COLUMN IF NOT EXISTS milestone_descriptions JSONB DEFAULT \'[]\'::jsonb;\n';
sql += 'ALTER TABLE public.project_templates ADD COLUMN IF NOT EXISTS simulation_policy JSONB DEFAULT \'{}\'::jsonb;\n\n';

sql += '-- 2. Seed Mentors for new domains\n';
for (const m of ADDITIONAL_MENTORS) {
    const desig = (m.designation || 'Technical Mentor').replace(/'/g, "''");
    const bio = (m.bio || '').replace(/'/g, "''");
    sql += `INSERT INTO public.mentors (id, name, email, domains, designation, bio, max_students, is_active)
VALUES ('${m.id}', '${m.name.replace(/'/g, "''")}', '${m.email}', '${JSON.stringify(m.domains)}'::jsonb, '${desig}', '${bio}', ${m.max_students}, true)
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    domains = EXCLUDED.domains,
    designation = EXCLUDED.designation,
    bio = EXCLUDED.bio;\n\n`;
}

sql += '-- 3. Seed 18 New Project Templates\n';
for (const p of allProjects) {
    sql += `INSERT INTO public.project_templates (
    id, title, domain, short_description, problem_statement,
    objectives, requirements, expected_features, tech_stack,
    difficulty_level, duration_weeks, expected_deliverables,
    evaluation_criteria, reference_materials, is_active,
    learning_outcomes, prerequisites, required_hardware_software,
    functional_requirements, non_functional_requirements,
    milestone_descriptions, simulation_policy
) VALUES (
    '${p.id}',
    '${p.title.replace(/'/g, "''")}',
    '${p.domain.replace(/'/g, "''")}',
    '${p.short_description.replace(/'/g, "''")}',
    '${p.problem_statement.replace(/'/g, "''")}',
    '${JSON.stringify(p.objectives).replace(/'/g, "''")}'::jsonb,
    '${JSON.stringify(p.requirements || []).replace(/'/g, "''")}'::jsonb,
    '${JSON.stringify(p.expected_features).replace(/'/g, "''")}'::jsonb,
    '${JSON.stringify(p.tech_stack).replace(/'/g, "''")}'::jsonb,
    '${p.difficulty_level}',
    ${p.duration_weeks},
    '${JSON.stringify(p.expected_deliverables).replace(/'/g, "''")}'::jsonb,
    '${JSON.stringify(p.evaluation_criteria).replace(/'/g, "''")}'::jsonb,
    '${JSON.stringify(p.reference_materials).replace(/'/g, "''")}'::jsonb,
    true,
    '${JSON.stringify(p.learning_outcomes || []).replace(/'/g, "''")}'::jsonb,
    '${JSON.stringify(p.prerequisites || []).replace(/'/g, "''")}'::jsonb,
    '${JSON.stringify(p.required_hardware_software || []).replace(/'/g, "''")}'::jsonb,
    '${JSON.stringify(p.functional_requirements || []).replace(/'/g, "''")}'::jsonb,
    '${JSON.stringify(p.non_functional_requirements || []).replace(/'/g, "''")}'::jsonb,
    '${JSON.stringify(p.milestone_descriptions || []).replace(/'/g, "''")}'::jsonb,
    '${JSON.stringify(p.simulation_policy || {}).replace(/'/g, "''")}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    domain = EXCLUDED.domain,
    short_description = EXCLUDED.short_description,
    problem_statement = EXCLUDED.problem_statement,
    objectives = EXCLUDED.objectives,
    expected_features = EXCLUDED.expected_features,
    tech_stack = EXCLUDED.tech_stack,
    difficulty_level = EXCLUDED.difficulty_level,
    expected_deliverables = EXCLUDED.expected_deliverables,
    evaluation_criteria = EXCLUDED.evaluation_criteria,
    reference_materials = EXCLUDED.reference_materials,
    learning_outcomes = EXCLUDED.learning_outcomes,
    prerequisites = EXCLUDED.prerequisites,
    required_hardware_software = EXCLUDED.required_hardware_software,
    functional_requirements = EXCLUDED.functional_requirements,
    non_functional_requirements = EXCLUDED.non_functional_requirements,
    milestone_descriptions = EXCLUDED.milestone_descriptions,
    simulation_policy = EXCLUDED.simulation_policy,
    updated_at = NOW();\n\n`;
}

fs.writeFileSync('supabase/migrations/20261125000000_add_aiml_robotics_sta_projects.sql', sql, 'utf8');
console.log('Migration generated successfully: supabase/migrations/20261125000000_add_aiml_robotics_sta_projects.sql (' + sql.length + ' bytes)');
