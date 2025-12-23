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
  startDatetime: string;
  endDatetime: string;
  meetingTitle: string;
  venue: string;
  venueUUID: string
  location: string;
  notes: string;
  cancellationReason: string;
  rescheduleReason: string;
  meetingStatus: followUpStatus;
  outcome: string;
  createdAt: string;
  updatedAt: string;
  meetingUUID: string;
  dealUUID: string;
  attendees: HCOContactPerson[];
  createdBy: string;
  updatedBy: string

}
export type followUpMode = 'CALL' | 'MEETING' | 'EMAIL' | 'VIDEO_CALL' | "WHATSAPP" | "SMS" | "VISIT";
export type followUpStatus = 'Scheduled' | 'Rescheduled' | 'Overdue' | 'Completed' | 'Cancelled';
export interface FollowUP {
  followUpUUID: string;
  subject: string;
  contactPersons: HCOContactPerson[];
  description: string;
  status: followUpStatus;
  cancellationReason?: string; // For cancelled follow-ups
  scheduledDate: string;
  nextFollowUpNotes?: string;
  followUpMode?: followUpMode;
  completedDate?: string;
  outcome?: string;
}

export interface CallLog {
  callLogUUID: string;
  subject: string;
  callStartTime: string;
  duration: string;
  purpose: string;
  agenda: string;
  outcomeUUID: string;
  outcome: string
  comment?: string
  createdAt: string;
  createdBy: string;
}

export interface EmailAttachment {
  filename: string;
  url: string;
  filePath: string;
  size: number;
  mimeType: string;
}

export interface Email {
  emailUUID: string;
  leadUUID?: string;
  dealUUID?: string;
  subject: string;
  body: string;
  recipients: string[];
  ccRecipients: string[];
  bccRecipients: string[];
  attachments: EmailAttachment[];
  sentAt: string;
  sentBy: string;
  sentByUUID: string;
  deliveryStatus: 'sent' | 'failed' | 'delivered';
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

