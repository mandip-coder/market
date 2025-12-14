import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";
import { HEALTHCARE_TYPES, RAG_RATINGS } from "./constants";

export type HealthcareType = typeof HEALTHCARE_TYPES[number];
export type RagRating = typeof RAG_RATINGS[number];

export interface Healthcare {
  hcoUUID: string;
  icbId: string | null;
  hcoName: string;
  hcoType: HealthcareType;
  address: string | null;
  phone1: string | null;
  phone2: string | null;
  email: string | null;
  website: string | null;
  ragRating: RagRating | null;
  createdAt: string;
  updatedAt: string;
  contacts: HCOContactPerson[];
}

export interface HealthcareFilters {
  searchQuery: string;
  typeFilter: string; 

}

export interface PaginationState {
  page: number;
  itemsPerPage: number;
}