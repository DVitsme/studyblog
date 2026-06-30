# 05 — Content Taxonomy & Seed Data

The content model and the **seed data** that fills it. Implements the four axes from
`01-product-spec.md` §3 against the schema in `03-data-model.md`. Exam domains/weights are from the
official CompTIA objectives (verified mid-2026); cross-cutting tags are the connective tissue.

---

## 1. The four axes (recap)

| Axis | Cardinality | Stored as | Powers |
|------|-------------|-----------|--------|
| **Section** | 1 | `sections` table | cert hubs, top nav, URL space |
| **Category** = exam **domain** | 1 (nullable for `journey`) | `domains` table (`domain_ref`) | domain archives, **coverage tracker** |
| **Type** | 1 | `posts.type` enum | format badges, `/types/*` |
| **Tags** | 0..n | `tags` + `post_tags` | cross-cert concept hubs `/tags/*` |
| `exam` pin | 1 | `posts.exam` | future-proofing exam versions |

## 2. Sections (seed `sections`)

| slug | name | exam_codes | notes |
|------|------|-----------|-------|
| `a-plus` | CompTIA A+ | 220-1201, 220-1202 | two exams; first-class |
| `security-plus` | CompTIA Security+ | SY0-701 | the cleared-role gate; first-class |
| `network-plus` | CompTIA Network+ | N10-009 | optional/later — present but lighter |
| `journey` | The Journey | — | cert-agnostic: study system, journals, gear, exam-day logs |

> UI honesty: A+ and Security+ lead; Network+ is visibly "planned/early." The coverage tracker shows
> real per-exam progress rather than implying parity.

## 3. Domains (seed `domains`) — the categories

Official top-level domains + weights. `domain_ref` is the stable join key for coverage.

### A+ Core 1 — `exam = 220-1201` · `section = a-plus`
| domain_ref | name | weight |
|------------|------|-------:|
| `A+C1.1` | Mobile Devices | 13 |
| `A+C1.2` | Networking | 23 |
| `A+C1.3` | Hardware | 25 |
| `A+C1.4` | Virtualization & Cloud | 11 |
| `A+C1.5` | Hardware & Network Troubleshooting | 28 |

### A+ Core 2 — `exam = 220-1202` · `section = a-plus`
| domain_ref | name | weight |
|------------|------|-------:|
| `A+C2.1` | Operating Systems | 28 |
| `A+C2.2` | Security | 28 |
| `A+C2.3` | Software Troubleshooting | 23 |
| `A+C2.4` | Operational Procedures | 21 |

### Network+ — `exam = N10-009` · `section = network-plus`
| domain_ref | name | weight |
|------------|------|-------:|
| `NET.1` | Networking Concepts | 23 |
| `NET.2` | Network Implementation | 20 |
| `NET.3` | Network Operations | 19 |
| `NET.4` | Network Security | 14 |
| `NET.5` | Network Troubleshooting | 24 |

### Security+ — `exam = SY0-701` · `section = security-plus`
| domain_ref | name | weight |
|------------|------|-------:|
| `SEC.1` | General Security Concepts | 12 |
| `SEC.2` | Threats, Vulnerabilities & Mitigations | 22 |
| `SEC.3` | Security Architecture | 18 |
| `SEC.4` | Security Operations | 28 |
| `SEC.5` | Security Program Management & Oversight | 20 |

> **Future exam versions:** when SY0-801 ("V8", draft, tentative GA ~Nov 2026) lands, add new
> `domains` rows under `section = security-plus` with `exam = SY0-801`; old posts keep their
> `SY0-701` pin. No migration of existing content needed.

### Seed file shape (`db/seed-domains.sql`)
```sql
INSERT OR IGNORE INTO sections (slug,name,exam_codes,sort,active) VALUES
 ('a-plus','CompTIA A+','220-1201, 220-1202',1,1),
 ('security-plus','CompTIA Security+','SY0-701',2,1),
 ('network-plus','CompTIA Network+','N10-009',3,1),
 ('journey','The Journey','',4,1);

INSERT OR IGNORE INTO domains (section_slug,exam,domain_ref,name,weight,sort) VALUES
 ('a-plus','220-1201','A+C1.1','Mobile Devices',13,1),
 ('a-plus','220-1201','A+C1.2','Networking',23,2),
 -- … all rows above …
 ('security-plus','SY0-701','SEC.5','Security Program Management & Oversight',20,5);
```
Apply to **both** local and remote D1 (`03-data-model.md` §9).

## 4. Tag vocabulary (seed `tags`)

Cross-cutting concepts/acronyms that **intentionally span certs** — a reader on `/tags/firewalls`
sees A+, Net+, and Sec+ posts together. Grouped here for the seed; flat in the DB (`tags.group`
optional). Starter set (extend freely from the editor):

- **networking-core:** `tcp-ip` · `osi-model` · `subnetting` · `ipv4` · `ipv6` · `ports-and-protocols` · `dns` · `dhcp` · `nat` · `vlan` · `routing` · `switching` · `wifi-802-11`
- **connectivity-remote:** `vpn` · `ssh` · `rdp` · `proxy` · `firewalls` · `nac` · `sdn-sdwan`
- **security-concepts:** `cia-triad` · `encryption` · `pki` · `hashing` · `tls-ssl` · `ipsec` · `zero-trust` · `aaa` · `mfa` · `rbac` · `iam`
- **threats:** `malware` · `ransomware` · `phishing` · `social-engineering` · `ddos` · `on-path` · `spoofing` · `sql-injection` · `xss` · `iocs`
- **identity-directory:** `active-directory` · `ldap` · `radius` · `tacacs` · `sso` · `kerberos`
- **hardware-storage:** `raid` · `ssd-nvme` · `ddr-ram` · `cpu` · `bios-uefi` · `psu` · `printers` · `usb-thunderbolt`
- **os-ops:** `windows` · `linux` · `macos` · `cli` · `powershell` · `bash-scripting` · `group-policy` · `backups-3-2-1` · `virtualization` · `cloud` · `iaas-saas-paas`
- **practice:** `troubleshooting-methodology` · `siem` · `incident-response` · `risk-management` · `compliance` · `change-management`
- **meta-study:** `exam-objectives` · `acronym-decoder` · `mnemonic` · `220-1201` · `220-1202` · `n10-009` · `sy0-701`

> The overlap is the point: `firewalls`, `vpn`, `pki`, `malware`, `raid`, `troubleshooting-methodology`
> recur across certs — that’s what makes them **tags** (cross-cutting) rather than categories
> (single-exam). Subnetting/OSI deepen A+→Net+; PKI/encryption/Zero-Trust deepen Net+→Sec+.

## 5. Post types (editorial guidance)

Enum in `lib/taxonomy.ts` (mirrored by the `posts.type` CHECK). Each gets a badge + `/types/<slug>`
archive; some get tailored layouts.

| Type | When to use | Length / cadence |
|------|-------------|------------------|
| `concept` | Explain one objective in your own words ("explain it back") | short–medium; the workhorse |
| `cram` | Ports table, acronym decoder, flashcard deck, cheat sheet | reference; updated over time |
| `lab` | Hands-on build/config with your own screenshots | medium–long |
| `troubleshooting` | Walk a symptom through the 6/7-step methodology | short–medium; recurring series |
| `practice-exam` | Score + weak domains + missed-question post-mortem | short; after each practice test |
| `study-guide` | "Everything for Domain X" — links your posts to the objective | medium; grows as you cover a domain |
| `journal` | Weekly cadence: hours, wins, blockers | short; **weekly anti-quitting rhythm** |
| `project` | Security portfolio case study (STAR template, `01-product-spec.md` §5) | long; the interview centerpiece |
| `resources` | Annotated tools/videos/books/free labs | reference |

### Sizing guidance from a real course
The bundled `course-example.html` (Mike Meyers A+ Core 1, **29 sections / 153 lectures / ~20h**)
chunks Core 1 into ~25 teaching units that map onto the official domains — hardware chapters
(CPU/RAM/BIOS/motherboard/PSU/storage/peripherals/display/printers → *Hardware*), a networking block
(→ *Networking*), virtualization/cloud, mobile/laptop (→ *Mobile Devices*), troubleshooting woven
throughout. **Use one lecture-sized idea per `concept` post** — small, frequent, finishable. (Full
extracted outline is in the taxonomy research; reproduce as a `study-guide` for A+ Core 1 if useful.)

## 6. How a post maps to the model (example)

A project write-up that also reinforces Security+:
```
title:        "Building a NIST 800-171 Self-Assessment for My Home Lab"
slug:         nist-800-171-self-assessment-home-lab
type:         project
section_slug: security-plus
domain_id:    → SEC.5  (Security Program Management & Oversight)
exam:         SY0-701
tags:         [compliance, risk-management, grc, stig]   # 'grc','stig' created on the fly
repo_url:     https://github.com/.../grc-lab
project_meta: { goal:"…", stack:["OpenSCAP","STIG Viewer"], duration:"3 weeks",
                metrics:["STIG score 38%→92%"] }
```
This single post: appears on the Security+ hub, counts toward **SEC.5 coverage**, shows on
`/projects`, and surfaces under `/tags/compliance` alongside A+ and Net+ posts.

## 7. Coverage tracker semantics (recap)
Per exam: `covered = COUNT(DISTINCT domain_id of published posts)`, `total = COUNT(domains)`. Show
unweighted % by default; offer weighted (`Σ weight of covered / 100`) as a toggle. Empty domains are
the admin "write next" list. See `03-data-model.md` §10 for the query.
