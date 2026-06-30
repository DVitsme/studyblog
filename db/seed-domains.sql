-- StudyBlog reference data: cert sections + official exam-objective domains.
-- Idempotent (INSERT OR IGNORE). Apply AFTER migrations. See plan/05-content-taxonomy.md §3.

INSERT OR IGNORE INTO sections (slug, name, exam_codes, sort, active) VALUES
  ('a-plus',        'CompTIA A+',        '220-1201, 220-1202', 1, 1),
  ('security-plus', 'CompTIA Security+', 'SY0-701',            2, 1),
  ('network-plus',  'CompTIA Network+',  'N10-009',            3, 1),
  ('journey',       'The Journey',       '',                   4, 1);

INSERT OR IGNORE INTO domains (section_slug, exam, domain_ref, name, weight, sort) VALUES
  -- A+ Core 1 (220-1201)
  ('a-plus', '220-1201', 'A+C1.1', 'Mobile Devices',                      13, 1),
  ('a-plus', '220-1201', 'A+C1.2', 'Networking',                          23, 2),
  ('a-plus', '220-1201', 'A+C1.3', 'Hardware',                            25, 3),
  ('a-plus', '220-1201', 'A+C1.4', 'Virtualization & Cloud',              11, 4),
  ('a-plus', '220-1201', 'A+C1.5', 'Hardware & Network Troubleshooting',  28, 5),
  -- A+ Core 2 (220-1202)
  ('a-plus', '220-1202', 'A+C2.1', 'Operating Systems',                   28, 6),
  ('a-plus', '220-1202', 'A+C2.2', 'Security',                            28, 7),
  ('a-plus', '220-1202', 'A+C2.3', 'Software Troubleshooting',            23, 8),
  ('a-plus', '220-1202', 'A+C2.4', 'Operational Procedures',              21, 9),
  -- Network+ (N10-009)
  ('network-plus', 'N10-009', 'NET.1', 'Networking Concepts',     23, 1),
  ('network-plus', 'N10-009', 'NET.2', 'Network Implementation',  20, 2),
  ('network-plus', 'N10-009', 'NET.3', 'Network Operations',      19, 3),
  ('network-plus', 'N10-009', 'NET.4', 'Network Security',        14, 4),
  ('network-plus', 'N10-009', 'NET.5', 'Network Troubleshooting', 24, 5),
  -- Security+ (SY0-701)
  ('security-plus', 'SY0-701', 'SEC.1', 'General Security Concepts',                  12, 1),
  ('security-plus', 'SY0-701', 'SEC.2', 'Threats, Vulnerabilities & Mitigations',    22, 2),
  ('security-plus', 'SY0-701', 'SEC.3', 'Security Architecture',                      18, 3),
  ('security-plus', 'SY0-701', 'SEC.4', 'Security Operations',                        28, 4),
  ('security-plus', 'SY0-701', 'SEC.5', 'Security Program Management & Oversight',    20, 5);
