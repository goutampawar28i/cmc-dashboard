// Core domain types for the CMC Corporate Outreach Dashboard.
// These mirror the Google Sheet structure exactly (CMC_Master, Company_Master,
// and one activity sheet per CMC) so the data layer can validate against them.

export type OutreachChannel =
  | "Email"
  | "Phone Call"
  | "LinkedIn"
  | "Alumni Reference"
  | "Personal Network"
  | "Company Website"
  | "WhatsApp"
  | "Other";

export type ActivityType =
  | "Company Targeted"
  | "Contact Identified"
  | "Initial Outreach"
  | "Email Sent"
  | "Call Made"
  | "LinkedIn Outreach"
  | "Pitch Sent"
  | "Follow-up"
  | "Meeting"
  | "Proposal Sent"
  | "Campus Visit Discussion"
  | "Campus Visit Confirmed";

export type PitchType =
  | "Placement"
  | "Internship"
  | "Live Project"
  | "Corporate Interaction"
  | "Guest Session"
  | "Industrial Visit"
  | "Sponsorship"
  | "Other";

export type OutreachStatus =
  | "Targeted"
  | "Contacted"
  | "No Response"
  | "Follow-up Required"
  | "Interested"
  | "Discussion Scheduled"
  | "Proposal Sent"
  | "Confirmed"
  | "Rejected"
  | "Not Relevant";

export type ResponseType =
  | "No Response"
  | "Positive"
  | "Negative"
  | "Requested More Information"
  | "Meeting Requested"
  | "Interested"
  | "";

export interface CMC {
  cmcId: string;
  name: string;
  email: string;
  batch: string;
  section: string;
  active: boolean;
  contactNumber: number;
  assignedTarget?: number; // optional field for assigned target
  sheetName: string; // tab name this CMC's activity lives in, e.g. "Rahul_Sharma"
}

export interface Company {
  companyId: string;
  companyName: string;
  industry: string;
  website?: string;
  assignedCmcId?: string;
  primaryContact?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: OutreachStatus;
  createdDate?: string; // ISO date
}

export interface ActivityRecord {
  // Synthetic fields added by the data layer, not present in the raw sheet row
  recordId: string;
  cmcId: string;
  cmcName: string;
  rowIndex: number; // 1-based row in the source sheet, for traceability/debugging

  // Fields as they appear in each CMC's sheet tab
  date: string; // ISO date
  companyId: string;
  companyName: string;
  industry: string;
  contactName?: string;
  contactDesignation?: string;
  contactEmail?: string;
  contactPhone?: string;
  outreachChannel: OutreachChannel;
  activity: ActivityType;
  pitchType?: PitchType;
  status: OutreachStatus;
  nextFollowup?: string; // ISO date
  response?: ResponseType;
  meetingDate?: string; // ISO date
  campusVisitDate?: string; // ISO date
  remarks?: string;
}

export interface DataQualityIssue {
  recordId: string;
  cmcName: string;
  companyName: string;
  field: string;
  problem: string;
}

export interface RawDataset {
  cmcs: CMC[];
  companies: Company[];
  activities: ActivityRecord[];
  issues: DataQualityIssue[];
  lastSynced: string; // ISO datetime
  source: "google-sheets" | "mock" | "cache";
}
