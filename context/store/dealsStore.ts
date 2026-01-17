// stores/dealStore.ts

import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";
import { create } from "zustand";
import {
  followUpStatus
} from "../../lib/types";

export interface UploadFileValues {
  documentName: string;
  description: string;
  fileName: string;
  filePath: string;
  url: string;
  dealUUID: string;
  size: number;
  mimeType: string;
}

export interface AddFollowUpValues {
  subject: string;
  scheduledDate: string;
  contactPersons: HCOContactPerson[];
  description: string;
  followUpUUID: string;
  status: followUpStatus;
}

export interface CompleteFollowUpValues {
  outcome: string;
}

export interface CancelFollowUpValues {
  cancellationReason: string;
}

export interface RescheduleFollowUpValues {
  scheduledDate: string;
  nextFollowUpNotes: string;
}




export interface ContactPersonReview {
  hcoContactUUID: string;
  fullName: string;
  role?: string;
  rating: number;
  comment: string;
}

export interface stageValues {
  dealStage: string;
  reason: string;
  lossReason?: string;
  proof?: string[];
  contactPersonReviews?: ContactPersonReview[];
}


interface DealStore {
  viewMode: "grid" | "table";
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  setViewMode: (mode: "grid" | "table") => void;
  openDealDrawer: boolean;
  setDealDrawer: (open: boolean) => void;
}

export const useDealStore = create<DealStore>((set) => ({
  viewMode: "grid",
  page: 1,
  pageSize: 10,
  setViewMode: (mode: "grid" | "table") => set({ viewMode: mode }),
  setPage: (page: number) => set({ page }),
  setPageSize: (pageSize: number) => set({ pageSize }),
  openDealDrawer: false,
  setDealDrawer: (open: boolean) => set({ openDealDrawer: open }),
}));
