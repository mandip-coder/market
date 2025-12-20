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
}
