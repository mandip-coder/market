import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';

export interface Lead {
  leadUUID: string;
  hcoUUID: string;
  leadDate: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  hcoName: string;
  leadName: string;
  leadStatus: "new" | "inProgress" | "cancelled";
  closeReason?: string;
  createdUUID?: string;
  contactPersons: HCOContactPerson[];
  emailCount: number;
  callLogCount: number;
  followUpCount: number;
  updatedUUID?: string;
  updatedBy?: string;
}

export interface LeadFilters {
  page: number;
  pageSize: number;
  searchQuery?: string;
  statusFilter?: string;
  healthcareFilter?: string;
}

export interface LeadsResponse {
  data: {
    list: Lead[];
    filterCount: number;
    totalCount: number;
  };
}

export interface CreateLeadData {
  leadName: string;
  hcoUUID: string;
  summary: string;
  leadSource: string;
  contactPersons: string[];
  assignTo: string[];
  leadDate: string;
  leadUUID?: string;
}

export interface CancelLeadData {
  leadUUID: string;
  closeReason: string;
}

export interface ConvertLeadData {
  leadUUID: string;
  summary: string;
}
export interface CreateFollowUpPayload {
  leadUUID?: string;
  dealUUID?: string;
  subject: string;
  scheduledDate: string;
  contactPersons: string[];
  description: string;
  followUpMode: string;
}


export interface UpdateFollowUpPayload {
  subject?: string;
  scheduledDate?: string;
  contactPersons?: string[];
  description?: string;
  followUpMode?: string;
}


export interface CreateCallPayload {
  leadUUID?: string;
  dealUUID?: string;
  subject: string;
  callStartTime: string;
  duration: string;
  purpose: string;
  agenda: string;
  outcomeUUID: string;
  comment?: string;
}

export interface UpdateCallPayload {
  subject?: string;
  callStartTime?: string;
  duration?: string;
  purpose?: string;
  agenda?: string;
  outcomeUUID?: string;
  comment?: string;
}


export interface SendEmailPayload {
  leadUUID?: string;
  dealUUID?: string;
  subject: string;
  body: string;
  recipients: string[];
  ccRecipients?: string[];
  bccRecipients?: string[];
  attachments?: {
    filename: string;
    url: string;
    filePath: string;
    size: number;
    mimeType: string;
  }[];
}

export interface LeadTimelineCounts {
  product: number;
  attachment: number;
  meeting: number;
  followUp: number;
  call: number;
  email: number;
  note: number;
  stageChange: number;
}

export interface TimelineFilters {
  page: number;
  tabs: string[];
}