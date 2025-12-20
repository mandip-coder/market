'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { leadsKeys } from './leads.queryKeys';
import { leadsService } from './leads.service';
import { LeadFilters, CreateLeadData, CancelLeadData, ConvertLeadData, Lead } from './leads.types';
import { FollowUP, CallLog, Email } from '@/lib/types';
import { CompleteFollowUpValues, CancelFollowUpValues, RescheduleFollowUpValues } from '@/context/store/dealsStore';

// ==================== TYPE DEFINITIONS ====================

/**
 * Payload for creating a follow-up
 */
export interface CreateFollowUpPayload {
  leadUUID?: string;
  dealUUID?: string;
  subject: string;
  scheduledDate: string;
  contactPersons: string[]; // Array of contact person UUIDs
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

// ==================== LEAD HOOKS ====================

/**
 * Hook to fetch paginated leads with filters
 * Automatically caches data with filter-specific keys
 */
export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: leadsKeys.list(filters),
    queryFn: () => leadsService.fetchLeads(filters),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
  });
}

/**
 * Hook to fetch individual lead by ID
 * Caches each lead separately for optimal performance
 */
export function useLead(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: leadsKeys.detail(id),
    queryFn: () => leadsService.fetchLeadById(id),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
    enabled: enabled && !!id, // Only fetch if enabled and id exists
  });
}

/**
 * Hook to create a new lead
 * Automatically invalidates leads list cache on success
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadData) => leadsService.createLead(data),
    onSuccess: (data: Lead) => {
      queryClient.setQueryData(leadsKeys.lists(), (old: Lead[]) => {
        return [...old, data];
      });
    },
  });
}

/**
 * Hook to cancel a lead
 * Invalidates both the specific lead and all leads lists
 */
export function useCancelLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelLeadData) => leadsService.cancelLead(data),
    onSuccess: (_, variables) => {
      // Invalidate the specific lead detail
      queryClient.invalidateQueries({ queryKey: leadsKeys.detail(variables.leadUUID) });
      // Invalidate all leads lists
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
    },
  });
}

/**
 * Hook to convert a lead to a deal
 * Invalidates both the specific lead and all leads lists
 */
export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConvertLeadData) => leadsService.convertLeadToDeal(data),
    onSuccess: (_, variables) => {
      // Invalidate the specific lead detail
      queryClient.invalidateQueries({ queryKey: leadsKeys.detail(variables.leadUUID) });
      // Invalidate all leads lists
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
    },
  });
}

// ==================== TAB DATA HOOKS ====================

/**
 * Hook to fetch lead follow-ups
 * Only fetches when enabled (tab is active)
 */
export function useLeadFollowUps(leadUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: leadsKeys.followUps(leadUUID),
    queryFn: () => leadsService.fetchLeadFollowUps(leadUUID),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000,
    enabled: enabled && !!leadUUID,
  });
}

/**
 * Hook to fetch lead calls
 * Only fetches when enabled (tab is active)
 */
export function useLeadCalls(leadUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: leadsKeys.calls(leadUUID),
    queryFn: () => leadsService.fetchLeadCalls(leadUUID),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000,
    enabled: enabled && !!leadUUID,
  });
}

/**
 * Hook to fetch lead emails
 * Only fetches when enabled (tab is active)
 */
export function useLeadEmails(leadUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: leadsKeys.emails(leadUUID),
    queryFn: () => leadsService.fetchLeadEmails(leadUUID),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000,
    enabled: enabled && !!leadUUID,
  });
}

// ==================== FOLLOW-UP MUTATION HOOKS ====================

/**
 * Hook to create a follow-up
 * Updates cache optimistically on success
 */
export function useCreateFollowUp(leadUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFollowUpPayload) => leadsService.createFollowUp(data),
    onSuccess: (newFollowUp: FollowUP) => {
      // Optimistically add to cache
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return [...old, newFollowUp];
      });
      toast.success('Follow-up created successfully');
    },
    onError: (error: Error) => {
      console.error('Error creating follow-up:', error);
      toast.error(error.message || 'Failed to create follow-up');
    },
  });
}

/**
 * Hook to update a follow-up
 * Updates cache optimistically on success
 */
export function useUpdateFollowUp(leadUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ followUpUUID, data }: { followUpUUID: string; data: UpdateFollowUpPayload }) =>
      leadsService.updateFollowUp(followUpUUID, data),
    onSuccess: (updatedFollowUp: FollowUP, variables) => {
      // Optimistically update in cache
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return old.map(f => f.followUpUUID === variables.followUpUUID ? updatedFollowUp : f);
      });
      toast.success('Follow-up updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating follow-up:', error);
      toast.error(error.message || 'Failed to update follow-up');
    },
  });
}

/**
 * Hook to complete a follow-up
 * Updates cache optimistically on success
 */
export function useCompleteFollowUp(leadUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ followUpUUID, data }: { followUpUUID: string; data: CompleteFollowUpValues }) =>
      leadsService.completeFollowUp(followUpUUID, data),
    onSuccess: (_, variables) => {
      // Optimistically update status in cache
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return old.map(f =>
          f.followUpUUID === variables.followUpUUID
            ? { ...f, status: 'Completed' as const, outcome: variables.data.outcome }
            : f
        );
      });
      toast.success('Follow-up completed successfully');
    },
    onError: (error: Error) => {
      console.error('Error completing follow-up:', error);
      toast.error(error.message || 'Failed to complete follow-up');
    },
  });
}

/**
 * Hook to cancel a follow-up
 * Updates cache optimistically on success
 */
export function useCancelFollowUp(leadUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ followUpUUID, data }: { followUpUUID: string; data: CancelFollowUpValues }) =>
      leadsService.cancelFollowUp(followUpUUID, data),
    onSuccess: (_, variables) => {
      // Optimistically update status in cache
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return old.map(f =>
          f.followUpUUID === variables.followUpUUID
            ? { ...f, status: 'Cancelled' as const, cancellationReason: variables.data.cancellationReason }
            : f
        );
      });
      toast.success('Follow-up cancelled successfully');
    },
    onError: (error: Error) => {
      console.error('Error cancelling follow-up:', error);
      toast.error(error.message || 'Failed to cancel follow-up');
    },
  });
}

/**
 * Hook to reschedule a follow-up
 * Updates cache optimistically on success
 */
export function useRescheduleFollowUp(leadUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ followUpUUID, data }: { followUpUUID: string; data: RescheduleFollowUpValues }) =>
      leadsService.rescheduleFollowUp(followUpUUID, data),
    onSuccess: (_, variables) => {
      // Optimistically update status in cache
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return old.map(f =>
          f.followUpUUID === variables.followUpUUID
            ? {
              ...f,
              status: 'Rescheduled' as const,
              scheduledDate: variables.data.scheduledDate.format('YYYY-MM-DD HH:mm:ss'),
              nextFollowUpNotes: variables.data.nextFollowUpNotes
            }
            : f
        );
      });
      toast.success('Follow-up rescheduled successfully');
    },
    onError: (error: Error) => {
      console.error('Error rescheduling follow-up:', error);
      toast.error(error.message || 'Failed to reschedule follow-up');
    },
  });
}

/**
 * Hook to delete a follow-up
 * Removes from cache optimistically on success
 */
export function useDeleteFollowUp(leadUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followUpUUID: string) => leadsService.deleteFollowUp(followUpUUID),
    onSuccess: (_, followUpUUID) => {
      // Optimistically remove from cache
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return old.filter(f => f.followUpUUID !== followUpUUID);
      });
      toast.success('Follow-up deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting follow-up:', error);
      toast.error(error.message || 'Failed to delete follow-up');
    },
  });
}

// ==================== CALL MUTATION HOOKS ====================

/**
 * Hook to create a call log
 * Updates cache optimistically on success
 */
export function useCreateCall(leadUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCallPayload) => leadsService.createCall(data),
    onSuccess: (newCall: CallLog) => {
      // Optimistically add to cache
      queryClient.setQueryData<CallLog[]>(leadsKeys.calls(leadUUID), (old = []) => {
        return [...old, newCall];
      });
    },
  });
}

/**
 * Hook to update a call log
 * Updates cache optimistically on success
 */
export function useUpdateCall(leadUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ callLogUUID, data }: { callLogUUID: string; data: UpdateCallPayload }) =>
      leadsService.updateCall(callLogUUID, data),
    onSuccess: (updatedCall: CallLog, variables) => {
      // Optimistically update in cache
      queryClient.setQueryData<CallLog[]>(leadsKeys.calls(leadUUID), (old = []) => {
        return old.map(c => c.callLogUUID === variables.callLogUUID ? updatedCall : c);
      });
    },
  });
}

/**
 * Hook to delete a call log
 * Removes from cache optimistically on success
 */
export function useDeleteCall(leadUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callLogUUID: string) => leadsService.deleteCall(callLogUUID),
    onSuccess: (_, callLogUUID) => {
      // Optimistically remove from cache
      queryClient.setQueryData<CallLog[]>(leadsKeys.calls(leadUUID), (old = []) => {
        return old.filter(c => c.callLogUUID !== callLogUUID);
      });
    },
  });
}

// ==================== EMAIL MUTATION HOOKS ====================

/**
 * Hook to send an email
 * Updates cache optimistically on success
 */
export function useSendEmail(leadUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendEmailPayload) => leadsService.sendEmail(data),
    onSuccess: (newEmail: Email) => {
      // Optimistically add to cache
      queryClient.setQueryData<Email[]>(leadsKeys.emails(leadUUID), (old = []) => {
        return [...old, newEmail];
      });
    },
  });
}
