import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";





export interface Attachment {
  filename: string;
  url: string;
  filePath: string;
  size: number;
  mimeType: string;
  documentName: string;
  attachmentUUID: string;
  description?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  dealUUID: string;
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
  dealUUID?: string;
  leadUUID?: string;
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

