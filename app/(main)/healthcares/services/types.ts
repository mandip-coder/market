import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";

export interface Healthcare {
  hcoUUID: string;
  hcoName: string;
  hcoType: string;
  address: string;
  city: string;
  contacts: HCOContactPerson[];
  country: string;
  createdAt: string;
  createdBy: string;
  healthcareCode: string;
  icbCode: string;
  phone1: string;
  phone2: string;
  state: string;
  status: string;
  totalActiveContactsCount: number;
  totalContactsCount: number;
  totalLeadCount: number;
  totalDealCount: number;
  updatedAt: string;
  updatedBy: string;
  website: string;
  region: string;
  regionUUID: string;
  email: string;
  hcoServices: HCOServices[];
}

export interface HealthcareFilters {
  page: number;
  pageSize: number;
  searchQuery?: string;
  typeFilter?: string;
  countryUUID?: string;
  regionalOfficeCode?: string;
  icbCode?: string;
}

export interface HealthcaresResponse {
  data: {
    list: Healthcare[];
    filterCount: number;
    totalCount: number;
  };
}

export interface CreateHealthcareData {
  hcoName: string;
  hcoTypeUUID: string;
  address: string;
  cityUUID: string;
  stateUUID: string;
  countryUUID: string;
  phone1: string;
  phone2?: string;
  website?: string;
  healthcareCode: string;
  icbCode?: string;
  email: string;
  hcoServices: string[];
  regionUUID: string;
}

export interface UpdateHealthcareData extends Partial<CreateHealthcareData> {
  hcoUUID: string;
}

export interface ICBHCOlistResponse {
  data: Healthcare[];
}

export interface HCOServices {
  hcoServiceUUID: string;
  hcoServiceName: string;
}
