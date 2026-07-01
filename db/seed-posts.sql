-- StudyBlog sample content (Phase 3). Idempotent (INSERT OR IGNORE by slug/refs).
-- Apply AFTER migrations + seed-domains.sql. Coverage story mirrors the design mockups:
--   A+ 4/9 domains (44%), Security+ 3/5 (60%), Network+ 0/5 (0%).
-- Owner replaces this with real posts before launch; kept in the repo so a fresh clone renders.
-- domain_id + exam are resolved by domain_ref subquery so they survive re-seeding.

-- ---- tags ----
INSERT OR IGNORE INTO tags (slug, name) VALUES
  ('subnetting','Subnetting'), ('networking','Networking'), ('cidr','CIDR'), ('ports','Ports'),
  ('reference','Reference'), ('troubleshooting','Troubleshooting'), ('hardware','Hardware'),
  ('raid','RAID'), ('home-lab','Home lab'), ('windows','Windows'), ('hardening','Hardening'),
  ('security','Security'), ('vulnerability-management','Vulnerability management'),
  ('openvas','OpenVAS'), ('cia-triad','CIA triad'), ('fundamentals','Fundamentals'),
  ('phishing','Phishing'), ('social-engineering','Social engineering'), ('siem','SIEM'),
  ('splunk','Splunk'), ('malware','Malware'), ('study-guide','Study guide'), ('milestones','Milestones');

-- ---- posts ----
INSERT OR IGNORE INTO posts (slug, title, excerpt, body_md, type, section_slug, domain_id, exam, status, featured, reading_minutes, published_at, created_at, updated_at)
VALUES (
  'subnetting-without-tears',
  'Subnetting Without Tears: How CIDR Finally Clicked',
  'Subnetting felt like arithmetic homework with no payoff — until I stopped thinking in decimal and started thinking in blocks.',
  'Subnetting used to feel like arithmetic homework with no payoff. Then it clicked, and the trick was to stop thinking in decimal and start thinking in blocks.

## Why CIDR beats memorizing masks

A `/24` is not a magic number. It is just 24 network bits, which leaves 8 host bits, which is 256 addresses. Every mask is that same story: bits borrowed, addresses left.

## The block-size shortcut

Find the interesting octet, subtract from 256, and count in blocks:

```text
/26  ->  256 - 192 = 64   (blocks: .0 .64 .128 .192)
/27  ->  256 - 224 = 32
/28  ->  256 - 240 = 16
```

### A worked example

Given `192.168.10.100/26`, the block size is 64, so the subnet is `192.168.10.64`, the broadcast is `192.168.10.127`, and usable hosts run `.65` to `.126`.

## What finally made it stick

Doing twenty of these by hand, out loud, until the block sizes were reflex. That is the whole secret.',
  'concept','a-plus',(SELECT id FROM domains WHERE domain_ref='A+C1.2'),'220-1201','published',0,7,
  unixepoch('2026-06-18T12:00:00Z'), unixepoch('2026-06-18T12:00:00Z'), unixepoch('2026-06-18T12:00:00Z')
);

INSERT OR IGNORE INTO posts (slug, title, excerpt, body_md, type, section_slug, domain_id, exam, status, featured, reading_minutes, published_at, created_at, updated_at)
VALUES (
  'ports-and-protocols-cheat-sheet',
  'Ports & Protocols Cheat Sheet (A+ / Net+ / Sec+)',
  'The ports that show up on all three exams, in one table I actually kept open while studying.',
  'A living cheat sheet of the ports that show up across A+, Network+, and Security+. Bookmark it.

## The ones worth memorizing

| Port | Protocol | Notes |
|---|---|---|
| 22 | SSH | Secure shell + SCP/SFTP |
| 53 | DNS | UDP for lookups, TCP for zone transfers |
| 80 / 443 | HTTP / HTTPS | 443 is TLS |
| 445 | SMB | File sharing, ransomware loves it |
| 3389 | RDP | Remote Desktop |

## How I actually learned them

Flashcards for a week, then re-deriving the "why" for each one. A port you understand is a port you keep.',
  'cram','a-plus',(SELECT id FROM domains WHERE domain_ref='A+C1.2'),'220-1201','published',0,4,
  unixepoch('2026-06-15T12:00:00Z'), unixepoch('2026-06-15T12:00:00Z'), unixepoch('2026-06-20T12:00:00Z')
);

INSERT OR IGNORE INTO posts (slug, title, excerpt, body_md, type, section_slug, domain_id, exam, status, featured, reading_minutes, published_at, created_at, updated_at)
VALUES (
  'no-post-no-beep',
  'No POST, No Beep: Walking the A+ Troubleshooting Methodology on a Dead PC',
  'A machine that would not POST became the perfect excuse to run the six-step methodology for real.',
  'A dead bench PC is the best way to learn the A+ troubleshooting methodology, because guessing gets expensive fast.

## Identify the problem

No POST, no beep, fans spin. That last detail matters: power is reaching the board.

## Establish a theory

Reseat, then isolate. I pulled RAM, GPU, and every non-essential cable, then powered on to a single stick.

## Test the theory

```text
1 stick  -> single beep, POST reached
2 sticks -> silence
```

The second DIMM slot was dead. Not the RAM — the board.

## What the methodology saved me

An hour of ordering the wrong part. Follow the steps even when you think you know the answer.',
  'troubleshooting','a-plus',(SELECT id FROM domains WHERE domain_ref='A+C1.5'),'220-1201','published',0,9,
  unixepoch('2026-06-12T12:00:00Z'), unixepoch('2026-06-12T12:00:00Z'), unixepoch('2026-06-12T12:00:00Z')
);

INSERT OR IGNORE INTO posts (slug, title, excerpt, body_md, type, section_slug, domain_id, exam, status, featured, reading_minutes, published_at, created_at, updated_at)
VALUES (
  'home-lab-bench-raid',
  'Building a Home Lab Bench: RAID, PSUs, and What I Fried',
  'What a first hardware bench teaches you that no textbook does — including one dead power supply.',
  'I wanted a bench I could break things on. Here is what the first build taught me, including the part I fried.

## The parts that mattered

An old tower, three mismatched drives, and a PSU with a suspicious past. That PSU is now scrap.

## RAID in practice

I set up RAID 1 across two drives to feel the mirroring, not just read about it. Pulling a drive mid-write and watching the rebuild is worth more than any diagram.

## Lesson learned

Never trust a power supply you cannot test. A cheap PSU tester pays for itself the first time it saves a motherboard.',
  'lab','a-plus',(SELECT id FROM domains WHERE domain_ref='A+C1.3'),'220-1201','published',0,6,
  unixepoch('2026-05-28T12:00:00Z'), unixepoch('2026-05-28T12:00:00Z'), unixepoch('2026-05-28T12:00:00Z')
);

INSERT OR IGNORE INTO posts (slug, title, excerpt, body_md, type, section_slug, domain_id, exam, status, featured, reading_minutes, published_at, created_at, updated_at)
VALUES (
  'windows-hardening-basics',
  'A+ Security: Windows Hardening Basics That Actually Matter',
  'The handful of Windows settings that move the needle — and why the A+ objectives keep asking about them.',
  'Most Windows hardening advice is a checklist nobody reads. These are the few settings that actually change your risk.

## Accounts and least privilege

Standard user for daily work, admin only when prompted. Most malware inherits the rights of whoever runs it.

## Turn on the built-ins

```powershell
Set-MpPreference -DisableRealtimeMonitoring $false
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256
```

Defender and BitLocker are free and effective. Use them.

## Why A+ cares

Because these are the controls a help-desk tech can actually set on day one. Exam-relevant and job-relevant at the same time.',
  'concept','a-plus',(SELECT id FROM domains WHERE domain_ref='A+C2.2'),'220-1202','published',0,5,
  unixepoch('2026-06-10T12:00:00Z'), unixepoch('2026-06-10T12:00:00Z'), unixepoch('2026-06-10T12:00:00Z')
);

INSERT OR IGNORE INTO posts (slug, title, excerpt, body_md, type, section_slug, domain_id, exam, status, featured, reading_minutes, repo_url, demo_url, project_meta, published_at, created_at, updated_at)
VALUES (
  'vulnerability-management-home-lab',
  'Vulnerability Management in My Home Lab: 47 Hosts, 12 Criticals → 3',
  'I built a credentialed-scan pipeline with OpenVAS, triaged everything by real exploitability, and drove criticals from 12 to 3 in a week.',
  'A home lab is only useful if you treat it like it matters. So I ran a real vulnerability-management cycle against mine.

## The goal

Stop guessing which boxes were risky and get a ranked, evidence-backed list I could actually work through.

## The pipeline

Credentialed scans beat unauthenticated ones every time — they see patch levels instead of guessing.

```bash
# kick off a credentialed scan across the lab subnet
gvm-cli socket --xml "<create_task>...</create_task>"
gvm-cli socket --gmp-username admin --gmp-password $PW < scan.xml
```

## Triage by exploitability, not CVSS alone

A 9.8 with no network path is not my top problem. I sorted by "reachable AND exploitable AND on a box that matters."

## Results

Twelve criticals became three in a week, and the remaining three had a documented reason to stay open.

## What I would do differently

Automate the re-scan on a schedule instead of running it by hand. That is the next iteration.',
  'project','security-plus',(SELECT id FROM domains WHERE domain_ref='SEC.4'),'SY0-701','published',1,14,
  'https://github.com/DVitsme/homelab-vuln-mgmt',
  'https://youtu.be/dQw4w9WgXcQ',
  '{"goal":"Find and remediate the real risk on my home lab before it bites me.","stack":["OpenVAS","Greenbone","Ansible","Bash"],"duration":"1 week","status":"Shipped","metrics":["47|hosts scanned","12 → 3|criticals remediated","92%|of highs closed"]}',
  unixepoch('2026-06-25T12:00:00Z'), unixepoch('2026-06-25T12:00:00Z'), unixepoch('2026-06-25T12:00:00Z')
);

INSERT OR IGNORE INTO posts (slug, title, excerpt, body_md, type, section_slug, domain_id, exam, status, featured, reading_minutes, published_at, created_at, updated_at)
VALUES (
  'cia-triad-explained',
  'The CIA Triad, Explained With Things That Actually Broke',
  'Confidentiality, integrity, availability — grounded in three outages I actually caused or watched happen.',
  'Every security course opens with the CIA triad and then never mentions it again. Here it is grounded in things that actually broke.

## Confidentiality

The time a shared drive was readable by the whole company. Nobody attacked anything — the permissions were just wrong.

## Integrity

A synced spreadsheet where two people overwrote each other for a week. The data was available and secret and completely untrustworthy.

## Availability

A backup job that filled the disk and took the app offline. Perfectly confidential, perfectly intact, and perfectly useless while it was down.

## Why the triad sticks

Because every real incident degrades one leg of it. Name the leg and you already understand the failure.',
  'concept','security-plus',(SELECT id FROM domains WHERE domain_ref='SEC.1'),'SY0-701','published',0,6,
  unixepoch('2026-06-19T12:00:00Z'), unixepoch('2026-06-19T12:00:00Z'), unixepoch('2026-06-19T12:00:00Z')
);

INSERT OR IGNORE INTO posts (slug, title, excerpt, body_md, type, section_slug, domain_id, exam, status, featured, reading_minutes, published_at, created_at, updated_at)
VALUES (
  'phishing-whole-family',
  'Phishing''s Whole Family: Vishing, Smishing, and Pretexting',
  'Phishing is a category, not a single attack. Meeting the whole family makes the exam questions obvious.',
  'Phishing is a family of attacks, and the exam loves testing whether you can tell the cousins apart.

## The core move

Every one of these is pretext plus urgency plus a channel. Change the channel, rename the attack.

## The family

- **Phishing** — email
- **Vishing** — voice, a phone call
- **Smishing** — SMS text
- **Pretexting** — the invented backstory underneath all of them

## Why it matters

The control is the same across the family: verify out of band before you act. Teach that once and you have covered the whole tree.',
  'concept','security-plus',(SELECT id FROM domains WHERE domain_ref='SEC.2'),'SY0-701','published',0,5,
  unixepoch('2026-06-16T12:00:00Z'), unixepoch('2026-06-16T12:00:00Z'), unixepoch('2026-06-16T12:00:00Z')
);

INSERT OR IGNORE INTO posts (slug, title, excerpt, body_md, type, section_slug, domain_id, exam, status, featured, reading_minutes, published_at, created_at, updated_at)
VALUES (
  'splunk-free-first-siem',
  'Standing Up Splunk Free: My First Real SIEM Dashboard',
  'From zero to a working dashboard: ingesting logs, writing my first SPL, and seeing an attack in the data.',
  'A SIEM is abstract until you watch your own logs light up. So I stood up Splunk Free and pointed my lab at it.

## Getting data in

The universal forwarder is the whole game. Once logs flow, everything else is queries.

```bash
./splunk add forward-server 192.168.10.5:9997
./splunk add monitor /var/log
```

## My first useful search

Counting failed logins by host surfaced a box I had forgotten was internet-facing.

```text
index=main sourcetype=auth "failed password"
| stats count by host
| sort -count
```

## What clicked

A SIEM is just questions asked against a haystack. The hard part is knowing which questions to ask — and that comes from the rest of the Security+ material.',
  'lab','security-plus',(SELECT id FROM domains WHERE domain_ref='SEC.4'),'SY0-701','published',0,11,
  unixepoch('2026-06-14T12:00:00Z'), unixepoch('2026-06-14T12:00:00Z'), unixepoch('2026-06-14T12:00:00Z')
);

INSERT OR IGNORE INTO posts (slug, title, excerpt, body_md, type, section_slug, domain_id, exam, status, featured, reading_minutes, published_at, created_at, updated_at)
VALUES (
  'malware-types-mnemonics',
  'Malware Types SY0-701 Will Ask About (With Mnemonics)',
  'A study guide to the malware zoo, with the mnemonics that got the definitions to stick.',
  'The malware section is pure vocabulary, so I turned it into mnemonics that actually stick.

## The zoo

- **Virus** — needs a host file and a human to run it
- **Worm** — self-propagates across the network, no help needed
- **Trojan** — pretends to be something you want
- **Ransomware** — encrypts, then extorts
- **RAT** — remote access trojan, hands-on-keyboard access

## The mnemonic that worked

"Worms wander, viruses need a vehicle." One line separated the two answers I kept missing.

## How to study it

Do not memorize definitions cold. Attach each to one real incident you have read about, and recall becomes retrieval instead of guessing.',
  'study-guide','security-plus',(SELECT id FROM domains WHERE domain_ref='SEC.2'),'SY0-701','published',0,8,
  unixepoch('2026-05-30T12:00:00Z'), unixepoch('2026-05-30T12:00:00Z'), unixepoch('2026-05-30T12:00:00Z')
);

INSERT OR IGNORE INTO posts (slug, title, excerpt, body_md, type, section_slug, domain_id, exam, status, featured, reading_minutes, published_at, created_at, updated_at)
VALUES (
  'week-6-first-practice-test',
  'Week 6: 14 Hours In, First Core 1 Practice Test at 81%',
  'A weekly journal entry: what 14 hours of study bought me, and where the 19% I missed actually lives.',
  'Six weeks in. Here is the honest scorecard for the week.

## The number

First full Core 1 practice test: 81%. Good enough to be encouraging, low enough to stay humble.

## Where I lost points

Almost all of it was printers and virtualization — the two domains I have been quietly avoiding. The data does not let you hide.

## Next week

Stop avoiding the boring domains. The plan is two focused sessions on printing and one on virtualization, then a re-test.',
  'journal','journey',NULL,NULL,'published',0,3,
  unixepoch('2026-06-22T12:00:00Z'), unixepoch('2026-06-22T12:00:00Z'), unixepoch('2026-06-22T12:00:00Z')
);

-- ---- post_tags (link by slug so ids stay decoupled) ----
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p JOIN tags t
WHERE (p.slug='subnetting-without-tears'         AND t.slug IN ('subnetting','networking','cidr'))
   OR (p.slug='ports-and-protocols-cheat-sheet'  AND t.slug IN ('ports','networking','reference'))
   OR (p.slug='no-post-no-beep'                  AND t.slug IN ('troubleshooting','hardware'))
   OR (p.slug='home-lab-bench-raid'              AND t.slug IN ('hardware','raid','home-lab'))
   OR (p.slug='windows-hardening-basics'         AND t.slug IN ('windows','hardening','security'))
   OR (p.slug='vulnerability-management-home-lab' AND t.slug IN ('vulnerability-management','openvas','home-lab','security'))
   OR (p.slug='cia-triad-explained'              AND t.slug IN ('cia-triad','fundamentals','security'))
   OR (p.slug='phishing-whole-family'            AND t.slug IN ('phishing','social-engineering','security'))
   OR (p.slug='splunk-free-first-siem'           AND t.slug IN ('siem','splunk','home-lab'))
   OR (p.slug='malware-types-mnemonics'          AND t.slug IN ('malware','study-guide','security'))
   OR (p.slug='week-6-first-practice-test'       AND t.slug IN ('milestones'));
