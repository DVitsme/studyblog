// Editorial copy that is NOT in D1: cert-hub descriptions/notes and per-domain checklist captions.
// Kept here (not the DB) so it is versioned with the code and easy to edit. Keyed by section slug /
// domain_ref so it stays aligned with the seed reference data.

export const SECTION_COPY: Record<string, { description: string; note?: string }> = {
  "a-plus": {
    description:
      "The IT generalist cert — hardware, operating systems, networking fundamentals, and the troubleshooting methodology. Everything I have documented so far, mapped to the official 220-1201/1202 domains.",
    note: "Furthest along here and on Security+. Every covered domain has at least one real write-up behind it.",
  },
  "security-plus": {
    description:
      "The security-fundamentals cert — threats and mitigations, cryptography, architecture, operations, and governance. Everything I have documented so far, mapped to the five official SY0-701 domains.",
    note: "Furthest along here and on A+ (44%). Network+ is at 0% — I only just started it, and I am documenting it from the very first post.",
  },
  "network-plus": {
    description:
      "The networking cert — topologies, addressing, routing and switching, network operations and security. I only just started this track, so it is documented from the very first post onward.",
    note: "Just getting going. Expect the first Network+ posts to land over the coming weeks.",
  },
};

// Short captions under each domain in the CoverageChecklist. Falls back to "Not started yet" for
// empty domains (handled in the hub page), so only the covered-domain captions are essential.
export const DOMAIN_SUB: Record<string, string> = {
  // A+
  "A+C1.1": "Laptops, mobile hardware, sync",
  "A+C1.2": "Cabling, ports, TCP/IP, subnetting",
  "A+C1.3": "RAM, storage, PSUs, peripherals",
  "A+C1.4": "Hypervisors and cloud models",
  "A+C1.5": "The six-step methodology",
  "A+C2.1": "Windows, Linux, macOS, the CLI",
  "A+C2.2": "Hardening, malware, authentication",
  "A+C2.3": "OS and application failures",
  "A+C2.4": "Safety, docs, change management",
  // Network+
  "NET.1": "OSI, topologies, protocols",
  "NET.2": "Routing, switching, wireless",
  "NET.3": "Monitoring, DR, documentation",
  "NET.4": "Hardening, zones, attacks",
  "NET.5": "Tools and methodology",
  // Security+
  "SEC.1": "CIA triad, crypto basics, zero trust",
  "SEC.2": "Social engineering, malware, CVSS",
  "SEC.3": "Zones, secure design, resilience",
  "SEC.4": "SIEM, incident response, vuln mgmt",
  "SEC.5": "Governance, risk, compliance",
};

// One-line blurbs for the /types/[type] archive intros.
export const TYPE_BLURB: Record<string, string> = {
  concept: "Ideas explained until they actually click — the why behind the exam objective.",
  cram: "Dense, skimmable reference sheets for the night before.",
  lab: "Hands-on builds and experiments, with what broke and how I fixed it.",
  troubleshooting: "Real failures walked through the methodology, step by step.",
  "practice-exam": "Practice-question breakdowns and where I keep losing points.",
  "study-guide": "Structured guides that map a whole topic area.",
  journal: "Weekly progress notes — hours in, scores, and what is next.",
  project: "End-to-end write-ups I can hand a hiring manager.",
  resources: "Curated links and tools worth keeping.",
};
