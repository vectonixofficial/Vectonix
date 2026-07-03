-- Seed Data for Supabase Public Database

INSERT INTO public.certificates (certificate_id, student_name, college_name, domain, start_date, end_date, issue_date, signature_image, verification_status, type) VALUES
('VT/INT/FS/2026/0001', 'Thilagavathi S', 'V.S.B Engineering College, Karur (B.E. CCE)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0002', 'Lohit D', 'VSB Engineering College, Karur (B.Tech)', 'Artificial Intelligence and Data Science (Web Development)', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0003', 'Antony Sujin A', 'V.S.B College of Engineering and Technical Campus (B.E.)', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0004', 'Mounishwaran L', 'VSB Engineering College (B.Tech AI & DS)', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0005', 'Reena S', 'V.S.B College of Engineering Technical Campus, Coimbatore (B.E. ECE)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0006', 'Jeevananthan S', 'VSB Engineering College (B.Tech AI & DS)', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0007', 'Kanagavalli V', 'VSB Engineering College, Karur (B.Tech)', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0008', 'Ruchika Ashok Kumar', 'KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)', 'Cyber Security', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0009', 'Sandiya S', 'KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)', 'Cyber Security', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0010', 'Saranya M', 'KIT — Kalaignar Karunanidhi Institute of Technology (B.E.)', 'Cyber Security', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0011', 'Sakthi Manoj M', 'VSB Engineering College (B.E. CCE)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0012', 'Nagalakshmi P', 'Christian College of Engineering and Technology (B.E.)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0013', 'Sivane K', 'SRM Madurai College for Engineering and Technology (B.E. CSE)', 'MERN Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0014', 'Rithicka Shree P', 'KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)', 'Cyber Security', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0015', 'Dhanu Sri R', 'KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)', 'Cyber Security', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0018', 'Dharshini C', 'VSB Engineering College (B.E. ECE)', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0019', 'Malini M', 'VSB Engineering College, Karur (B.Tech AI & DS)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion'),
('VT/INT/FS/2026/0020', 'Dhanush M', 'VSB Engineering College (B.Tech)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion')
ON CONFLICT (certificate_id) DO NOTHING;
