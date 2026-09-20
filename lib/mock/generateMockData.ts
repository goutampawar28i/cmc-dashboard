import type {
  ActivityRecord,
  ActivityType,
  CMC,
  Company,
  OutreachChannel,
  OutreachStatus,
  PitchType,
  ResponseType,
  RawDataset,
} from "@/types";

// Deterministic pseudo-random generator so mock data is stable across reloads
// (mulberry32 — small, dependency-free, good enough for fixtures).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260919);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;

const FIRST_NAMES = [
  "Rahul", "Aman", "Priya", "Neha", "Karan", "Ishita", "Vivek", "Sanya",
  "Arjun", "Meera", "Rohan", "Divya", "Siddharth", "Ananya", "Yash", "Tanvi",
  "Aditya", "Riya", "Kabir", "Pooja", "Nikhil", "Simran", "Varun", "Kritika",
  "Manav", "Shreya", "Akash", "Isha", "Dev", "Aarushi",
];
const LAST_NAMES = [
  "Sharma", "Patel", "Jain", "Verma", "Mehta", "Singh", "Gupta", "Reddy",
  "Kapoor", "Malhotra", "Chawla", "Agarwal", "Nair", "Iyer", "Bhatt",
];

const INDUSTRIES = [
  "IT", "Consulting", "Banking", "FMCG", "Manufacturing", "Healthcare",
  "Automobile", "E-commerce", "Other",
];

const COMPANY_POOL = [
  "Deloitte", "TCS", "EY", "Infosys", "Wipro", "Accenture", "KPMG", "PwC",
  "HDFC Bank", "ICICI Bank", "Axis Bank", "Hindustan Unilever", "ITC",
  "Nestle India", "Maruti Suzuki", "Tata Motors", "Mahindra & Mahindra",
  "Apollo Hospitals", "Fortis Healthcare", "Cipla", "Reliance Retail",
  "Flipkart", "Amazon India", "Byju's", "Zomato", "Swiggy", "L&T",
  "Larsen & Toubro Infotech", "Cognizant", "Capgemini", "IBM India",
  "Genpact", "HCLTech", "Tech Mahindra", "Bajaj Finserv", "Kotak Mahindra",
  "Godrej Consumer", "Dabur", "Britannia", "Asian Paints", "Havells",
  "Bosch India", "Siemens India", "Schneider Electric", "Aditya Birla Group",
  "Vedanta", "JSW Steel", "Tata Steel", "Adani Group", "DLF", "Zydus Lifesciences",
];

const CHANNELS: OutreachChannel[] = [
  "Email", "Phone Call", "LinkedIn", "Alumni Reference", "Personal Network",
  "Company Website", "WhatsApp", "Other",
];
const ACTIVITIES: ActivityType[] = [
  "Company Targeted", "Contact Identified", "Initial Outreach", "Email Sent",
  "Call Made", "LinkedIn Outreach", "Pitch Sent", "Follow-up", "Meeting",
  "Proposal Sent", "Campus Visit Discussion", "Campus Visit Confirmed",
];
const PITCH_TYPES: PitchType[] = [
  "Placement", "Internship", "Live Project", "Corporate Interaction",
  "Guest Session", "Industrial Visit", "Sponsorship", "Other",
];
const STATUSES: OutreachStatus[] = [
  "Targeted", "Contacted", "No Response", "Follow-up Required", "Interested",
  "Discussion Scheduled", "Proposal Sent", "Confirmed", "Rejected",
  "Not Relevant",
];
const RESPONSES: ResponseType[] = [
  "No Response", "Positive", "Negative", "Requested More Information",
  "Meeting Requested", "Interested", "",
];

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
function daysFromNowISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function slug(name: string) {
  return name.trim().replace(/\s+/g, "_");
}

export function generateMockDataset(
  opts: { cmcCount?: number; companyCount?: number; activityCount?: number } = {}
): RawDataset {
  const cmcCount = opts.cmcCount ?? 12;
  const companyCount = opts.companyCount ?? Math.min(opts.companyCount ?? 100, COMPANY_POOL.length + 40);
  const activityCount = opts.activityCount ?? 550;

  // --- CMC_Master ---
  const usedNames = new Set<string>();
  const cmcs: CMC[] = [];
  for (let i = 0; i < cmcCount; i++) {
    let name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    while (usedNames.has(name)) name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    usedNames.add(name);
    const cmcId = `CMC${String(i + 1).padStart(3, "0")}`;
    cmcs.push({
      cmcId,
      name,
      email: `${slug(name).toLowerCase()}@jaipuria.ac.in`,
      batch: "PGDM 2026-28",
      active: rand() > 0.08, // ~92% active
      assignedTarget: pick([40, 50, 50, 60]),
      sheetName: slug(name),
    });
  }

  // --- Company_Master ---
  const companies: Company[] = [];
  const namePool = [...COMPANY_POOL];
  for (let i = 0; i < companyCount; i++) {
    const companyName =
      namePool[i] ?? `${pick(["Nova", "Orbit", "Vertex", "Summit", "Bluepeak", "Horizon"])} ${pick(["Systems", "Industries", "Group", "Solutions", "Labs"])}`;
    const assignedCmc = pick(cmcs);
    companies.push({
      companyId: `COMP${String(i + 1).padStart(4, "0")}`,
      companyName,
      industry: pick(INDUSTRIES),
      website: `https://www.${slug(companyName).toLowerCase()}.com`,
      assignedCmcId: assignedCmc.cmcId,
      primaryContact: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      contactEmail: rand() > 0.05 ? `hr@${slug(companyName).toLowerCase()}.com` : undefined,
      contactPhone: rand() > 0.2 ? `+91 ${int(70000, 99999)}${int(10000, 99999)}` : undefined,
      status: pick(STATUSES),
      createdDate: daysAgoISO(int(5, 90)),
    });
  }

  // Intentionally create some duplicate outreach: a handful of companies get
  // touched by 2-3 different CMCs, independent of Company_Master's assigned CMC.
  const duplicateTargets = companies
    .slice(0, Math.max(6, Math.floor(companyCount * 0.08)))
    .map((c) => c.companyId);

  // --- Activity records, distributed across CMC sheets ---
  const activities: ActivityRecord[] = [];
  let recordCounter = 1;
  for (let i = 0; i < activityCount; i++) {
    const cmc = pick(cmcs);
    let company = pick(companies);
    // ~30% chance to force a duplicate-target company for realism
    if (rand() < 0.3) {
      const dupId = pick(duplicateTargets);
      const found = companies.find((c) => c.companyId === dupId);
      if (found) company = found;
    }
    const activityType = pick(ACTIVITIES);
    const channel = pick(CHANNELS);
    const status = pick(STATUSES);
    const ageDays = int(0, 60);
    const date = daysAgoISO(ageDays);
    const hasFollowup = rand() > 0.4;
    const followupOffset = int(-10, 14); // negative = overdue, positive = upcoming
    const response = status === "Contacted" || status === "Follow-up Required"
      ? pick(RESPONSES)
      : status === "Interested" || status === "Discussion Scheduled" || status === "Confirmed"
      ? pick(["Positive", "Interested", "Meeting Requested"] as ResponseType[])
      : status === "Rejected"
      ? "Negative"
      : pick(RESPONSES);

    activities.push({
      recordId: `REC${String(recordCounter++).padStart(5, "0")}`,
      cmcId: cmc.cmcId,
      cmcName: cmc.name,
      rowIndex: i + 2, // header row is 1
      date,
      companyId: company.companyId,
      companyName: company.companyName,
      industry: company.industry,
      contactName: company.primaryContact,
      contactDesignation: pick(["HR Manager", "Talent Acquisition Lead", "Campus Relations", "HR Business Partner", "Director HR"]),
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      outreachChannel: channel,
      activity: activityType,
      pitchType: pick(PITCH_TYPES),
      status,
      nextFollowup: hasFollowup ? daysFromNowISO(followupOffset) : undefined,
      response,
      meetingDate:
        activityType === "Meeting" || status === "Discussion Scheduled"
          ? daysFromNowISO(int(-5, 10))
          : undefined,
      campusVisitDate:
        activityType === "Campus Visit Confirmed" ? daysFromNowISO(int(5, 45)) : undefined,
      remarks: rand() > 0.75 ? pick([
        "Awaiting confirmation from HR.",
        "Positive first call, sending deck next.",
        "Requested to follow up after their internal review.",
        "Contact changed roles, re-identifying POC.",
        "Strong interest, pushing for a campus visit date.",
      ]) : undefined,
    });
  }

  // A handful of CMCs get artificially zero recent activity, for the
  // "no recent activity" attention-required signal.
  const inactiveCmcIds = new Set(
    cmcs.slice(0, Math.max(1, Math.floor(cmcCount * 0.15))).map((c) => c.cmcId)
  );
  const trimmed = activities.filter((a) => {
    if (inactiveCmcIds.has(a.cmcId)) {
      const days = (Date.now() - new Date(a.date).getTime()) / 86400000;
      return days > 4; // strip anything recent for these CMCs
    }
    return true;
  });

  // --- Deliberate data-quality issues, so the data-quality page has something real to show ---
  const issues = injectDataQualityIssues(trimmed);

  return {
    cmcs,
    companies,
    activities: trimmed,
    issues,
    lastSynced: new Date().toISOString(),
    source: "mock",
  };
}

function injectDataQualityIssues(activities: ActivityRecord[]) {
  const issues: RawDataset["issues"] = [];
  // Mutate a small sample in place to create realistic dirty data
  const sampleSize = Math.max(4, Math.floor(activities.length * 0.02));
  for (let i = 0; i < sampleSize; i++) {
    const idx = int(0, activities.length - 1);
    const rec = activities[idx];
    const kind = pick(["missing-company-id", "bad-email", "missing-followup-date", "bad-date"]);
    if (kind === "missing-company-id") {
      rec.companyId = "";
      issues.push({ recordId: rec.recordId, cmcName: rec.cmcName, companyName: rec.companyName, field: "Company_ID", problem: "Missing Company ID" });
    } else if (kind === "bad-email" && rec.contactEmail) {
      rec.contactEmail = rec.contactEmail.replace("@", " at ");
      issues.push({ recordId: rec.recordId, cmcName: rec.cmcName, companyName: rec.companyName, field: "Contact_Email", problem: "Invalid email format" });
    } else if (kind === "missing-followup-date" && rec.status === "Follow-up Required") {
      rec.nextFollowup = undefined;
      issues.push({ recordId: rec.recordId, cmcName: rec.cmcName, companyName: rec.companyName, field: "Next_Followup", problem: "Follow-up required but no date set" });
    } else if (kind === "bad-date") {
      rec.date = "2026-13-45";
      issues.push({ recordId: rec.recordId, cmcName: rec.cmcName, companyName: rec.companyName, field: "Date", problem: "Invalid date format" });
    }
  }
  return issues;
}
