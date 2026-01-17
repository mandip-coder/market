"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from '@/components/AppToaster/AppToaster';
import { dealsKeys } from "./deals.queryKeys";
import { dealsService } from "./deals.service";
import {
  DealFilters,
  CreateDealData,
  Deal,
  DealsResponse,
  TimelineFilters,
  TimelineResponse,
  UpdateDealStagePayload,
} from "./deals.types";
import {
  FollowUP,
  CallLog,
  Email,
  Note,
  Meeting,
  Attachment,
} from "@/lib/types";
import {
  CompleteFollowUpValues,
  CancelFollowUpValues,
  RescheduleFollowUpValues,
  UploadFileValues,
} from "@/context/store/dealsStore";
import { healthcaresKeys } from "../../healthcares/services/healthcares.queryKeys";
import { DealTabsOptions } from "../[id]/DealTabs";
import { Product } from "../../products/services/types";
import {
  Healthcare,
  HealthcaresResponse,
} from "../../healthcares/services/types";

// ==================== TYPE DEFINITIONS ====================

/**
 * Payload for creating a follow-up
 */
export interface CreateFollowUpPayload {
  leadUUID?: string;
  dealUUID?: string;
  subject: string;
  scheduledDate: string;
  contactPersons: string[];
  description: string;
  followUpMode: string;
}

/**
 * Payload for updating a follow-up
 */
export interface UpdateFollowUpPayload {
  subject?: string;
  scheduledDate?: string;
  contactPersons?: string[];
  description?: string;
  followUpMode?: string;
}

/**
 * Payload for creating a call log
 */
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

/**
 * Payload for updating a call log
 */
export interface UpdateCallPayload {
  subject?: string;
  callStartTime?: string;
  duration?: string;
  purpose?: string;
  agenda?: string;
  outcomeUUID?: string;
  comment?: string;
}

/**
 * Payload for sending an email
 */
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

/**
 * Payload for creating a note
 */
export interface CreateNotePayload {
  dealUUID: string;
  title: string;
  description: string;
}

/**
 * Payload for updating a note
 */
export interface UpdateNotePayload {
  title?: string;
  description?: string;
}

/**
 * Payload for creating a meeting
 */
export interface CreateMeetingPayload {
  dealUUID: string;
  meetingTitle: string;
  startDatetime: string;
  endDatetime: string;
  venue: string;
  venueUUID: string;
  location: string;
  notes: string;
  attendees: string[];
}

/**
 * Payload for updating a meeting
 */
export interface UpdateMeetingPayload {
  meetingTitle?: string;
  startDatetime?: string;
  endDatetime?: string;
  venue?: string;
  venueUUID?: string;
  location?: string;
  notes?: string;
  attendees?: string[];
}

/**
 * Payload for completing a meeting
 */
export interface CompleteMeetingPayload {
  outcome: string;
}

/**
 * Payload for rescheduling a meeting
 */
export interface RescheduleMeetingPayload {
  startDatetime: string;
  endDatetime: string;
  rescheduleReason: string;
}

// ==================== DEAL HOOKS ====================

/**
 * Hook to fetch paginated deals with filters
 * Automatically caches data with filter-specific keys
 */
export function useDeals(filters: DealFilters) {
  return useQuery({
    queryKey: dealsKeys.list(filters),
    queryFn: () => dealsService.fetchDeals(filters),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
  });
}

/**
 * Hook to fetch individual deal by ID
 * Caches each deal separately for optimal performance
 */
export function useDeal(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: dealsKeys.detail(id),
    queryFn: () => dealsService.fetchDealById(id),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
    enabled: enabled && !!id,
    retry: 1,
  });
}

/**
 * Hook to create a new deal
 * Automatically invalidates deals list cache on success
 */
export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDealData) => dealsService.createDeal(data),
    onSuccess: (data: Deal) => {
      // Update all list queries (with different filters) by adding the new deal
      queryClient.setQueriesData(
        { queryKey: dealsKeys.lists() },
        (old: DealsResponse | undefined) => {
          if (!old) return [];
          return {
            ...old,
            data: {
              ...old.data,
              list: [data, ...old.data.list],
              totalCount: old.data.totalCount + 1,
              filterCount: old.data.filterCount + 1,
            },
          };
        }
      );

      // Update healthcare detail cache - increment deal count
      if (data.hcoUUID) {
        queryClient.setQueryData(
          healthcaresKeys.detail(data.hcoUUID),
          (old: Healthcare) => {
            if (!old) return [];
            return {
              ...old,
              totalDealCount: old.totalDealCount + 1,
            };
          }
        );

        // Update healthcare list cache - increment deal count
        queryClient.setQueriesData(
          { queryKey: ["healthcares", "list"] },
          (old: HealthcaresResponse) => {
            if (!old) return [];
            return {
              ...old,
              data: {
                ...old.data,
                list: old.data.list.map((healthcare) =>
                  healthcare.hcoUUID === data.hcoUUID
                    ? {
                        ...healthcare,
                        totalDealCount: healthcare.totalDealCount + 1,
                      }
                    : healthcare
                ),
              },
            };
          }
        );

        // Update HCO deals cache
        queryClient.setQueryData(
          ["healthcares", "detail", data.hcoUUID, "tabs", "deals"],
          (old: Deal[]) => {
            if (!old) return [data];
            return [data, ...old];
          }
        );
      }

      toast.success("Deal created successfully");
    },
    onError: (error: Error) => {
      console.error("Error creating deal:", error);
      toast.error(error.message || "Failed to create deal");
    },
  });
}

/**
 * Hook to update deal stage
 * Automatically invalidates deal detail cache on success
 */
export function useUpdateDealStage(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDealStagePayload) =>
      dealsService.updateDealStage(dealUUID, data),
    onSuccess: (_, variables) => {
      const updatedStageUUID = variables.stageUUID;
      queryClient.setQueryData(dealsKeys.detail(dealUUID), (old: Deal) => {
        if (!old) return [];
        return {
          ...old,
          dealStage: updatedStageUUID,
        };
      });
      queryClient.invalidateQueries({ queryKey: dealsKeys.lists() });
      toast.success("Deal stage updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update deal stage");
    },
  });
}

// ==================== TAB DATA HOOKS ====================

export function useDealContacts(dealUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["deal-contacts", dealUUID],
    queryFn: () => dealsService.fetchDealContacts(dealUUID),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: enabled && !!dealUUID,
  });
}

export function useDealProducts(dealUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: dealsKeys.products(dealUUID),
    queryFn: () => dealsService.fetchDealProducts(dealUUID),
    staleTime: 5 * 60 * 1000, // 5 minutes - prevents excessive refetches
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    enabled: enabled && !!dealUUID,
  });
}

/**
 * Payload for adding a product to a deal
 */
export interface AddDealProductPayload {
  productUUID: string;
  dealUUID: string;
}

/**
 * Payload for deleting a product from a deal
 */
export interface DeleteDealProductPayload {
  productUUID: string;
  dealUUID: string;
  reason?: string;
}

/**
 * Hook to add a product to a deal
 */
export function useAddDealProduct(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddDealProductPayload) =>
      dealsService.addDealProduct(payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        dealsKeys.products(dealUUID),
        (old: Product[]) => {
          if (!old) return old;
          return [data, ...old];
        }
      );
      incrementCounts(queryClient, dealUUID, "products");
      toast.success("Product added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add product");
    },
  });
}

/**
 * Hook to delete a product from a deal
 */
export function useDeleteDealProduct(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteDealProductPayload) =>
      dealsService.deleteDealProduct(payload),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        dealsKeys.products(dealUUID),
        (old: Product[]) => {
          if (!old) return old;
          return old.filter(
            (product: Product) => product.productUUID !== variables.productUUID
          );
        }
      );
      decrementCounts(queryClient, dealUUID, "products");
      toast.success("Product removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove product");
    },
  });
}

/**
 * Hook to fetch deal follow-ups
 * Only fetches when enabled (tab is active)
 */
export function useDealFollowUps(dealUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: dealsKeys.followUps(dealUUID),
    queryFn: () => dealsService.fetchDealFollowUps(dealUUID),
    staleTime: 5 * 60 * 1000, // 5 minutes - prevents excessive refetches
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    enabled: enabled && !!dealUUID,
  });
}

/**
 * Hook to fetch deal calls
 * Only fetches when enabled (tab is active)
 */
export function useDealCalls(dealUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: dealsKeys.calls(dealUUID),
    queryFn: () => dealsService.fetchDealCalls(dealUUID),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000,
    enabled: enabled && !!dealUUID,
  });
}

/**
 * Hook to fetch deal emails
 * Only fetches when enabled (tab is active)
 */
export function useDealEmails(dealUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: dealsKeys.emails(dealUUID),
    queryFn: () => dealsService.fetchDealEmails(dealUUID),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000,
    enabled: enabled && !!dealUUID,
  });
}

/**
 * Hook to fetch deal notes
 * Only fetches when enabled (tab is active)
 */
export function useDealNotes(dealUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: dealsKeys.notes(dealUUID),
    queryFn: () => dealsService.fetchDealNotes(dealUUID),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000,
    enabled: enabled && !!dealUUID,
  });
}

/**
 * Hook to fetch deal meetings
 * Only fetches when enabled (tab is active)
 */
export function useDealMeetings(dealUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: dealsKeys.meetings(dealUUID),
    queryFn: () => dealsService.fetchDealMeetings(dealUUID),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000,
    enabled: enabled && !!dealUUID,
  });
}

// ==================== FOLLOW-UP MUTATION HOOKS ====================

/**
 * Hook to create a follow-up
 * Updates cache optimistically on success
 */
export function useCreateFollowUp(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFollowUpPayload) =>
      dealsService.createFollowUp(data),
    onSuccess: (newFollowUp: FollowUP) => {
      // Add to cache
      queryClient.setQueryData<FollowUP[]>(
        dealsKeys.followUps(dealUUID),
        (old = []) => {
          return [...old, newFollowUp];
        }
      );
      // Increment count
      incrementCounts(queryClient, dealUUID, "followUps");
      toast.success("Follow-up created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create follow-up");
    },
  });
}

/**
 * Hook to update a follow-up
 * Updates cache optimistically on success
 */
export function useUpdateFollowUp(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followUpUUID,
      data,
    }: {
      followUpUUID: string;
      data: UpdateFollowUpPayload;
    }) => dealsService.updateFollowUp(followUpUUID, data),
    onSuccess: (updatedFollowUp: FollowUP) => {
      queryClient.setQueryData<FollowUP[]>(
        dealsKeys.followUps(dealUUID),
        (old = []) => {
          return old.map((f) =>
            f.followUpUUID === updatedFollowUp.followUpUUID
              ? updatedFollowUp
              : f
          );
        }
      );
      toast.success("Follow-up updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update follow-up");
    },
  });
}

/**
 * Hook to complete a follow-up
 * Updates cache optimistically on success
 */
export function useCompleteFollowUp(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followUpUUID,
      data,
    }: {
      followUpUUID: string;
      data: CompleteFollowUpValues;
    }) => dealsService.completeFollowUp(followUpUUID, data),
    onSuccess: (updatedFollowUp: FollowUP, variables) => {
      // Update cache with server response
      queryClient.setQueryData<FollowUP[]>(
        dealsKeys.followUps(dealUUID),
        (old = []) => {
          return old.map((f) =>
            f.followUpUUID === variables.followUpUUID
              ? { ...f, ...updatedFollowUp }
              : f
          );
        }
      );
      toast.success("Follow-up completed successfully");
    },
    onError: (error: Error) => {
      console.error("Error completing follow-up:", error);
      toast.error(error.message || "Failed to complete follow-up");
    },
  });
}

/**
 * Hook to cancel a follow-up
 * Updates cache optimistically on success
 */
export function useCancelFollowUp(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followUpUUID,
      data,
    }: {
      followUpUUID: string;
      data: CancelFollowUpValues;
    }) => dealsService.cancelFollowUp(followUpUUID, data.cancellationReason),
    onSuccess: (updatedFollowUp: FollowUP, variables) => {
      queryClient.setQueryData<FollowUP[]>(
        dealsKeys.followUps(dealUUID),
        (old = []) => {
          return old.map((f) =>
            f.followUpUUID === variables.followUpUUID
              ? { ...f, ...updatedFollowUp }
              : f
          );
        }
      );
      toast.success("Follow-up cancelled successfully");
    },
    onError: (error: Error) => {
      console.error("Error cancelling follow-up:", error);
      toast.error(error.message || "Failed to cancel follow-up");
    },
  });
}

/**
 * Hook to reschedule a follow-up
 * Updates cache optimistically on success
 */
export function useRescheduleFollowUp(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followUpUUID,
      data,
    }: {
      followUpUUID: string;
      data: RescheduleFollowUpValues;
    }) => dealsService.rescheduleFollowUp(followUpUUID, data),
    onSuccess: (updatedFollowUp: FollowUP, variables) => {
      queryClient.setQueryData<FollowUP[]>(
        dealsKeys.followUps(dealUUID),
        (old = []) => {
          return old.map((f) =>
            f.followUpUUID === variables.followUpUUID
              ? {
                  ...f,
                  ...updatedFollowUp,
                }
              : f
          );
        }
      );
      toast.success("Follow-up rescheduled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reschedule follow-up");
    },
  });
}

export function useDeleteFollowUp(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followUpUUID: string) =>
      dealsService.deleteFollowUp(followUpUUID),
    onSuccess: (_, followUpUUID) => {
      queryClient.setQueryData<FollowUP[]>(
        dealsKeys.followUps(dealUUID),
        (old = []) => {
          return old.filter((f) => f.followUpUUID !== followUpUUID);
        }
      );
      // Decrement count
      decrementCounts(queryClient, dealUUID, "followUps");
      toast.success("Follow-up deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete follow-up");
    },
  });
}

// ==================== CALL MUTATION HOOKS ====================

/**
 * Hook to create a call log
 * Updates cache optimistically on success
 */
export function useCreateCall(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCallPayload) => dealsService.createCall(data),
    onSuccess: (newCall: CallLog) => {
      // Optimistically add to cache
      queryClient.setQueryData<CallLog[]>(
        dealsKeys.calls(dealUUID),
        (old = []) => {
          return [...old, newCall];
        }
      );
      // Increment count
      incrementCounts(queryClient, dealUUID, "calls");
    },
  });
}

/**
 * Hook to update a call log
 * Updates cache optimistically on success
 */
export function useUpdateCall(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      callLogUUID,
      data,
    }: {
      callLogUUID: string;
      data: UpdateCallPayload;
    }) => dealsService.updateCall(callLogUUID, data),
    onSuccess: (updatedCall: CallLog, variables) => {
      // Optimistically update in cache
      queryClient.setQueryData<CallLog[]>(
        dealsKeys.calls(dealUUID),
        (old = []) => {
          return old.map((c) =>
            c.callLogUUID === variables.callLogUUID ? updatedCall : c
          );
        }
      );
    },
  });
}

/**
 * Hook to delete a call log
 * Removes from cache optimistically on success
 */
export function useDeleteCall(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callLogUUID: string) => dealsService.deleteCall(callLogUUID),
    onSuccess: (_, callLogUUID) => {
      // Optimistically remove from cache
      queryClient.setQueryData<CallLog[]>(
        dealsKeys.calls(dealUUID),
        (old = []) => {
          return old.filter((c) => c.callLogUUID !== callLogUUID);
        }
      );
      // Decrement count
      decrementCounts(queryClient, dealUUID, "calls");
    },
  });
}

// ==================== EMAIL MUTATION HOOKS ====================

/**
 * Hook to send an email
 * Updates cache optimistically on success
 */
export function useSendEmail(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendEmailPayload) => dealsService.sendEmail(data),
    onSuccess: (newEmail: Email) => {
      // Optimistically add to cache
      queryClient.setQueryData<Email[]>(
        dealsKeys.emails(dealUUID),
        (old = []) => {
          return [...old, newEmail];
        }
      );
      // Increment count
      incrementCounts(queryClient, dealUUID, "emails");
    },
  });
}

// ==================== NOTE MUTATION HOOKS ====================

/**
 * Hook to create a note
 * Updates cache optimistically on success
 */
export function useCreateNote(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotePayload) => dealsService.createNote(data),
    onSuccess: (newNote: Note) => {
      // Optimistically add to cache
      queryClient.setQueryData<Note[]>(
        dealsKeys.notes(dealUUID),
        (old = []) => {
          return [...old, newNote];
        }
      );
      // Increment count
      incrementCounts(queryClient, dealUUID, "notes");
      toast.success("Note created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create note");
    },
  });
}

/**
 * Hook to update a note
 * Updates cache optimistically on success
 */
export function useUpdateNote(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteUUID,
      data,
    }: {
      noteUUID: string;
      data: UpdateNotePayload;
    }) => dealsService.updateNote(noteUUID, data),
    onSuccess: (updatedNote: Note, variables) => {
      // Optimistically update in cache
      queryClient.setQueryData<Note[]>(
        dealsKeys.notes(dealUUID),
        (old = []) => {
          return old.map((n) =>
            n.noteUUID === variables.noteUUID ? updatedNote : n
          );
        }
      );
      toast.success("Note updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update note");
    },
  });
}

/**
 * Hook to delete a note
 * Removes from cache optimistically on success
 */
export function useDeleteNote(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteUUID: string) => dealsService.deleteNote(noteUUID),
    onSuccess: (_, noteUUID) => {
      // Optimistically remove from cache
      queryClient.setQueryData<Note[]>(
        dealsKeys.notes(dealUUID),
        (old = []) => {
          return old.filter((n) => n.noteUUID !== noteUUID);
        }
      );
      // Decrement count
      decrementCounts(queryClient, dealUUID, "notes");
      toast.success("Note deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete note");
    },
  });
}

// ==================== MEETING MUTATION HOOKS ====================

/**
 * Hook to create a meeting
 * Updates cache optimistically on success
 */
export function useCreateMeeting(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingPayload) =>
      dealsService.createMeeting(data),
    onSuccess: (newMeeting: Meeting) => {
      // Optimistically add to cache
      queryClient.setQueryData<Meeting[]>(
        dealsKeys.meetings(dealUUID),
        (old = []) => {
          return [...old, newMeeting];
        }
      );
      // Increment count
      incrementCounts(queryClient, dealUUID, "meetings");
      toast.success("Meeting created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create meeting");
    },
  });
}

/**
 * Hook to update a meeting
 * Updates cache optimistically on success
 */
export function useUpdateMeeting(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingUUID,
      data,
    }: {
      meetingUUID: string;
      data: UpdateMeetingPayload;
    }) => dealsService.updateMeeting(meetingUUID, data),
    onSuccess: (updatedMeeting: Meeting, variables) => {
      // Optimistically update in cache
      queryClient.setQueryData<Meeting[]>(
        dealsKeys.meetings(dealUUID),
        (old = []) => {
          return old.map((m) =>
            m.meetingUUID === variables.meetingUUID ? updatedMeeting : m
          );
        }
      );
      toast.success("Meeting updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update meeting");
    },
  });
}

/**
 * Hook to complete a meeting
 * Updates cache optimistically on success
 */
export function useCompleteMeeting(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingUUID,
      data,
    }: {
      meetingUUID: string;
      data: CompleteMeetingPayload;
    }) => dealsService.completeMeeting(meetingUUID, data),
    onSuccess: (updatedMeeting: Meeting, variables) => {
      // Optimistically update in cache
      queryClient.setQueryData<Meeting[]>(
        dealsKeys.meetings(dealUUID),
        (old = []) => {
          return old.map((m) =>
            m.meetingUUID === variables.meetingUUID
              ? { ...m, ...updatedMeeting }
              : m
          );
        }
      );
      toast.success("Meeting completed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete meeting");
    },
  });
}

/**
 * Hook to cancel a meeting
 * Updates cache optimistically on success
 */
export function useCancelMeeting(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingUUID,
      reason,
    }: {
      meetingUUID: string;
      reason: string;
    }) => dealsService.cancelMeeting(meetingUUID, reason),
    onSuccess: (updatedMeeting: Meeting, variables) => {
      // Optimistically update in cache
      queryClient.setQueryData<Meeting[]>(
        dealsKeys.meetings(dealUUID),
        (old = []) => {
          return old.map((m) =>
            m.meetingUUID === variables.meetingUUID
              ? { ...m, ...updatedMeeting }
              : m
          );
        }
      );
      toast.success("Meeting cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel meeting");
    },
  });
}

/**
 * Hook to reschedule a meeting
 * Updates cache optimistically on success
 */
export function useRescheduleMeeting(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingUUID,
      data,
    }: {
      meetingUUID: string;
      data: RescheduleMeetingPayload;
    }) => dealsService.rescheduleMeeting(meetingUUID, data),
    onSuccess: (updatedMeeting: Meeting, variables) => {
      // Optimistically update in cache
      queryClient.setQueryData<Meeting[]>(
        dealsKeys.meetings(dealUUID),
        (old = []) => {
          return old.map((m) =>
            m.meetingUUID === variables.meetingUUID
              ? { ...m, ...updatedMeeting }
              : m
          );
        }
      );
      toast.success("Meeting rescheduled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reschedule meeting");
    },
  });
}

/**
 * Hook to delete a meeting
 * Removes from cache optimistically on success
 */
export function useDeleteMeeting(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingUUID: string) =>
      dealsService.deleteMeeting(meetingUUID),
    onSuccess: (_, meetingUUID) => {
      queryClient.setQueryData<Meeting[]>(
        dealsKeys.meetings(dealUUID),
        (old = []) => {
          return old.filter((m) => m.meetingUUID !== meetingUUID);
        }
      );
      // Decrement count
      decrementCounts(queryClient, dealUUID, "meetings");
      toast.success("Meeting deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete meeting");
    },
  });
}

export function useDealAttachments(dealUUID: string, enabled?: boolean) {
  return useQuery({
    queryKey: dealsKeys.attachments(dealUUID),
    queryFn: () => dealsService.fetchDealAttachments(dealUUID),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
    enabled: enabled && !!dealUUID,
    retry: 1,
  });
}

export function useCreateDealAttachment(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadFileValues) =>
      dealsService.addDealAttachment(data),
    onSuccess: (newAttachment: UploadFileValues) => {
      // Optimistically add to cache
      queryClient.setQueryData<UploadFileValues[]>(
        dealsKeys.attachments(dealUUID),
        (old = []) => {
          return [...old, newAttachment];
        }
      );
      // Increment count
      incrementCounts(queryClient, dealUUID, "attachments");
      toast.success("Attachment created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create attachment");
    },
  });
}
export function useDeleteDealAttachment(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentUUID: string) =>
      dealsService.deleteDealAttachment({ attachmentUUID }),
    onSuccess: (_, attachmentUUID) => {
      queryClient.setQueryData<Attachment[]>(
        dealsKeys.attachments(dealUUID),
        (old = []) => {
          return old.filter((a) => a.attachmentUUID !== attachmentUUID);
        }
      );
      // Decrement count
      decrementCounts(queryClient, dealUUID, "attachments");
      toast.success("Attachment deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete attachment");
    },
  });
}
export function useUpdateDealAttachment(dealUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Attachment) => dealsService.updateDealAttachment(data),
    onSuccess: (newAttachment: Attachment) => {
      queryClient.setQueryData<Attachment[]>(
        dealsKeys.attachments(dealUUID),
        (old = []) => {
          return old.map((a) =>
            a.attachmentUUID === newAttachment.attachmentUUID
              ? { ...a, ...newAttachment }
              : a
          );
        }
      );
      toast.success("Attachment updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update attachment");
    },
  });
}

export function useDealTimelineCounts(
  dealUUID: string,
  enabled?: boolean
) {
  return useQuery({
    queryKey: dealsKeys.timelineCounts(dealUUID),
    queryFn: () => dealsService.fetchTimelineCounts(dealUUID),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
    retry: 1,
    enabled: !!dealUUID && enabled,
  });
}

/**
 * Hook for infinite scroll timeline with page-based pagination
 * Uses TanStack Query's useInfiniteQuery for automatic pagination
 */
export function useInfiniteTimeline(
  dealUUID: string,
  filters: Omit<TimelineFilters, 'page'>,
  enabled?: boolean
) {
  return useInfiniteQuery({
    queryKey: [...dealsKeys.timeline(dealUUID), 'infiniteTimeline', filters],
    queryFn: ({ pageParam = 1 }) =>
      dealsService.fetchTimeline(dealUUID, {
        ...filters,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: TimelineResponse['data']) => {
      if(!lastPage.list || lastPage.list.length === 0) return undefined;
      return  lastPage.hasNext ? lastPage.page + 1 : undefined
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!dealUUID && enabled,
    retry: 1,
  });
}


// ==================== COUNT MANAGEMENT HELPERS ====================

/**
 * Helper function to increment counts for a specific tab in the deal cache
 */
const incrementCounts = (
  queryClient: ReturnType<typeof useQueryClient>,
  dealUUID: string,
  tab: DealTabsOptions
) => {
  queryClient.setQueryData<Deal>(dealsKeys.detail(dealUUID), (old) => {
    if (!old) return old;
    return {
      ...old,
      counts: {
        ...(old.counts || {}),
        [tab]: ((old.counts?.[tab] as number) || 0) + 1,
      },
    };
  });

  // Also update the counts in the deals list cache
  queryClient.setQueriesData<DealsResponse>(
    { queryKey: dealsKeys.lists() },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        data: {
          ...old.data,
          list: old.data.list.map((deal) =>
            deal.dealUUID === dealUUID
              ? {
                  ...deal,
                  counts: {
                    ...(deal.counts || {}),
                    [tab]: ((deal.counts?.[tab] as number) || 0) + 1,
                  },
                }
              : deal
          ),
        },
      };
    }
  );
};

/**
 * Helper function to decrement counts for a specific tab in the deal cache
 */
const decrementCounts = (
  queryClient: ReturnType<typeof useQueryClient>,
  dealUUID: string,
  tab: DealTabsOptions
) => {
  queryClient.setQueryData<Deal>(dealsKeys.detail(dealUUID), (old) => {
    if (!old) return old;
    return {
      ...old,
      counts: {
        ...(old.counts || {}),
        [tab]: Math.max(((old.counts?.[tab] as number) || 0) - 1, 0),
      },
    };
  });

  // Also update the counts in the deals list cache
  queryClient.setQueriesData<DealsResponse>(
    { queryKey: dealsKeys.lists() },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        data: {
          ...old.data,
          list: old.data.list.map((deal) =>
            deal.dealUUID === dealUUID
              ? {
                  ...deal,
                  counts: {
                    ...(deal.counts || {}),
                    [tab]: Math.max(
                      ((deal.counts?.[tab] as number) || 0) - 1,
                      0
                    ),
                  },
                }
              : deal
          ),
        },
      };
    }
  );
};
