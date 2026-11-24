"""
Vectonix Winter Internship 2026 — Student Induction Program
Generates a professional 20-slide widescreen PowerPoint presentation.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Initialize 16:9 widescreen presentation
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# Brand Color Palette
NAVY = RGBColor(15, 23, 42)          # Slate 900
SLATE_DARK = RGBColor(30, 41, 59)    # Slate 800
SLATE_BODY = RGBColor(71, 85, 105)   # Slate 600
SLATE_MUTED = RGBColor(148, 163, 184) # Slate 400
BG_LIGHT = RGBColor(248, 250, 252)   # Slate 50
CARD_BG = RGBColor(255, 255, 255)    # Pure White
CARD_ALT = RGBColor(241, 245, 249)   # Slate 100
BORDER_COLOR = RGBColor(226, 232, 240) # Slate 200

# Accent Colors
INDIGO = RGBColor(79, 70, 229)       # Indigo 600
PURPLE = RGBColor(124, 58, 237)      # Purple 600
BLUE = RGBColor(37, 99, 235)         # Blue 600
SKY_BLUE = RGBColor(2, 132, 199)     # Sky 600
EMERALD = RGBColor(16, 185, 129)     # Emerald 500
AMBER = RGBColor(245, 158, 11)       # Amber 500
ROSE = RGBColor(239, 68, 68)         # Rose 500
INDIGO_TINT = RGBColor(238, 242, 255) # Indigo 50
PURPLE_TINT = RGBColor(245, 243, 255) # Purple 50
EMERALD_TINT = RGBColor(236, 253, 245) # Emerald 50
AMBER_TINT = RGBColor(254, 243, 199)  # Amber 50

LOGO_PATH = "public/vectonix-logo.png" if os.path.exists("public/vectonix-logo.png") else "public/logo.png"

def create_slide(bg_color=BG_LIGHT):
    slide = prs.slides.add_slide(blank_layout)
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = bg_color
    bg.line.fill.background()
    return slide

def add_header(slide, title, category="VECTONIX WINTER INTERNSHIP 2026"):
    # Category badge / kicker
    kicker_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(8), Inches(0.35))
    tf_k = kicker_box.text_frame
    tf_k.word_wrap = True
    p_k = tf_k.paragraphs[0]
    p_k.text = category.upper()
    p_k.font.size = Pt(10)
    p_k.font.bold = True
    p_k.font.color.rgb = INDIGO
    p_k.font.name = "Segoe UI"

    # Title
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(9.5), Inches(0.65))
    tf_t = title_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = title
    p_t.font.size = Pt(22)
    p_t.font.bold = True
    p_t.font.color.rgb = NAVY
    p_t.font.name = "Segoe UI"

    # Top right logo
    if os.path.exists(LOGO_PATH):
        try:
            slide.shapes.add_picture(LOGO_PATH, Inches(10.6), Inches(0.45), width=Inches(1.9))
        except Exception:
            pass

    # Header underline accent
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.48), Inches(11.733), Inches(0.02))
    line.fill.solid()
    line.fill.fore_color.rgb = BORDER_COLOR
    line.line.fill.background()

def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=BORDER_COLOR):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1)
    return card

def add_notes(slide, notes_text):
    notes_slide = slide.notes_slide
    text_frame = notes_slide.notes_text_frame
    text_frame.text = notes_text

# ==============================================================================
# SLIDE 1: TITLE SLIDE
# ==============================================================================
s1 = create_slide(bg_color=NAVY)

# Ambient purple/indigo decorative glow card
glow = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.35), Inches(7.5))
glow.fill.solid()
glow.fill.fore_color.rgb = INDIGO
glow.line.fill.background()

# Title Logo
if os.path.exists(LOGO_PATH):
    try:
        s1.shapes.add_picture(LOGO_PATH, Inches(1.2), Inches(1.2), width=Inches(3.2))
    except Exception:
        pass

# Badge Pill
badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(2.2), Inches(3.6), Inches(0.4))
badge.fill.solid()
badge.fill.fore_color.rgb = RGBColor(30, 41, 59)
badge.line.color.rgb = INDIGO
badge.line.width = Pt(1)
tf_b = badge.text_frame
p_b = tf_b.paragraphs[0]
p_b.text = "OFFICIAL INDUCTION PROGRAM • BATCH WI26"
p_b.font.size = Pt(9.5)
p_b.font.bold = True
p_b.font.color.rgb = RGBColor(165, 180, 252) # Indigo 300
p_b.font.name = "Segoe UI"
p_b.alignment = PP_ALIGN.CENTER

# Main Title
tb_title = s1.shapes.add_textbox(Inches(1.15), Inches(2.8), Inches(11.0), Inches(2.0))
tf_main = tb_title.text_frame
tf_main.word_wrap = True

p1 = tf_main.paragraphs[0]
p1.text = "Winter Internship 2026"
p1.font.size = Pt(40)
p1.font.bold = True
p1.font.color.rgb = RGBColor(255, 255, 255)
p1.font.name = "Segoe UI"

p2 = tf_main.add_paragraph()
p2.text = "Student Induction & Engineering Orientation"
p2.font.size = Pt(26)
p2.font.bold = True
p2.font.color.rgb = RGBColor(192, 132, 252) # Purple 400
p2.font.name = "Segoe UI"

# Description
p3 = tf_main.add_paragraph()
p3.text = "A comprehensive 4-week industrial project immersion program across applied software engineering, artificial intelligence, cybersecurity, robotics simulation, QA automation, and growth marketing."
p3.font.size = Pt(13)
p3.font.color.rgb = RGBColor(203, 213, 225)
p3.font.name = "Segoe UI"

# Footer metadata cards
meta_box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(5.6), Inches(10.9), Inches(1.2))
meta_box.fill.solid()
meta_box.fill.fore_color.rgb = RGBColor(30, 41, 59)
meta_box.line.color.rgb = RGBColor(51, 65, 85)

tf_meta = meta_box.text_frame
tf_meta.word_wrap = True
p_m = tf_meta.paragraphs[0]
p_m.text = "COMPANY: VECTONIX PRIVATE LIMITED   |   PORTAL: vectonix.in   |   BATCH TIMELINE: 25 NOV – 25 DEC 2026"
p_m.font.size = Pt(11)
p_m.font.bold = True
p_m.font.color.rgb = RGBColor(241, 245, 249)
p_m.font.name = "Segoe UI"

p_m2 = tf_meta.add_paragraph()
p_m2.text = "Official Student Guide: 4-Milestone Sprint Workflow • Weekly Reviews • Project Bank • Portal Walkthrough • Final Certification"
p_m2.font.size = Pt(10)
p_m2.font.color.rgb = RGBColor(148, 163, 184)
p_m2.font.name = "Segoe UI"

add_notes(s1, """Presenter Notes:
- Welcome everyone to the Vectonix Winter Internship 2026 Student Induction Program!
- Congratulate all selected interns on successfully clearing the admission process.
- State clearly: Today marks Day 1 of your 4-week industrial journey with Vectonix Private Limited.
- This induction session will walk you through everything you need to succeed: the company, your domain, project allocations, the four-milestone structure, weekly mentor reviews, our student dashboard, and final certificate eligibility.
- Please keep your questions ready for the live Q&A at the end of the session.""")

# ==============================================================================
# SLIDE 2: WELCOME TO VECTONIX PRIVATE LIMITED
# ==============================================================================
s2 = create_slide()
add_header(s2, "Welcome to Vectonix Private Limited", "Corporate Profile & Vision")

# Left Column: Company Profile
add_card(s2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
tb_c1 = s2.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.0), Inches(4.6))
tf_c1 = tb_c1.text_frame
tf_c1.word_wrap = True

p = tf_c1.paragraphs[0]
p.text = "About Vectonix Private Limited"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = NAVY

items = [
    ("Industry-Focused Engineering:", "Vectonix is a registered technology enterprise delivering robust web platforms, automated intelligence pipelines, cybersecurity solutions, and technical skilling."),
    ("Bridging Academia & Industry:", "Our winter internship bridges classroom theory and production-grade engineering through real-world architectural workflows."),
    ("Production Standards:", "Interns work under the same rigorous software engineering principles used in real tech companies: version control, peer reviews, error handling, and testing."),
    ("Student-Centric Empowerment:", "We believe in mentorship-first learning. Interns receive direct guidance from domain leads to build substantial, verifiable portfolio projects.")
]

for title, desc in items:
    p_t = tf_c1.add_paragraph()
    p_t.text = "• " + title + " "
    p_t.font.bold = True
    p_t.font.size = Pt(11)
    p_t.font.color.rgb = INDIGO
    p_t.font.name = "Segoe UI"
    
    p_d = tf_c1.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(10.5)
    p_d.font.color.rgb = SLATE_BODY
    p_d.font.name = "Segoe UI"

# Right Column: Core Corporate Values (3 cards)
values = [
    ("Engineering Rigor & Quality", "Writing clean, modular, and maintainable code with comprehensive inline documentation and automated unit test coverage.", EMERALD, EMERALD_TINT),
    ("Transparency & Mentorship", "Direct, constructive feedback through weekly review syncs and asynchronous mentor support desks.", INDIGO, INDIGO_TINT),
    ("Verifiable Portfolio Credibility", "Real outcomes: public Git repositories, live deployment URLs, and cryptographically verifiable certificates.", PURPLE, PURPLE_TINT)
]

for i, (title, desc, color, tint) in enumerate(values):
    card_top = Inches(1.8 + i * 1.68)
    add_card(s2, Inches(6.8), card_top, Inches(5.733), Inches(1.48), bg_color=CARD_BG)
    
    # Left accent strip
    accent = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), card_top, Inches(0.18), Inches(1.48))
    accent.fill.solid()
    accent.fill.fore_color.rgb = color
    accent.line.fill.background()

    tb_v = s2.shapes.add_textbox(Inches(7.15), card_top + Inches(0.12), Inches(5.1), Inches(1.2))
    tf_v = tb_v.text_frame
    tf_v.word_wrap = True
    
    p_vt = tf_v.paragraphs[0]
    p_vt.text = title
    p_vt.font.size = Pt(13)
    p_vt.font.bold = True
    p_vt.font.color.rgb = NAVY
    
    p_vd = tf_v.add_paragraph()
    p_vd.text = desc
    p_vd.font.size = Pt(10.5)
    p_vd.font.color.rgb = SLATE_BODY

add_notes(s2, """Presenter Notes:
- Introduce Vectonix Private Limited. Reiterate that we are an industry-driven tech company.
- Stress our primary purpose: We don't believe in passive tutorial watching. Real engineering is learned by building real systems.
- Explain our three core values on the right: Engineering Rigor, Continuous Mentorship, and Verifiable Outcomes.
- Every student will graduate with a live deployed project and a public GitHub repository they can proudly showcase to future employers.""")

# ==============================================================================
# SLIDE 3: WINTER INTERNSHIP 2026 OVERVIEW
# ==============================================================================
s3 = create_slide()
add_header(s3, "Winter Internship 2026 Overview", "Program Structure & Highlights")

stats = [
    ("4 Sprints", "Duration", "4 Intensive Weeks (25 Nov – 25 Dec)", INDIGO),
    ("6 Domains", "Specialization", "From Full Stack to Robotics & AI", PURPLE),
    ("36 Projects", "Project Bank", "6 Production Projects per Domain", BLUE),
    ("100% Online", "Format", "Virtual Portal & Google Meet Syncs", EMERALD)
]

for i, (big, label, sub, col) in enumerate(stats):
    left = Inches(0.8 + i * 2.98)
    add_card(s3, left, Inches(1.8), Inches(2.78), Inches(1.4))
    
    tb_s = s3.shapes.add_textbox(left + Inches(0.15), Inches(1.9), Inches(2.48), Inches(1.2))
    tf_s = tb_s.text_frame
    tf_s.word_wrap = True
    
    p_b = tf_s.paragraphs[0]
    p_b.text = big
    p_b.font.size = Pt(22)
    p_b.font.bold = True
    p_b.font.color.rgb = col
    
    p_l = tf_s.add_paragraph()
    p_l.text = label.upper()
    p_l.font.size = Pt(9.5)
    p_l.font.bold = True
    p_l.font.color.rgb = NAVY
    
    p_sub = tf_s.add_paragraph()
    p_sub.text = sub
    p_sub.font.size = Pt(9)
    p_sub.font.color.rgb = SLATE_BODY

# Program Features Table / 3 Columns
features = [
    ("Sprint-Based Agile Methodology", [
        "Structured in 4 weekly milestones mirroring industrial Scrum sprints.",
        "Weekly technical deliverables submitted for expert evaluation.",
        "Sequential milestone unlocking prevents last-minute submission rush.",
        "Clear rubric criteria established for each sprint."
    ], INDIGO_TINT),
    ("Hands-On Engineering Depth", [
        "Zero dummy or theoretical projects — all based on real-world briefs.",
        "Direct integration with Git, modern web stacks, and cloud platforms.",
        "Strict simulation-first policy for Robotics (no expensive hardware).",
        "Safe sandboxed testing rules for Security and QA Automation."
    ], PURPLE_TINT),
    ("Mentorship & Evaluation", [
        "Weekly interactive Google Meet review sessions with domain leads.",
        "In-portal asynchronous support desk for technical problem-solving.",
        "Constructive revision feedback loop for milestone resubmissions.",
        "Final performance assessment with Certificate of Completion."
    ], EMERALD_TINT)
]

for i, (heading, bullets, tint) in enumerate(features):
    left = Inches(0.8 + i * 3.98)
    add_card(s3, left, Inches(3.45), Inches(3.78), Inches(3.4), bg_color=CARD_BG)
    
    # Top banner in card
    top_bar = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(3.45), Inches(3.78), Inches(0.55))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = tint
    top_bar.line.fill.background()
    
    tb_h = s3.shapes.add_textbox(left + Inches(0.2), Inches(3.48), Inches(3.4), Inches(0.5))
    tf_h = tb_h.text_frame
    p_h = tf_h.paragraphs[0]
    p_h.text = heading
    p_h.font.size = Pt(12)
    p_h.font.bold = True
    p_h.font.color.rgb = NAVY
    
    tb_b = s3.shapes.add_textbox(left + Inches(0.2), Inches(4.1), Inches(3.4), Inches(2.6))
    tf_b = tb_b.text_frame
    tf_b.word_wrap = True
    for idx, bullet in enumerate(bullets):
        p_bl = tf_b.paragraphs[0] if idx == 0 else tf_b.add_paragraph()
        p_bl.text = "• " + bullet
        p_bl.font.size = Pt(10)
        p_bl.font.color.rgb = SLATE_BODY
        p_bl.font.name = "Segoe UI"
        p_bl.space_after = Pt(4)

add_notes(s3, """Presenter Notes:
- Walk through the high-level numbers: 4 weeks, 6 specialized domains, 36 industrial projects, and 100% online flexibility.
- Highlight the 3 pillars below: Agile Sprints, Hands-On Engineering Depth, and Expert Mentorship.
- Reiterate that this internship is 100% practical: no multiple-choice test will substitute for building your actual working project.""")

# ==============================================================================
# SLIDE 4: COMPLETE SCHEDULE & CALENDAR
# ==============================================================================
s4 = create_slide()
add_header(s4, "Complete Internship Schedule & Milestones", "Master Calendar • Batch WI26")

schedule = [
    ("Orientation & Induction", "25 Nov 2026", "6:00 PM – 7:00 PM IST", "Live Onboarding, Cohort Briefing & Portal Walkthrough", INDIGO),
    ("Milestone 1: Architecture & Setup", "26 Nov – 02 Dec", "7-Day Sprint", "Research, System Blueprint, Schema & Git Repository Initialization", BLUE),
    ("Milestone 2: Core Engineering", "03 Dec – 09 Dec", "7-Day Sprint", "Core Logic, Backend APIs, Primary Algorithms & Working Prototype", PURPLE),
    ("Milestone 3: Advanced Features", "10 Dec – 16 Dec", "7-Day Sprint", "Component Integration, Edge Cases, Security Hardening & Polish", SKY_BLUE),
    ("Milestone 4: Testing & Demo", "17 Dec – 23 Dec", "7-Day Sprint", "Production Deployment, Documentation, Report & Video Demo", EMERALD),
    ("Final Evaluation & Assessment", "24 Dec – 25 Dec", "Final 48 Hours", "Mentor Assessment, Rubric Scoring & Certificate Issuance", AMBER)
]

for i, (title, dates, duration, desc, col) in enumerate(schedule):
    top = Inches(1.75 + i * 0.88)
    add_card(s4, Inches(0.8), top, Inches(11.733), Inches(0.78), bg_color=CARD_BG)
    
    # Left pill tag
    tag = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.95), top + Inches(0.12), Inches(2.2), Inches(0.54))
    tag.fill.solid()
    tag.fill.fore_color.rgb = col
    tag.line.fill.background()
    
    tf_tag = tag.text_frame
    p_tag = tf_tag.paragraphs[0]
    p_tag.text = dates
    p_tag.font.size = Pt(11)
    p_tag.font.bold = True
    p_tag.font.color.rgb = RGBColor(255, 255, 255)
    p_tag.alignment = PP_ALIGN.CENTER
    
    # Title & Duration
    tb_st = s4.shapes.add_textbox(Inches(3.3), top + Inches(0.08), Inches(4.2), Inches(0.6))
    tf_st = tb_st.text_frame
    p_st = tf_st.paragraphs[0]
    p_st.text = title
    p_st.font.size = Pt(12.5)
    p_st.font.bold = True
    p_st.font.color.rgb = NAVY
    
    p_sd = tf_st.add_paragraph()
    p_sd.text = duration
    p_sd.font.size = Pt(9.5)
    p_sd.font.color.rgb = col
    p_sd.font.bold = True
    
    # Description
    tb_desc = s4.shapes.add_textbox(Inches(7.6), top + Inches(0.12), Inches(4.8), Inches(0.55))
    tf_desc = tb_desc.text_frame
    tf_desc.word_wrap = True
    p_d = tf_desc.paragraphs[0]
    p_d.text = desc
    p_d.font.size = Pt(10)
    p_d.font.color.rgb = SLATE_BODY

add_notes(s4, """Presenter Notes:
- Walk interns through the exact dates. Remind them to mark these dates on their Google Calendar immediately.
- Stress:
  1. Today, Nov 25 is Orientation.
  2. Tomorrow, Nov 26 starts Milestone 1, which ends Dec 2.
  3. Milestone 2 runs Dec 3 to Dec 9.
  4. Milestone 3 runs Dec 10 to Dec 16.
  5. Milestone 4 runs Dec 17 to Dec 23.
  6. Final Evaluation takes place Dec 24 and 25.
- Emphasize that milestone submission links close strictly at 23:59 IST on the end date of each sprint.""")

# ==============================================================================
# SLIDE 5: THE SIX INTERNSHIP DOMAINS
# ==============================================================================
s5 = create_slide()
add_header(s5, "The Six Specialized Engineering Domains", "Domain Tracks & Project Specialization")

domains_grid = [
    ("Full Stack Development", "Modern web applications, responsive user interfaces, RESTful APIs, and database architecture.", "React, Next.js, Node.js, Supabase, Tailwind", INDIGO),
    ("AI / Machine Learning", "Applied intelligence, NLP processing, predictive analytics, and computer vision models.", "Python, Scikit-learn, FastAPI, OpenCV, YOLO", PURPLE),
    ("Cybersecurity", "Defensive security analysis, vulnerability assessment, threat modeling, and safe auditing.", "Network Analysis, OWASP Top 10, Auth, Scanning", ROSE),
    ("Robotics & IoT", "Kinematic simulation, obstacle avoidance, SLAM mapping, and simulated robotics control.", "ROS 2 Humble, Gazebo, Webots, Tinkercad, Python", EMERALD),
    ("Software Testing & Automation", "Automated QA pipelines, UI testing, REST API validation, and performance load testing.", "Selenium, Pytest, Postman, Locust, Playwright", AMBER),
    ("Digital Marketing", "Technical growth marketing, organic SEO architecture, performance funnels, and analytics.", "Google Analytics, Technical SEO, Content Strategy", BLUE)
]

for i, (name, desc, stack, col) in enumerate(domains_grid):
    row = i // 3
    col_idx = i % 3
    left = Inches(0.8 + col_idx * 3.98)
    top = Inches(1.8 + row * 2.55)
    
    add_card(s5, left, top, Inches(3.78), Inches(2.35))
    
    # Top color stripe
    stripe = s5.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, Inches(3.78), Inches(0.08))
    stripe.fill.solid()
    stripe.fill.fore_color.rgb = col
    stripe.line.fill.background()
    
    tb_dom = s5.shapes.add_textbox(left + Inches(0.2), top + Inches(0.18), Inches(3.38), Inches(2.0))
    tf_dom = tb_dom.text_frame
    tf_dom.word_wrap = True
    
    p_dn = tf_dom.paragraphs[0]
    p_dn.text = name
    p_dn.font.size = Pt(14)
    p_dn.font.bold = True
    p_dn.font.color.rgb = NAVY
    
    p_dd = tf_dom.add_paragraph()
    p_dd.text = desc
    p_dd.font.size = Pt(10)
    p_dd.font.color.rgb = SLATE_BODY
    p_dd.space_before = Pt(4)
    p_dd.space_after = Pt(8)
    
    p_stk = tf_dom.add_paragraph()
    p_stk.text = "CORE TOOLS: " + stack
    p_stk.font.size = Pt(8.5)
    p_stk.font.bold = True
    p_stk.font.color.rgb = col

add_notes(s5, """Presenter Notes:
- Introduce all six domains. Every student has been admitted under one of these six specialized domains.
- Highlight that while the technical tools vary between domains, the engineering rigor, four-milestone structure, and evaluation rubrics are completely unified across Vectonix.
- In the next three slides, we will look into the specific expectations and sample projects for each track.""")

# ==============================================================================
# SLIDE 6: DOMAIN FOCUS — FULL STACK & AI/ML
# ==============================================================================
s6 = create_slide()
add_header(s6, "Domain Focus: Full Stack & AI/ML", "Technical Specifications & Scope")

# Left Column: Full Stack
add_card(s6, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
tb_fs = s6.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_fs = tb_fs.text_frame
tf_fs.word_wrap = True

p_fst = tf_fs.paragraphs[0]
p_fst.text = "Full Stack Web Development"
p_fst.font.size = Pt(16)
p_fst.font.bold = True
p_fst.font.color.rgb = INDIGO

fs_bullets = [
    "Core Technologies: Next.js / React 19, Node.js, TypeScript, Supabase / PostgreSQL, Tailwind CSS, REST APIs.",
    "Industrial Focus: Production-grade responsive layouts, secure authentication, relational database schema design, and cloud hosting.",
    "Sample Projects in Project Bank:",
    "  • Smart Campus Lost & Found Platform (vtx-fs-01)",
    "  • Virtual Queue & Appointment Token System (vtx-fs-02)",
    "  • Student Grievance & Resolution Portal (vtx-fs-03)",
    "Deliverables: Clean GitHub repository, responsive UI on all screens, live Vercel deployment link, and API documentation."
]

for b in fs_bullets:
    p_b = tf_fs.add_paragraph()
    p_b.text = b
    p_b.font.size = Pt(10.5)
    p_b.font.color.rgb = NAVY if b.startswith("Sample Projects") else SLATE_BODY
    p_b.font.bold = True if b.startswith("Sample Projects") or b.startswith("Core") or b.startswith("Deliverables") else False
    p_b.space_before = Pt(4)

# Right Column: AI / ML
add_card(s6, Inches(6.833), Inches(1.8), Inches(5.7), Inches(5.0))
tb_ai = s6.shapes.add_textbox(Inches(7.033), Inches(2.0), Inches(5.3), Inches(4.6))
tf_ai = tb_ai.text_frame
tf_ai.word_wrap = True

p_ait = tf_ai.paragraphs[0]
p_ait.text = "AI & Machine Learning (AI/ML)"
p_ait.font.size = Pt(16)
p_ait.font.bold = True
p_ait.font.color.rgb = PURPLE

ai_bullets = [
    "Core Technologies: Python 3.10+, FastAPI / Flask, Scikit-learn, Pandas, NumPy, OpenCV, YOLO, Vector DBs.",
    "Industrial Focus: Data preprocessing pipelines, text extraction, model training, evaluation metrics, and interactive inference dashboards.",
    "Sample Projects in Project Bank:",
    "  • AI Resume Analyzer & Skill Gap Recommender (AI-ML-01)",
    "  • Intelligent College Enquiry RAG Chatbot (AI-ML-02)",
    "  • Real-Time Object Detection Computer Vision System (AI-ML-04)",
    "Ethical AI Notice: Text classifiers & predictors must display confidence indicators and explain model limitations. No high-stakes decisions.",
    "Deliverables: Model training scripts, clean inference API, interactive dashboard, and technical evaluation report."
]

for b in ai_bullets:
    p_b = tf_ai.add_paragraph()
    p_b.text = b
    p_b.font.size = Pt(10.5)
    p_b.font.color.rgb = NAVY if b.startswith("Sample Projects") else SLATE_BODY
    p_b.font.bold = True if b.startswith("Sample Projects") or b.startswith("Core") or b.startswith("Deliverables") or b.startswith("Ethical") else False
    p_b.space_before = Pt(4)

add_notes(s6, """Presenter Notes:
- Full Stack interns: Focus on architectural quality, component modularity, and database schema integrity. A live deployment URL is mandatory for final completion.
- AI/ML interns: Emphasize practical deployment. A model sitting in a Jupyter Notebook is not enough; you must build a working API and an interactive UI (Streamlit or FastAPI web UI).
- Note the ethical guideline: AI predictions must carry clear confidence scores and disclaimer notices.""")

# ==============================================================================
# SLIDE 7: DOMAIN FOCUS — CYBERSECURITY & ROBOTICS
# ==============================================================================
s7 = create_slide()
add_header(s7, "Domain Focus: Cybersecurity & Robotics", "Technical Specifications & Hardware Policy")

# Left Column: Cybersecurity
add_card(s7, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
tb_sec = s7.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_sec = tb_sec.text_frame
tf_sec.word_wrap = True

p_sect = tf_sec.paragraphs[0]
p_sect.text = "Cybersecurity & Defensive Auditing"
p_sect.font.size = Pt(16)
p_sect.font.bold = True
p_sect.font.color.rgb = ROSE

sec_bullets = [
    "Core Technologies: Python, Linux tooling, OWASP Top 10, Network packet analysis, Cryptographic hashing, Threat modeling.",
    "Industrial Focus: Defensive security analysis, automated heuristic URL scanners, vulnerability scanning, and secure authentication.",
    "Sample Projects in Project Bank:",
    "  • Phishing URL & Threat Intelligence Detector (vtx-cs-01)",
    "  • Automated Web Application Vulnerability Scanner (vtx-cs-02)",
    "  • Security Event Logging & Incident Response Dashboard (vtx-cs-03)",
    "Safety Policy: All security tools must strictly target localhost or authorized staging sandboxes. Probing unauthorized systems is prohibited.",
    "Deliverables: Security architecture blueprint, functional scanner code, vulnerability audit report, and demo video."
]

for b in sec_bullets:
    p_b = tf_sec.add_paragraph()
    p_b.text = b
    p_b.font.size = Pt(10.5)
    p_b.font.color.rgb = NAVY if b.startswith("Sample Projects") else SLATE_BODY
    p_b.font.bold = True if b.startswith("Sample Projects") or b.startswith("Core") or b.startswith("Deliverables") or b.startswith("Safety") else False
    p_b.space_before = Pt(4)

# Right Column: Robotics (Simulation-First)
add_card(s7, Inches(6.833), Inches(1.8), Inches(5.7), Inches(5.0))
tb_rob = s7.shapes.add_textbox(Inches(7.033), Inches(2.0), Inches(5.3), Inches(4.6))
tf_rob = tb_rob.text_frame
tf_rob.word_wrap = True

p_robt = tf_rob.paragraphs[0]
p_robt.text = "Robotics & Embedded Systems"
p_robt.font.size = Pt(16)
p_robt.font.bold = True
p_robt.font.color.rgb = EMERALD

rob_bullets = [
    "Simulation-First Policy: ZERO expensive hardware required! All projects are 100% achievable in free cross-platform simulators.",
    "Core Technologies: ROS 2 Humble, Gazebo, Webots Robot Simulator, Tinkercad Circuits, Google MediaPipe, Python 3.10.",
    "Sample Projects in Project Bank:",
    "  • Autonomous Obstacle-Avoiding Mobile Robot (ROB-01)",
    "  • Articulated Robotic Arm Pick-and-Place Simulator (ROB-02)",
    "  • Gesture-Controlled Robotic Hand (ROB-05)",
    "Hardware Option: Physical microcontrollers (Arduino/ESP32) are strictly optional extracurricular extensions, never mandatory.",
    "Deliverables: Simulation world files, control nodes, trajectory visualization, and screen recording video of autonomous runs."
]

for b in rob_bullets:
    p_b = tf_rob.add_paragraph()
    p_b.text = b
    p_b.font.size = Pt(10.5)
    p_b.font.color.rgb = NAVY if b.startswith("Sample Projects") else SLATE_BODY
    p_b.font.bold = True if b.startswith("Sample Projects") or b.startswith("Core") or b.startswith("Deliverables") or b.startswith("Simulation-First") else False
    p_b.space_before = Pt(4)

add_notes(s7, """Presenter Notes:
- Cybersecurity interns: Reiterate our strict ethical policy. You are developing defensive tools. Do not run scanners against live external websites; use your localhost or test containers.
- Robotics interns: Stress our Simulation-First Policy! Interns are NOT expected to buy expensive LiDAR sensors or motors. You can complete all 4 milestones using Webots, Gazebo, Tinkercad, or MediaPipe on your personal computer.""")

# ==============================================================================
# SLIDE 8: DOMAIN FOCUS — SOFTWARE TESTING & DIGITAL MARKETING
# ==============================================================================
s8 = create_slide()
add_header(s8, "Domain Focus: Software Testing & Digital Marketing", "Technical Specifications & Deliverables")

# Left Column: STA
add_card(s8, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
tb_sta = s8.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_sta = tb_sta.text_frame
tf_sta.word_wrap = True

p_stat = tf_sta.paragraphs[0]
p_stat.text = "Software Testing & Automation (STA)"
p_stat.font.size = Pt(16)
p_stat.font.bold = True
p_stat.font.color.rgb = AMBER

sta_bullets = [
    "Core Technologies: Selenium WebDriver, Pytest, Postman / Newman, Locust, Playwright, Allure Reports, GitHub Actions CI/CD.",
    "Industrial Focus: Automated end-to-end regression suites, REST API automated validation, load & stress testing, and CI pipeline integration.",
    "Sample Projects in Project Bank:",
    "  • Automated Web Application Testing Framework (STA-01)",
    "  • Automated REST API Testing & Assertion Suite (STA-02)",
    "  • Website Performance & Load Testing Tool (STA-04)",
    "Safety Policy: Automated test execution is constrained to localhost or mock sandbox endpoints. No external stress attacks.",
    "Deliverables: Test case matrices, executable automated test scripts, HTML test execution reports, and CI workflow YAML."
]

for b in sta_bullets:
    p_b = tf_sta.add_paragraph()
    p_b.text = b
    p_b.font.size = Pt(10.5)
    p_b.font.color.rgb = NAVY if b.startswith("Sample Projects") else SLATE_BODY
    p_b.font.bold = True if b.startswith("Sample Projects") or b.startswith("Core") or b.startswith("Deliverables") or b.startswith("Safety") else False
    p_b.space_before = Pt(4)

# Right Column: Digital Marketing
add_card(s8, Inches(6.833), Inches(1.8), Inches(5.7), Inches(5.0))
tb_dm = s8.shapes.add_textbox(Inches(7.033), Inches(2.0), Inches(5.3), Inches(4.6))
tf_dm = tb_dm.text_frame
tf_dm.word_wrap = True

p_dmt = tf_dm.paragraphs[0]
p_dmt.text = "Digital Marketing & Growth Engineering"
p_dmt.font.size = Pt(16)
p_dmt.font.bold = True
p_dmt.font.color.rgb = BLUE

dm_bullets = [
    "Core Domains: Search Engine Optimization (SEO), Technical Site Audits, Multi-Channel Performance Marketing, Funnel Conversion.",
    "Industrial Focus: Data-driven audience research, keyword mapping, conversion rate optimization (CRO), and campaign metrics analytics.",
    "Sample Projects in Project Bank:",
    "  • Complete Digital Growth Campaign for Vectonix (vtx-dm-01)",
    "  • Comprehensive Technical & Content SEO Audit (vtx-dm-02)",
    "  • Social Media Engagement & Viral Growth Strategy (vtx-dm-03)",
    "Deliverables: Full technical audit spreadsheets, campaign creative assets, keyword mapping sheets, and final presentation slide deck."
]

for b in dm_bullets:
    p_b = tf_dm.add_paragraph()
    p_b.text = b
    p_b.font.size = Pt(10.5)
    p_b.font.color.rgb = NAVY if b.startswith("Sample Projects") else SLATE_BODY
    p_b.font.bold = True if b.startswith("Sample Projects") or b.startswith("Core") or b.startswith("Deliverables") else False
    p_b.space_before = Pt(4)

add_notes(s8, """Presenter Notes:
- Software Testing interns: QA is the backbone of modern software. You will write automated tests using Selenium, Pytest, and Playwright that run automatically inside CI/CD pipelines.
- Digital Marketing interns: This track is analytical and data-driven. You will perform actual technical SEO audits, build content funnels, and prepare comprehensive strategic campaign proposals.""")

# ==============================================================================
# SLIDE 9: PROJECT ALLOCATION & PROJECT BANK
# ==============================================================================
s9 = create_slide()
add_header(s9, "Project Allocation & The Project Bank", "Structured Assignment Model")

# 4 Steps of Allocation
steps = [
    ("Step 1: Domain Mapping", "Admitted students are matched directly to their registered domain (e.g. AI/ML, Full Stack, Robotics).", INDIGO),
    ("Step 2: Template Assignment", "Admins allocate a specific project template from the 36-project bank containing tailored specifications.", BLUE),
    ("Step 3: Dashboard Unlocking", "Your allocated project title, problem statement, objectives, and tech stack appear in your Student Portal.", PURPLE),
    ("Step 4: Milestone Customization", "Your 4-milestone plan loads project-specific sprint tasks rather than generic placeholders.", EMERALD)
]

for i, (title, desc, col) in enumerate(steps):
    left = Inches(0.8 + i * 2.98)
    add_card(s9, left, Inches(1.8), Inches(2.78), Inches(2.0))
    
    badge = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.2), Inches(1.95), Inches(1.0), Inches(0.35))
    badge.fill.solid()
    badge.fill.fore_color.rgb = col
    badge.line.fill.background()
    tf_bg = badge.text_frame
    p_bg = tf_bg.paragraphs[0]
    p_bg.text = f"STEP {i+1}"
    p_bg.font.size = Pt(9.5)
    p_bg.font.bold = True
    p_bg.font.color.rgb = RGBColor(255, 255, 255)
    p_bg.alignment = PP_ALIGN.CENTER
    
    tb_st = s9.shapes.add_textbox(left + Inches(0.2), Inches(2.4), Inches(2.38), Inches(1.3))
    tf_st = tb_st.text_frame
    tf_st.word_wrap = True
    p_t = tf_st.paragraphs[0]
    p_t.text = title.split(": ")[1]
    p_t.font.size = Pt(12)
    p_t.font.bold = True
    p_t.font.color.rgb = NAVY
    
    p_d = tf_st.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = SLATE_BODY
    p_d.space_before = Pt(4)

# Project Bank Inclusions Card
add_card(s9, Inches(0.8), Inches(4.1), Inches(11.733), Inches(2.7), bg_color=CARD_BG)
tb_pb = s9.shapes.add_textbox(Inches(1.1), Inches(4.25), Inches(11.1), Inches(2.4))
tf_pb = tb_pb.text_frame
tf_pb.word_wrap = True

p_pbt = tf_pb.paragraphs[0]
p_pbt.text = "What is Included in Every Project Template?"
p_pbt.font.size = Pt(15)
p_pbt.font.bold = True
p_pbt.font.color.rgb = NAVY

points = [
    ("Industry Problem Statement:", "Clearly defines the real-world operational bottleneck your project is designed to resolve."),
    ("Learning Outcomes & Prerequisites:", "Specific technical skills, algorithmic paradigms, and libraries you will master during the build."),
    ("Functional & Non-Functional Specs:", "Exact feature checklist, UI expectations, response-time tolerances, and responsive design criteria."),
    ("Robotics Simulation Policy:", "Explicit installation guides for Webots, Gazebo, Tinkercad, or MediaPipe with expected simulation outputs."),
    ("Four Customized Milestones:", "Custom sprint breakdown tailored to your specific system architecture — no generic copy-paste text.")
]

for title, desc in points:
    p_pt = tf_pb.add_paragraph()
    p_pt.text = "• " + title + " "
    p_pt.font.bold = True
    p_pt.font.size = Pt(10.5)
    p_pt.font.color.rgb = INDIGO
    
    p_pd = tf_pb.add_paragraph()
    p_pd.text = desc
    p_pd.font.size = Pt(10)
    p_pd.font.color.rgb = SLATE_BODY

add_notes(s9, """Presenter Notes:
- Explain the Project Allocation workflow: Every student receives an assigned project template.
- All 36 project templates are defined with professional industrial specifications.
- Once allocated by administrators, your project details will appear immediately on your dashboard under the 'Project' section.
- You do not need to hunt for project ideas; the scope, objectives, and sprint milestones are clearly laid out.""")

# ==============================================================================
# SLIDE 10: THE FOUR-MILESTONE SPRINT STRUCTURE
# ==============================================================================
s10 = create_slide()
add_header(s10, "The Four-Milestone Internship Workflow", "7-Day Sprint Progression Model")

milestones = [
    ("M1: Architecture & Setup", "Days 1–7 (26 Nov – 02 Dec)", [
        "Study domain technologies & problem statement",
        "Design system architecture & database schema",
        "Set up local development & simulation environments",
        "Initialize Git repository with README & structure"
    ], INDIGO),
    ("M2: Core Development", "Days 8–14 (03 Dec – 09 Dec)", [
        "Build primary backend models & database tables",
        "Implement core algorithm / kinematic logic",
        "Develop primary user workflows & API routes",
        "Submit first functional working prototype"
    ], BLUE),
    ("M3: Integration & Hardening", "Days 15–21 (10 Dec – 16 Dec)", [
        "Implement remaining advanced features",
        "Integrate frontend UI with backend APIs",
        "Handle edge cases, error states & responsive UI",
        "Automate unit tests & security hardening"
    ], PURPLE),
    ("M4: Deployment & Final Demo", "Days 22–28 (17 Dec – 23 Dec)", [
        "Deploy to live staging or production hosting",
        "Compile comprehensive README & technical report",
        "Record 3–5 min video demonstration walkthrough",
        "Submit final codebase for grading & certification"
    ], EMERALD)
]

for i, (title, dates, tasks, col) in enumerate(milestones):
    left = Inches(0.8 + i * 2.98)
    add_card(s10, left, Inches(1.8), Inches(2.78), Inches(4.3))
    
    # Top banner
    t_bar = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.8), Inches(2.78), Inches(0.8))
    t_bar.fill.solid()
    t_bar.fill.fore_color.rgb = col
    t_bar.line.fill.background()
    
    tb_mt = s10.shapes.add_textbox(left + Inches(0.1), Inches(1.85), Inches(2.58), Inches(0.7))
    tf_mt = tb_mt.text_frame
    p_m1 = tf_mt.paragraphs[0]
    p_m1.text = title
    p_m1.font.size = Pt(11)
    p_m1.font.bold = True
    p_m1.font.color.rgb = RGBColor(255, 255, 255)
    
    p_m2 = tf_mt.add_paragraph()
    p_m2.text = dates
    p_m2.font.size = Pt(9)
    p_m2.font.color.rgb = RGBColor(241, 245, 249)
    
    tb_tsk = s10.shapes.add_textbox(left + Inches(0.15), Inches(2.7), Inches(2.48), Inches(3.3))
    tf_tsk = tb_tsk.text_frame
    tf_tsk.word_wrap = True
    for idx, t in enumerate(tasks):
        p_t = tf_tsk.paragraphs[0] if idx == 0 else tf_tsk.add_paragraph()
        p_t.text = "• " + t
        p_t.font.size = Pt(9.5)
        p_t.font.color.rgb = SLATE_BODY
        p_t.font.name = "Segoe UI"
        p_t.space_after = Pt(6)

# Sequential unlock banner at bottom
banner = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.25), Inches(11.733), Inches(0.65))
banner.fill.solid()
banner.fill.fore_color.rgb = AMBER_TINT
banner.line.color.rgb = AMBER
banner.line.width = Pt(1)

tf_bn = banner.text_frame
p_bn = tf_bn.paragraphs[0]
p_bn.text = "IMPORTANT SEQUENTIAL UNLOCK RULE: Milestone N+1 unlocks only after Milestone N is submitted and approved by your mentor. Do not wait until the last week to submit your milestones!"
p_bn.font.size = Pt(10)
p_bn.font.bold = True
p_bn.font.color.rgb = RGBColor(180, 83, 9)
p_bn.alignment = PP_ALIGN.CENTER

add_notes(s10, """Presenter Notes:
- Emphasize the four sequential sprints:
  1. Milestone 1: Blueprint, schema, environment setup.
  2. Milestone 2: Core functional logic and initial commit.
  3. Milestone 3: Advanced integration, error handling, tests.
  4. Milestone 4: Deployment, video demo, and final technical report.
- Crucial Rule: Milestones unlock sequentially! You cannot jump straight to Milestone 4 without completing Milestones 1, 2, and 3.
- This prevents last-minute cramming and ensures consistent, authentic learning.""")

# ==============================================================================
# SLIDE 11: MILESTONE 1 & 2 DETAILED BREAKDOWN
# ==============================================================================
s11 = create_slide()
add_header(s11, "Deep Dive: Milestone 1 & Milestone 2", "Phase 1: Architecture to Core Engineering")

# M1 Card
add_card(s11, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
tb_m1 = s11.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_m1 = tb_m1.text_frame
tf_m1.word_wrap = True

p = tf_m1.paragraphs[0]
p.text = "Milestone 1 — Research, Blueprint & Setup"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = INDIGO

m1_items = [
    ("Timeline:", "26 November – 02 December 2026 (Day 1 to Day 7)"),
    ("Core Objective:", "Establish the architectural foundation and project blueprint before writing production code."),
    ("Key Tasks:", "• Thoroughly review assigned project problem statement & deliverables.\n• Research applicable libraries, frameworks, and simulation tools.\n• Draw system architecture diagram, component flowchart, or ERD.\n• Initialize Git repository with README, .gitignore, and directory structure."),
    ("Mandatory Deliverables:", "Public Git repository URL containing architecture diagrams (Figma/PDF/Mermaid) and project setup notes."),
    ("Review Standard:", "Mentor checks architectural feasibility, modularity, and repository hygiene.")
]

for title, desc in m1_items:
    p_t = tf_m1.add_paragraph()
    p_t.text = title + " "
    p_t.font.bold = True
    p_t.font.size = Pt(10)
    p_t.font.color.rgb = NAVY
    
    p_d = tf_m1.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = SLATE_BODY
    p_d.space_before = Pt(2)

# M2 Card
add_card(s11, Inches(6.833), Inches(1.8), Inches(5.7), Inches(5.0))
tb_m2 = s11.shapes.add_textbox(Inches(7.033), Inches(2.0), Inches(5.3), Inches(4.6))
tf_m2 = tb_m2.text_frame
tf_m2.word_wrap = True

p = tf_m2.paragraphs[0]
p.text = "Milestone 2 — Core Feature Development"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = BLUE

m2_items = [
    ("Timeline:", "03 December – 09 December 2026 (Day 8 to Day 14)"),
    ("Core Objective:", "Build the core functional engine, primary data structures, and core user workflows."),
    ("Key Tasks:", "• Implement the main backend algorithm or computer vision loop.\n• Construct core database tables, schema models, and REST endpoints.\n• Connect primary UI components with mock or live backend endpoints.\n• Verify basic end-to-end functionality without crashes."),
    ("Mandatory Deliverables:", "Git commit hash showing functional core code, terminal/console execution logs, or screen verification link."),
    ("Review Standard:", "Mentor tests core algorithmic correctness and verifies code compiles cleanly.")
]

for title, desc in m2_items:
    p_t = tf_m2.add_paragraph()
    p_t.text = title + " "
    p_t.font.bold = True
    p_t.font.size = Pt(10)
    p_t.font.color.rgb = NAVY
    
    p_d = tf_m2.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = SLATE_BODY
    p_d.space_before = Pt(2)

add_notes(s11, """Presenter Notes:
- Walk through Milestone 1 expectations: Before writing code, you need a plan. Design your architecture, draw flowcharts, and initialize your GitHub repository.
- Walk through Milestone 2 expectations: By the end of Week 2, your core engine must run. If you are building an AI chatbot, the basic search or response loop must work. If you are in Robotics, the basic Gazebo/Webots mobile node must publish velocity commands.
- Do not worry about advanced polish in Milestone 2; focus on getting the fundamental pipeline running.""")

# ==============================================================================
# SLIDE 12: MILESTONE 3 & 4 DETAILED BREAKDOWN
# ==============================================================================
s12 = create_slide()
add_header(s12, "Deep Dive: Milestone 3 & Milestone 4", "Phase 2: Integration to Final Release")

# M3 Card
add_card(s12, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
tb_m3 = s12.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_m3 = tb_m3.text_frame
tf_m3.word_wrap = True

p = tf_m3.paragraphs[0]
p.text = "Milestone 3 — Advanced Features & Polish"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = PURPLE

m3_items = [
    ("Timeline:", "10 December – 16 December 2026 (Day 15 to Day 21)"),
    ("Core Objective:", "Complete remaining features, integrate all sub-modules, and perform error handling & hardening."),
    ("Key Tasks:", "• Integrate auxiliary features (filters, export tools, dashboards).\n• Handle edge cases, invalid user inputs, and network exceptions.\n• Verify mobile, tablet, and desktop responsive layouts.\n• Conduct automated unit tests and performance optimization."),
    ("Mandatory Deliverables:", "Updated GitHub branch, test case execution report, staging deployment link or working demo screen capture."),
    ("Review Standard:", "Mentor evaluates system resilience, error recovery, and overall feature completeness.")
]

for title, desc in m3_items:
    p_t = tf_m3.add_paragraph()
    p_t.text = title + " "
    p_t.font.bold = True
    p_t.font.size = Pt(10)
    p_t.font.color.rgb = NAVY
    
    p_d = tf_m3.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = SLATE_BODY
    p_d.space_before = Pt(2)

# M4 Card
add_card(s12, Inches(6.833), Inches(1.8), Inches(5.7), Inches(5.0))
tb_m4 = s12.shapes.add_textbox(Inches(7.033), Inches(2.0), Inches(5.3), Inches(4.6))
tf_m4 = tb_m4.text_frame
tf_m4.word_wrap = True

p = tf_m4.paragraphs[0]
p.text = "Milestone 4 — Final Testing, Demo & Report"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = EMERALD

m4_items = [
    ("Timeline:", "17 December – 23 December 2026 (Day 22 to Day 28)"),
    ("Core Objective:", "Package the project for production release, publish documentation, and record a walkthrough video."),
    ("Key Tasks:", "• Deploy to production hosting (Vercel, Render, Cloudflare, etc.).\n• Write comprehensive README with installation & execution guides.\n• Record a 3–5 minute unlisted YouTube or Google Drive walkthrough video.\n• Submit formal technical project report PDF."),
    ("Mandatory Deliverables:", "1) Live Production URL   2) Final GitHub Repo\n3) Video Walkthrough Link   4) Technical Report PDF"),
    ("Review Standard:", "Final evaluation rubric score out of 100 marks by technical panel.")
]

for title, desc in m4_items:
    p_t = tf_m4.add_paragraph()
    p_t.text = title + " "
    p_t.font.bold = True
    p_t.font.size = Pt(10)
    p_t.font.color.rgb = NAVY
    
    p_d = tf_m4.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = SLATE_BODY
    p_d.space_before = Pt(2)

add_notes(s12, """Presenter Notes:
- Milestone 3 is where good projects become great: you test edge cases, optimize performance, and ensure mobile responsiveness.
- Milestone 4 is your graduation release: You must deploy your project, polish your GitHub README, compile your technical report, and record a 3-5 minute demonstration video.
- The video demo should show: 1) Who you are, 2) What problem you solved, 3) Live walkthrough of your working code/simulation.""")

# ==============================================================================
# SLIDE 13: WEEKLY REVIEWS & LIVE MENTORSHIP
# ==============================================================================
s13 = create_slide()
add_header(s13, "Weekly Review Meetings & Mentorship", "Live Interaction & Progress Tracking")

# 3 Columns for Review Workflow
review_cols = [
    ("Weekly Sync Schedule", "Every Wednesday @ 6:00 PM IST", [
        "Review 1: Wednesday, 02 Dec 2026",
        "Review 2: Wednesday, 09 Dec 2026",
        "Review 3: Wednesday, 16 Dec 2026",
        "Review 4: Wednesday, 23 Dec 2026",
        "Hosted live via Google Meet."
    ], INDIGO),
    ("Purpose of Weekly Syncs", "Collaborative Technical Guidance", [
        "Live progress check-ins with your assigned domain leads.",
        "Clear technical roadblocks, library conflicts, or bugs.",
        "Receive real-time architectural critique & advice.",
        "Interactive Q&A to prepare for the upcoming sprint."
    ], BLUE),
    ("Student Expectations", "Professionalism & Preparation", [
        "Attend punctually with active working camera/mic.",
        "Be ready to screen-share code or simulation runs.",
        "Formulate specific technical questions in advance.",
        "Attendance contributes to final engagement scoring."
    ], PURPLE)
]

for i, (title, sub, bullets, col) in enumerate(review_cols):
    left = Inches(0.8 + i * 3.98)
    add_card(s13, left, Inches(1.8), Inches(3.78), Inches(3.4))
    
    # Top banner
    tb_b = s13.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.8), Inches(3.78), Inches(0.65))
    tb_b.fill.solid()
    tb_b.fill.fore_color.rgb = col
    tb_b.line.fill.background()
    
    tf_th = tb_b.text_frame
    p_th = tf_th.paragraphs[0]
    p_th.text = title
    p_th.font.size = Pt(12)
    p_th.font.bold = True
    p_th.font.color.rgb = RGBColor(255, 255, 255)
    
    p_ts = tf_th.add_paragraph()
    p_ts.text = sub
    p_ts.font.size = Pt(9)
    p_ts.font.color.rgb = RGBColor(241, 245, 249)
    
    tb_cb = s13.shapes.add_textbox(left + Inches(0.2), Inches(2.55), Inches(3.38), Inches(2.5))
    tf_cb = tb_cb.text_frame
    tf_cb.word_wrap = True
    for idx, b in enumerate(bullets):
        p_b = tf_cb.paragraphs[0] if idx == 0 else tf_cb.add_paragraph()
        p_b.text = "• " + b
        p_b.font.size = Pt(10)
        p_b.font.color.rgb = SLATE_BODY
        p_b.font.name = "Segoe UI"
        p_b.space_after = Pt(6)

# Bottom Meet Link Info Box
add_card(s13, Inches(0.8), Inches(5.4), Inches(11.733), Inches(1.5), bg_color=CARD_BG)
tb_mi = s13.shapes.add_textbox(Inches(1.1), Inches(5.5), Inches(11.1), Inches(1.3))
tf_mi = tb_mi.text_frame
tf_mi.word_wrap = True

p_mit = tf_mi.paragraphs[0]
p_mit.text = "How to Access Your Weekly Google Meet Links:"
p_mit.font.size = Pt(13)
p_mit.font.bold = True
p_mit.font.color.rgb = NAVY

p_mid = tf_mi.add_paragraph()
p_mid.text = "1. Log in to your Student Dashboard at vectonix.in/internship/dashboard.\n2. Navigate to the 'Weekly Reviews' section on the left sidebar.\n3. Click 'Join Live Review' — the Google Meet button activates 15 minutes prior to the session start time.\n4. If you have an unavoidable college exam conflict, submit a prior notice via the Mentor Support Desk."
p_mid.font.size = Pt(10)
p_mid.font.color.rgb = SLATE_BODY
p_mid.space_before = Pt(4)

add_notes(s13, """Presenter Notes:
- Weekly Review meetings happen every Wednesday at 6:00 PM IST.
- The link is accessible directly through your Student Dashboard under the 'Weekly Reviews' tab.
- Come prepared: Don't just say 'everything is fine'—show your working code, ask about specific bugs, and get live feedback from your mentor.
- If you have an academic exam conflict on a Wednesday, notify us in advance via the Support Desk.""")

# ==============================================================================
# SLIDE 14: SUBMISSION PROCESS & REVISION WORKFLOW
# ==============================================================================
s14 = create_slide()
add_header(s14, "Milestone Submission & Revision Process", "Step-by-Step Submission Guide")

sub_steps = [
    ("1. Push to GitHub", "Commit all sprint code to your project repository with clear, descriptive commit messages.", INDIGO),
    ("2. Open Portal Modal", "Go to your Student Dashboard -> Milestones -> Click 'Submit Work' on the active milestone.", BLUE),
    ("3. Provide URLs & Notes", "Paste your GitHub URL, live demo/simulation link, and write concise notes outlining completed tasks.", PURPLE),
    ("4. Mentor Evaluation", "Your assigned mentor reviews your code and rubric deliverables within 24–48 hours.", EMERALD)
]

for i, (title, desc, col) in enumerate(sub_steps):
    left = Inches(0.8 + i * 2.98)
    add_card(s14, left, Inches(1.8), Inches(2.78), Inches(1.8))
    
    badge = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.2), Inches(1.95), Inches(0.8), Inches(0.32))
    badge.fill.solid()
    badge.fill.fore_color.rgb = col
    badge.line.fill.background()
    tf_bg = badge.text_frame
    p_bg = tf_bg.paragraphs[0]
    p_bg.text = f"STEP {i+1}"
    p_bg.font.size = Pt(9)
    p_bg.font.bold = True
    p_bg.font.color.rgb = RGBColor(255, 255, 255)
    p_bg.alignment = PP_ALIGN.CENTER
    
    tb_st = s14.shapes.add_textbox(left + Inches(0.2), Inches(2.35), Inches(2.38), Inches(1.2))
    tf_st = tb_st.text_frame
    tf_st.word_wrap = True
    p_t = tf_st.paragraphs[0]
    p_t.text = title.split(". ")[1]
    p_t.font.size = Pt(12)
    p_t.font.bold = True
    p_t.font.color.rgb = NAVY
    
    p_d = tf_st.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = SLATE_BODY
    p_d.space_before = Pt(4)

# 2 Outcome Cards: Approved vs Revision Required
add_card(s14, Inches(0.8), Inches(3.85), Inches(5.7), Inches(2.95), bg_color=CARD_BG)
tb_app = s14.shapes.add_textbox(Inches(1.1), Inches(4.0), Inches(5.1), Inches(2.6))
tf_app = tb_app.text_frame
tf_app.word_wrap = True

p_at = tf_app.paragraphs[0]
p_at.text = "Outcome A: Approved (Status: Approved)"
p_at.font.size = Pt(14)
p_at.font.bold = True
p_at.font.color.rgb = EMERALD

p_ad = tf_app.add_paragraph()
p_ad.text = "• Criteria met according to sprint rubric.\n• Progress advances by +25% on your dashboard.\n• Next milestone unlocks automatically.\n• Mentor leaves commendation and guidance for the subsequent sprint."
p_ad.font.size = Pt(10)
p_ad.font.color.rgb = SLATE_BODY
p_ad.space_before = Pt(6)

add_card(s14, Inches(6.833), Inches(3.85), Inches(5.7), Inches(2.95), bg_color=CARD_BG)
tb_rev = s14.shapes.add_textbox(Inches(7.133), Inches(4.0), Inches(5.1), Inches(2.6))
tf_rev = tb_rev.text_frame
tf_rev.word_wrap = True

p_rt = tf_rev.paragraphs[0]
p_rt.text = "Outcome B: Revision Required (Status: Revision Required)"
p_rt.font.size = Pt(14)
p_rt.font.bold = True
p_rt.font.color.rgb = AMBER

p_rd = tf_rev.add_paragraph()
p_rd.text = "• Specific defects, missing deliverables, or runtime errors identified.\n• Mentor provides actionable inline notes on what needs to be fixed.\n• You have 48 hours to rectify the issues and re-submit via the same portal.\n• Once revised and validated, the milestone is marked Approved."
p_rd.font.size = Pt(10)
p_rd.font.color.rgb = SLATE_BODY
p_rd.space_before = Pt(6)

add_notes(s14, """Presenter Notes:
- Walk interns through the submission interface:
  1. Push code to GitHub.
  2. Open portal, click 'Submit Work' on the active milestone.
  3. Enter repository URL, demo URL, and sprint notes.
- Explain the two possible outcomes:
  - If Approved: Progress increments by 25%, and Milestone N+1 unlocks!
  - If Revision Required: Do not panic! A revision request is normal engineering feedback. Read the mentor's notes, fix the issue within 48 hours, and resubmit.""")

# ==============================================================================
# SLIDE 15: STUDENT PORTAL WALKTHROUGH
# ==============================================================================
s15 = create_slide()
add_header(s15, "Student Dashboard Portal Walkthrough", "Central Hub • vectonix.in/internship/dashboard")

portal_sections = [
    ("Overview Dashboard", "Live progress tracking, milestone sprint countdowns, batch announcements, and upcoming review meeting quick-links.", INDIGO),
    ("Assigned Project Hub", "Complete project specification, problem statement, learning outcomes, tech badges, and simulation safety banners.", BLUE),
    ("Milestone Timeline", "Four customized sprint tracks with detailed tasks, deliverables, submission forms, and mentor review feedback.", PURPLE),
    ("Learning Resources", "Curated official documentation links (Python, ROS 2, Gazebo, Selenium, Scikit-learn) and architectural handbooks.", SKY_BLUE),
    ("Weekly Quizzes", "Weekly 10-question multiple-choice domain assessments opening 24 hours prior to Wednesday review syncs.", AMBER),
    ("Mentor Support Desk", "Direct asynchronous technical ticketing desk for submitting questions, error logs, and scheduling assistance.", EMERALD)
]

for i, (name, desc, col) in enumerate(portal_sections):
    row = i // 3
    col_idx = i % 3
    left = Inches(0.8 + col_idx * 3.98)
    top = Inches(1.8 + row * 2.55)
    
    add_card(s15, left, top, Inches(3.78), Inches(2.35))
    
    icon_box = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.2), top + Inches(0.2), Inches(0.4), Inches(0.4))
    icon_box.fill.solid()
    icon_box.fill.fore_color.rgb = col
    icon_box.line.fill.background()
    
    tb_sec = s15.shapes.add_textbox(left + Inches(0.7), top + Inches(0.18), Inches(2.9), Inches(0.45))
    tf_sec = tb_sec.text_frame
    p_sn = tf_sec.paragraphs[0]
    p_sn.text = name
    p_sn.font.size = Pt(13)
    p_sn.font.bold = True
    p_sn.font.color.rgb = NAVY
    
    tb_sd = s15.shapes.add_textbox(left + Inches(0.2), top + Inches(0.75), Inches(3.38), Inches(1.4))
    tf_sd = tb_sd.text_frame
    tf_sd.word_wrap = True
    p_sd = tf_sd.paragraphs[0]
    p_sd.text = desc
    p_sd.font.size = Pt(10)
    p_sd.font.color.rgb = SLATE_BODY
    p_sd.font.name = "Segoe UI"

add_notes(s15, """Presenter Notes:
- Introduce the Student Dashboard: This is your command center for the next 4 weeks.
- Walk through the 6 modules:
  1. Overview: Quick status and timeline.
  2. Project Hub: Full problem statement and objectives.
  3. Milestone Timeline: Where you submit your work and view grades.
  4. Learning Resources: Official docs for your tech stack.
  5. Quizzes: Weekly knowledge checks.
  6. Support Desk: Where you submit questions to technical mentors.
- Remind students to log in today at vectonix.in/internship/login using their Application ID and registered email.""")

# ==============================================================================
# SLIDE 16: MENTOR SUPPORT & COMMUNICATION
# ==============================================================================
s16 = create_slide()
add_header(s16, "Mentor Support & Communication Protocol", "Getting Help & Technical Support")

# Left: Mentor Team Structure
add_card(s16, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
tb_mteam = s16.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_mteam = tb_mteam.text_frame
tf_mteam.word_wrap = True

p = tf_mteam.paragraphs[0]
p.text = "Your Assigned Technical Mentors"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = INDIGO

team_roles = [
    ("Full Stack Lead:", "Senior Software Architect guiding frontend architecture, REST APIs, and database relations."),
    ("AI & Machine Learning Lead:", "AI Research Specialist assisting with data cleaning, feature engineering, and inference deployment."),
    ("Cybersecurity Specialist:", "Principal Security Consultant guiding defensive threat modeling and secure code audits."),
    ("Robotics & Embedded Lead:", "Robotics Engineer guiding ROS 2 nodes, URDF modeling, and Gazebo/Webots physics simulations."),
    ("QA & Test Automation Lead:", "Quality Assurance Lead guiding Selenium, Pytest, Playwright, and CI/CD pipelines."),
    ("Growth Marketing Strategist:", "Performance Marketing Director guiding SEO audits, analytics, and conversion funnels.")
]

for title, desc in team_roles:
    p_t = tf_mteam.add_paragraph()
    p_t.text = "• " + title + " "
    p_t.font.bold = True
    p_t.font.size = Pt(9.5)
    p_t.font.color.rgb = NAVY
    
    p_d = tf_mteam.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9)
    p_d.font.color.rgb = SLATE_BODY
    p_d.space_before = Pt(1)

# Right: Support Protocol & Best Practices
add_card(s16, Inches(6.833), Inches(1.8), Inches(5.7), Inches(5.0))
tb_proto = s16.shapes.add_textbox(Inches(7.033), Inches(2.0), Inches(5.3), Inches(4.6))
tf_proto = tb_proto.text_frame
tf_proto.word_wrap = True

p = tf_proto.paragraphs[0]
p.text = "How to Ask Technical Questions Effectively"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = BLUE

proto_items = [
    ("1. Use the In-Portal Support Desk:", "Do not send DM spam on personal social media. Submit inquiries through the 'Support Desk' in your student portal for tracked ticket resolution."),
    ("2. Provide Context & Error Logs:", "State clearly: What did you expect? What happened instead? Include the exact terminal error traceback, operating system, and library versions."),
    ("3. Describe What You Have Tried:", "List the debugging steps or StackOverflow/documentation solutions you already attempted. This helps mentors diagnose faster."),
    ("4. Turnaround Time:", "Mentors respond within 12–24 business hours. Complex architectural reviews are addressed during Wednesday syncs.")
]

for title, desc in proto_items:
    p_t = tf_proto.add_paragraph()
    p_t.text = title + " "
    p_t.font.bold = True
    p_t.font.size = Pt(10)
    p_t.font.color.rgb = NAVY
    
    p_d = tf_proto.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = SLATE_BODY
    p_d.space_before = Pt(2)

add_notes(s16, """Presenter Notes:
- Introduce the mentor desk: You have dedicated domain leads ready to support you.
- Explain how to ask questions like a professional engineer:
  - Don't just say 'my code is not working'.
  - Provide the exact error log, your code snippet, and what you've already tried to fix it.
  - This ensures faster, higher-quality debugging and prepares you for real workplace collaboration.""")

# ==============================================================================
# SLIDE 17: OFFICIAL LEARNING RESOURCES
# ==============================================================================
s17 = create_slide()
add_header(s17, "Official Learning Resources & Technical Docs", "Grounded Documentation Hub")

resources_cards = [
    ("Python & AI/ML Docs", "Official Documentation Priority", [
        "Python 3.12 Standard Library Docs",
        "Scikit-Learn Machine Learning Guides",
        "OpenCV Computer Vision Documentation",
        "FastAPI Interactive Tutorial & Specs",
        "PyTorch Deep Learning Guides"
    ], PURPLE),
    ("Robotics & Simulation Docs", "Free Simulation Guides", [
        "ROS 2 Humble Official Documentation",
        "Gazebo Robot Simulation Manual",
        "Webots Robot Simulator User Guide",
        "Tinkercad Circuits Virtual Arduino",
        "Google MediaPipe Hand Landmark API"
    ], EMERALD),
    ("Full Stack & Web Testing Docs", "Modern Production Stacks", [
        "Next.js App Router Documentation",
        "Supabase Database & Auth Guides",
        "Selenium WebDriver Official Guide",
        "Pytest Testing Framework Specs",
        "Playwright End-to-End Testing Docs"
    ], BLUE)
]

for i, (title, sub, links, col) in enumerate(resources_cards):
    left = Inches(0.8 + i * 3.98)
    add_card(s17, left, Inches(1.8), Inches(3.78), Inches(3.7))
    
    top_b = s17.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.8), Inches(3.78), Inches(0.65))
    top_b.fill.solid()
    top_b.fill.fore_color.rgb = col
    top_b.line.fill.background()
    
    tf_th = top_b.text_frame
    p_th = tf_th.paragraphs[0]
    p_th.text = title
    p_th.font.size = Pt(12)
    p_th.font.bold = True
    p_th.font.color.rgb = RGBColor(255, 255, 255)
    
    p_ts = tf_th.add_paragraph()
    p_ts.text = sub
    p_ts.font.size = Pt(9)
    p_ts.font.color.rgb = RGBColor(241, 245, 249)
    
    tb_l = s17.shapes.add_textbox(left + Inches(0.2), Inches(2.55), Inches(3.38), Inches(2.8))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True
    for idx, link in enumerate(links):
        p_l = tf_l.paragraphs[0] if idx == 0 else tf_l.add_paragraph()
        p_l.text = "✓ " + link
        p_l.font.size = Pt(10)
        p_l.font.color.rgb = SLATE_BODY
        p_l.font.name = "Segoe UI"
        p_l.space_after = Pt(8)

# Bottom note
add_card(s17, Inches(0.8), Inches(5.7), Inches(11.733), Inches(1.2), bg_color=CARD_BG)
tb_rn = s17.shapes.add_textbox(Inches(1.1), Inches(5.8), Inches(11.1), Inches(1.0))
tf_rn = tb_rn.text_frame
tf_rn.word_wrap = True

p_rnt = tf_rn.paragraphs[0]
p_rnt.text = "Zero Fake Resource Links Policy:"
p_rnt.font.size = Pt(12)
p_rnt.font.bold = True
p_rnt.font.color.rgb = NAVY

p_rnd = tf_rn.add_paragraph()
p_rnd.text = "All learning resources connected to the student portal link directly to official maintainer documentation, certified foundation guides, and verified API references. We teach you how to read authentic documentation — the most vital skill of a professional developer."
p_rnd.font.size = Pt(9.5)
p_rnd.font.color.rgb = SLATE_BODY
p_rnd.space_before = Pt(2)

add_notes(s17, """Presenter Notes:
- Emphasize our learning philosophy: Industry engineers don't rely on random unverified YouTube snippets; they read official documentation.
- Every project template links to official docs: Python, Scikit-learn, ROS 2, Gazebo, Selenium, Next.js, and Supabase.
- Learning to navigate and understand official technical documentation is one of the greatest career skills you will take away from this internship.""")

# ==============================================================================
# SLIDE 18: RULES, CODE OF CONDUCT & RESPONSIBILITIES
# ==============================================================================
s18 = create_slide()
add_header(s18, "Student Code of Conduct & Responsibilities", "Professional Standards & Integrity")

rules = [
    ("Academic & Code Integrity", "Originality is strictly enforced. Plagiarism from peer repos or uncredited sources will result in immediate disqualification. AI coding assistants (ChatGPT, Gemini, Copilot) are permitted as research aids, but you must be able to explain every line of code you submit.", INDIGO),
    ("Deadline Compliance", "Milestone sprint deadlines close on their respective scheduled dates at 23:59 IST. Extensions are granted only for verifiable academic examination conflicts notified in advance through the portal support desk.", BLUE),
    ("Professional Communication", "Maintain courteous, respectful communication in all Google Meet syncs, mentor support tickets, and cohort discussions. Professionalism is evaluated as part of your overall performance score.", PURPLE),
    ("Testing & Security Constraints", "For Cybersecurity & Software Testing interns: All testing and scanning must strictly target localhost or authorized staging sandboxes. Running denial-of-service or port scans on unauthorized targets is strictly prohibited.", ROSE)
]

for i, (title, desc, col) in enumerate(rules):
    top = Inches(1.8 + i * 1.25)
    add_card(s18, Inches(0.8), top, Inches(11.733), Inches(1.1), bg_color=CARD_BG)
    
    # Left accent
    acc = s18.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top, Inches(0.18), Inches(1.1))
    acc.fill.solid()
    acc.fill.fore_color.rgb = col
    acc.line.fill.background()
    
    tb_r = s18.shapes.add_textbox(Inches(1.15), top + Inches(0.1), Inches(11.2), Inches(0.9))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    
    p_rt = tf_r.paragraphs[0]
    p_rt.text = title
    p_rt.font.size = Pt(13)
    p_rt.font.bold = True
    p_rt.font.color.rgb = NAVY
    
    p_rd = tf_r.add_paragraph()
    p_rd.text = desc
    p_rd.font.size = Pt(9.5)
    p_rd.font.color.rgb = SLATE_BODY
    p_rd.space_before = Pt(2)

add_notes(s18, """Presenter Notes:
- Review the code of conduct:
  1. Code Integrity: You can use AI tools to brainstorm or debug, but you must understand every single line of code. If you cannot explain your code during reviews, it will not be approved.
  2. Deadlines: Respect the 7-day sprint schedules.
  3. Professionalism: Treat your peers and mentors with courtesy.
  4. Testing Safety: Cybersecurity and QA interns must keep all test operations strictly local.""")

# ==============================================================================
# SLIDE 19: FINAL EVALUATION & CERTIFICATE ELIGIBILITY
# ==============================================================================
s19 = create_slide()
add_header(s19, "Final Evaluation & Certificate Eligibility", "Grading Rubric & Verification")

# Left Column: Grading Rubric
add_card(s19, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
tb_rub = s19.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_rub = tb_rub.text_frame
tf_rub.word_wrap = True

p = tf_rub.paragraphs[0]
p.text = "100-Point Evaluation Rubric"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = INDIGO

rubric = [
    ("Milestone Deliverables & Code Quality (40 Marks):", "Clean Git commits, modular code structure, adherence to industry coding standards, and inline documentation."),
    ("System Architecture & Functionality (25 Marks):", "Reliability, feature completeness, correct algorithmic implementation, and handling of edge-case scenarios."),
    ("Technical Report & Video Demonstration (20 Marks):", "Depth of the written project report PDF and clarity of the 3–5 min demonstration walkthrough video."),
    ("Weekly Review Engagement & Quizzes (15 Marks):", "Punctual attendance, meaningful discussion in weekly syncs, and completion of domain knowledge quizzes.")
]

for title, desc in rubric:
    p_t = tf_rub.add_paragraph()
    p_t.text = "• " + title + " "
    p_t.font.bold = True
    p_t.font.size = Pt(10)
    p_t.font.color.rgb = NAVY
    
    p_d = tf_rub.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = SLATE_BODY
    p_d.space_before = Pt(2)

# Right Column: Certification Criteria
add_card(s19, Inches(6.833), Inches(1.8), Inches(5.7), Inches(5.0))
tb_cert = s19.shapes.add_textbox(Inches(7.033), Inches(2.0), Inches(5.3), Inches(4.6))
tf_cert = tb_cert.text_frame
tf_cert.word_wrap = True

p = tf_cert.paragraphs[0]
p.text = "Certificate Eligibility & Offerings"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = EMERALD

cert_items = [
    ("Eligibility Threshold:", "Interns must achieve a minimum cumulative score of 70% and have all 4 milestones formally approved by mentors."),
    ("Certificate of Completion:", "Issued digitally with a unique cryptographic Certificate ID verifiable worldwide at vectonix.in/verify."),
    ("Letter of Recommendation (LOR):", "Awarded to top 15% performers demonstrating exceptional technical depth, leadership, and exemplary sprint consistency."),
    ("Issuance Date:", "Final evaluations completed on 24–25 December 2026. Official verifiable credentials released on 25 December 2026.")
]

for title, desc in cert_items:
    p_t = tf_cert.add_paragraph()
    p_t.text = title + " "
    p_t.font.bold = True
    p_t.font.size = Pt(10.5)
    p_t.font.color.rgb = NAVY
    
    p_d = tf_cert.add_paragraph()
    p_d.text = desc
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = SLATE_BODY
    p_d.space_before = Pt(2)

add_notes(s19, """Presenter Notes:
- Review the 100-mark evaluation rubric:
  - 40 Marks: Code Quality and Milestones.
  - 25 Marks: System Functionality and Architecture.
  - 20 Marks: Technical Report & Video Demo.
  - 15 Marks: Sync Engagement & Quizzes.
- Certification Criteria: You need 70% or higher and all 4 milestones approved.
- Top performers (top 15%) also receive Letters of Recommendation for higher studies and job applications.
- All certificates come with a unique ID verifiable anytime at vectonix.in/verify.""")

# ==============================================================================
# SLIDE 20: Q&A & CONTACT INFORMATION
# ==============================================================================
s20 = create_slide(bg_color=NAVY)

# Ambient accent border
accent_bar = s20.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.35), Inches(7.5))
accent_bar.fill.solid()
accent_bar.fill.fore_color.rgb = INDIGO
accent_bar.line.fill.background()

# Logo
if os.path.exists(LOGO_PATH):
    try:
        s20.shapes.add_picture(LOGO_PATH, Inches(1.2), Inches(1.0), width=Inches(3.2))
    except Exception:
        pass

tb_qa = s20.shapes.add_textbox(Inches(1.2), Inches(2.2), Inches(11.0), Inches(2.2))
tf_qa = tb_qa.text_frame
tf_qa.word_wrap = True

p_q1 = tf_qa.paragraphs[0]
p_q1.text = "Questions & Answers"
p_q1.font.size = Pt(36)
p_q1.font.bold = True
p_q1.font.color.rgb = RGBColor(255, 255, 255)

p_q2 = tf_qa.add_paragraph()
p_q2.text = "The floor is now open for your questions and technical clarifications."
p_q2.font.size = Pt(16)
p_q2.font.color.rgb = RGBColor(192, 132, 252) # Purple 400
p_q2.space_before = Pt(4)

p_q3 = tf_qa.add_paragraph()
p_q3.text = "Next Steps for Tonight:\n1. Log into your dashboard at vectonix.in/internship/login.\n2. Review your allocated project specifications and milestone rubric.\n3. Milestone 1 commences tomorrow, 26 November 2026."
p_q3.font.size = Pt(12)
p_q3.font.color.rgb = RGBColor(203, 213, 225)
p_q3.space_before = Pt(12)

# Contact Info Box
cbox = s20.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(4.8), Inches(10.9), Inches(1.8))
cbox.fill.solid()
cbox.fill.fore_color.rgb = RGBColor(30, 41, 59)
cbox.line.color.rgb = RGBColor(51, 65, 85)

tf_cb = cbox.text_frame
tf_cb.word_wrap = True

p_c1 = tf_cb.paragraphs[0]
p_c1.text = "OFFICIAL VECTONIX CONTACT CHANNELS"
p_c1.font.size = Pt(12)
p_c1.font.bold = True
p_c1.font.color.rgb = RGBColor(241, 245, 249)

contacts = [
    ("Website:", "https://vectonix.in"),
    ("Student Portal:", "https://vectonix.in/internship/dashboard"),
    ("Official Email:", "vectonixofficial@gmail.com"),
    ("Company:", "VECTONIX PRIVATE LIMITED")
]

for label, val in contacts:
    p_cl = tf_cb.add_paragraph()
    p_cl.text = label + " "
    p_cl.font.bold = True
    p_cl.font.size = Pt(10.5)
    p_cl.font.color.rgb = RGBColor(165, 180, 252) # Indigo 300
    
    # We append value in same line
    run = p_cl.add_run()
    run.text = val
    run.font.bold = False
    run.font.color.rgb = RGBColor(255, 255, 255)

add_notes(s20, """Presenter Notes:
- Open the floor for any student questions!
- Address questions regarding domain selection, Git setup, simulator installations, or review scheduling.
- Reiterate your immediate next steps: Log into the student dashboard at vectonix.in/internship/login tonight, inspect your allocated project, and get started with Milestone 1 research tomorrow morning.
- Wish every intern an inspiring, productive, and career-defining winter internship with Vectonix Private Limited!""")

# ==============================================================================
# SAVE PRESENTATION
# ==============================================================================
OUTPUT_FILE = "Vectonix_Winter_Internship_2026_Induction_Program.pptx"
prs.save(OUTPUT_FILE)
print(f"Presentation successfully created with {len(prs.slides)} slides: {OUTPUT_FILE}")
