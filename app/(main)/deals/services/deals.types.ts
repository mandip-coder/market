import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";



export interface Deal {
  dealUUID: string;
  hcoUUID: string;
  summary: string;
  dealDate: string;
  dealStage: string; 
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  hcoName: string;
  dealName: string;
  createdUUID: string;
  updatedUUID: string;
  contactPersons: HCOContactPerson[];
  counts: Counts;
  dealStageName: string;
  updatedBy: string;
} 
export interface Counts {
  products: number;
  attachments: number;
  meetings: number;
  followUps: number;
  calls: number;
  emails: number;
  notes: number;
}


export interface DealFilters {
  page: number;
  pageSize: number;
  searchQuery?: string;
  stageFilter?: string;
  healthcareFilter?: string;
}

export interface DealsResponse {
  data: {
    list: Deal[];
    filterCount: number;
    totalCount: number;
  };
}

export interface CreateDealData {
  dealName: string;
  hcoUUID: string;
  summary: string;
  contactPersons: string[];
  assignTo: string[];
  dealDate: string;
  dealUUID?: string;
}

export interface TimelineEvents {
  createdAt: string;
  type: "Product" | "Attachment" | "Meeting" | "Follow Up" | "Call" | "Email" | "Note" | "Stage Change" | "Reminder";
  title: string;
  description: string;
  user: string;
  userUUID: string;
  color: "blue" | "green" | "red" | "purple" | "orange" | "gray";
  historyUUID: string;
  profileImageUrl: string;
}

export interface TimelineResponse {
  data: {
    list: TimelineEvents[];
    filterCount: number;
    totalCount: number;
    hasNext: boolean;
    page: number;
  };
}
export interface DealTimelineCounts {
  product: number;
  attachment: number;
  meeting: number;
  followUp: number;
  call: number;
  email: number;
  note: number;
  stageChange: number;
}

export interface UpdateDealStagePayload {
  reasonForChange: string;
  stageUUID: string;
  lossReasonUUID?: string;
  documents?: {
    filename: string;
    url: string;
    filePath: string;
    size: number;
    mimeType: string;
  }[];
  contactPersonReviews?: {
    contactPersonUUID: string;
    rating: number;
    comment: string;
  }[];
}

export interface TimelineFilters {
  page: number;
  tabs: string[];
}