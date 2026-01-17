'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { leadsKeys } from './leads.queryKeys';
import { leadsService } from './leads.service';
import { LeadFilters, CreateLeadData, CancelLeadData, Lead, LeadsResponse, ConvertLeadData, CreateFollowUpPayload, UpdateFollowUpPayload, CreateCallPayload, UpdateCallPayload, SendEmailPayload, TimelineFilters } from './leads.types';
import { FollowUP, CallLog, Email } from '@/lib/types';
import { CompleteFollowUpValues, CancelFollowUpValues, RescheduleFollowUpValues } from '@/context/store/dealsStore';
import { dealsKeys } from '../../deals/services/deals.queryKeys';
import { DealsResponse, TimelineResponse } from '../../deals/services/deals.types';




export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: leadsKeys.list(filters),
    queryFn: () => leadsService.fetchLeads(filters),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
  });
}

export function useLead(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: leadsKeys.detail(id),
    queryFn: () => leadsService.fetchLeadById(id),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
    enabled: enabled && !!id,
    retry: 1,
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
      // Update all list queries (with different filters) by adding the new lead
      queryClient.setQueriesData({ queryKey: leadsKeys.lists() }, (old: LeadsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            list: [data, ...old.data.list],
            totalCount: old.data.totalCount + 1,
            filterCount: old.data.filterCount + 1,
          },
        };
      });
      toast.success('Prospect created successfully');
    },
    onError: (error: Error) => {
      console.error('Error creating prospect:', error);
      toast.error(error.message || 'Failed to create prospect');
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
    onSuccess: (_, variables: CancelLeadData) => {
      // Update all list queries (with different filters) by updating the cancelled lead
      queryClient.setQueriesData({ queryKey: leadsKeys.lists() }, (old: LeadsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            list: old.data.list.map((lead) => {
              if (lead.leadUUID === variables.leadUUID) {
                return { ...lead, leadStatus: 'cancelled', closeReason: variables.closeReason };
              }
              return lead;
            }),
          },
        };
      });
      // Update the specific lead detail cache
      queryClient.setQueryData(leadsKeys.detail(variables.leadUUID), (old: Lead | undefined) => {
        if (!old) return old;
        return {
          ...old,
          leadStatus: 'cancelled',
          closeReason: variables.closeReason,
        };
      });
      toast.success('Prospect cancelled successfully');
    },
    onError: (error: Error) => {
      console.error('Error cancelling prospect:', error);
      toast.error(error.message || 'Failed to cancel prospect');
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
    onSuccess: (data, variables) => {
      // Update all list queries (with different filters) by removing the converted lead
      queryClient.setQueriesData({ queryKey: leadsKeys.lists() }, (old: LeadsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            list: old.data.list.filter((lead) => lead.leadUUID !== variables.leadUUID),
            totalCount: old.data.totalCount - 1,
            filterCount: old.data.filterCount - 1,
          },
        };
      });
      // Remove the specific lead detail from cache
      queryClient.removeQueries({ queryKey: leadsKeys.detail(variables.leadUUID) });
      queryClient.setQueriesData({ queryKey: dealsKeys.lists() }, (old: DealsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            list: [data, ...old.data.list],
            totalCount: old.data.totalCount + 1,
            filterCount: old.data.filterCount + 1,
          },
        };
      });
      toast.success('Prospect converted to deal successfully');
    },
    onError: (error: Error) => {
      console.error('Error converting prospect:', error);
      toast.error(error.message || 'Failed to convert prospect');
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
    staleTime: 5 * 60 * 1000, // 5 minutes - prevents excessive refetches
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
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
      // Add to cache
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return [...old, newFollowUp];
      });
      // Increment count
      incrementCounts(queryClient, leadUUID, "followUpCount");
      toast.success('Follow-up created successfully');
    },
    onError: (error: Error) => {
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
    onSuccess: (updatedFollowUp: FollowUP) => {
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return old.map(f => f.followUpUUID === updatedFollowUp.followUpUUID ? updatedFollowUp : f);
      });
      toast.success('Follow-up updated successfully');
    },
    onError: (error: Error) => {
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
    onSuccess: (updatedFollowUp: FollowUP, variables) => {
      // Update cache with server response
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return old.map(f =>
          f.followUpUUID === variables.followUpUUID
            ? { ...f, ...updatedFollowUp }
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
      leadsService.cancelFollowUp(followUpUUID, data.cancellationReason),
    onSuccess: (updatedFollowUp: FollowUP, variables) => {
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return old.map(f =>
          f.followUpUUID === variables.followUpUUID
            ? { ...f, ...updatedFollowUp }
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
    onSuccess: (updatedFollowUp: FollowUP, variables) => {
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return old.map(f =>
          f.followUpUUID === variables.followUpUUID
            ? {
              ...f,
              ...updatedFollowUp
            }
            : f
        );
      });
      toast.success('Follow-up rescheduled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reschedule follow-up');
    },
  });
}


export function useDeleteFollowUp(leadUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followUpUUID: string) => leadsService.deleteFollowUp(followUpUUID),
    onSuccess: (_, followUpUUID) => {
      queryClient.setQueryData<FollowUP[]>(leadsKeys.followUps(leadUUID), (old = []) => {
        return old.filter(f => f.followUpUUID !== followUpUUID);
      });
      // Decrement count
      decrementCounts(queryClient, leadUUID, "followUpCount");
      toast.success('Follow-up deleted successfully');
    },
    onError: (error: Error) => {
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
      // Increment count
      incrementCounts(queryClient, leadUUID, "callLogCount");
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
      // Decrement count
      decrementCounts(queryClient, leadUUID, "callLogCount");
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
      // Increment count
      incrementCounts(queryClient, leadUUID, "emailCount");
    },
  });
}

const incrementCounts = (
  queryClient: ReturnType<typeof useQueryClient>,
  leadUUID: string,
  tab: "followUpCount" | "emailCount" | "callLogCount"
) => {
  queryClient.setQueryData<Lead>(leadsKeys.detail(leadUUID), (old) => {
    if (!old) return old;
    return {
      ...old,
      [tab]: ((old[tab] as number) || 0) + 1,
    };
  });

  // Also update the counts in the leads list cache
  queryClient.setQueriesData<LeadsResponse>(
    { queryKey: leadsKeys.lists() },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        data: {
          ...old.data,
          list: old.data.list.map((lead) =>
            lead.leadUUID === leadUUID
              ? {
                ...lead,
                [tab]: ((lead[tab] as number) || 0) + 1,
              }
              : lead
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
  leadUUID: string,
  tab: "followUpCount" | "emailCount" | "callLogCount"
) => {
  queryClient.setQueryData<Lead>(leadsKeys.detail(leadUUID), (old) => {
    if (!old) return old;
    return {
      ...old,
      [tab]: Math.max(((old[tab] as number) || 0) - 1, 0),
    };
  });

  // Also update the counts in the leads list cache
  queryClient.setQueriesData<LeadsResponse>(
    { queryKey: leadsKeys.lists() },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        data: {
          ...old.data,
          list: old.data.list.map((lead) =>
            lead.leadUUID === leadUUID
              ? {
                ...lead,
                [tab]: Math.max(((lead[tab] as number) || 0) - 1, 0),
              }
              : lead
          ),
        },
      };
    }
  );
};

// ==================== TIMELINE HOOKS ====================

/**
 * Hook for infinite scroll timeline with page-based pagination
 * Uses TanStack Query's useInfiniteQuery for automatic pagination
 */
export function useInfiniteTimeline(
  leadUUID: string,
  filters: Omit<TimelineFilters, 'page'>,
  enabled?: boolean
) {
  return useInfiniteQuery({
    queryKey: [...leadsKeys.timeline(leadUUID), 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      leadsService.fetchTimeline(leadUUID, {
        ...filters,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: TimelineResponse['data']) => {
      if (!lastPage.list || lastPage.list.length === 0) return undefined;
      return lastPage.hasNext ? lastPage.page + 1 : undefined
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!leadUUID && enabled,
    retry: 1,
  });
}

/**
 * Hook to fetch lead timeline counts
 * Only fetches when enabled
 */
export function useLeadTimelineCounts(
  leadUUID: string,
  enabled?: boolean
) {
  return useQuery({
    queryKey: leadsKeys.timelineCounts(leadUUID),
    queryFn: () => leadsService.fetchTimelineCounts(leadUUID),
    staleTime: 60 * 60000, // 1 hour
    gcTime: 60 * 60000, // 1 hour
    retry: 1,
    enabled: !!leadUUID && enabled,
  });
}