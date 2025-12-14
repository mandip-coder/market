import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";


export enum Stage {
  DISCUSSION = "019aee92-d1ad-7cfc-bbcb-cea8503ff01a",
  NEGOTIATION = "019aee92-d1ad-7de1-b923-7e109435d4cc",
  CLOSED_WON = "019aee92-d1ad-7bd4-b3cc-caa105d3e6e2",
  CLOSED_LOST = "019aee92-d1ad-7147-a0f9-4ef49d3f665e"
}

export type stages = Stage;

export const STAGE_LABELS: Record<Stage, string> = {
  [Stage.DISCUSSION]: "Discussion",
  [Stage.NEGOTIATION]: "Negotiation",
  [Stage.CLOSED_WON]: "Closed Won",
  [Stage.CLOSED_LOST]: "Closed Lost"
};
export interface healthcareDetails {
  industry: string;
  size: string;
  location: string;
  website: string;
  revenue: string;
}

export interface UserDetails {
  role: string;
  department: string;
  email: string;
  phone: string;
}



export interface Deal {
  dealUUID: string;
  hcoUUID: string;
  summary: string;
  dealDate: string;
  dealStage: stages
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  hcoName: string;
  dealName: string;
  createdByUUID: string;
  userUUID?: string;
  contactPersons: HCOContactPerson[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  type: string;
}

export interface Meeting {
  meetingUUID: string;
  meetingTitle: string;
  startDatetime: string;
  endDatetime: string;
  location: string;
  venue: 'in-office' | 'client location' | 'online';
  attendeesUUID: HCOContactPerson[];
  notes?: string;
  createdBy: string;
  agenda: string;
  minutes: string;
  meetingStatus: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  dealUUID: string

}
type followUpMode = 'CALL' | 'MEETING' | 'EMAIL' | 'VIDEO_CALL' | "WHATSAPP" | "SMS" | "VISIT";
export interface FollowUP {
  followUpUUId: string;
  subject: string;
  scheduledDateTime: string; // ISO datetime string
  contactPersons: string[]; // Array of contact person UUIDs
  remark?: string;
  isCompleted: boolean;
  isCancelled: boolean;
  completedAt?: string;
  cancelledAt?: string;
  outcome?: string; // For completed follow-ups
  cancelReason?: string; // For cancelled follow-ups
  rescheduledAt?: string;
  rescheduleReason?: string;
  originalScheduledDateTime?: string;
  followUpMode?: followUpMode;
}

export interface CallLog {
  callLogUUID: string;
  subject: string;
  callStartTime: string;
  duration: string;
  purpose: string;
  agenda: string;
  outcome: 'No Interest' | 'No Response (1 Month Chase)' | 'Require Further Information' |
  'Another Supplier Contract' | 'Non Formulary' | 'Switch Consideration' | 'Approved Switch';
  loggedBy: string;
  reason?: string
}

export interface Email {
  emailUUID: string;
  subject: string;
  body: string;
  recipients: string[];
  sentAt: string;
  sentBy: string;
}

export interface Note {
  noteUUID: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface Reminder {
  reminderUUID: string;
  notifyDate: string,
  setReminderTo: string,
  description: string
  sendEmail?: boolean
  createdAt: string;
  createdBy: string;
}

