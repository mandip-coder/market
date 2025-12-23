import { apiClient } from '@/lib/apiClient/apiClient';
import { APIPATH } from '@/shared/constants/url';
import { LeadFilters, LeadsResponse, CreateLeadData, CancelLeadData, ConvertLeadData, Lead } from './leads.types';
import { FollowUP, CallLog, Email } from '@/lib/types';
import { CancelFollowUpValues, CompleteFollowUpValues, RescheduleFollowUpValues } from '@/context/store/dealsStore';
import { CreateFollowUpPayload, UpdateFollowUpPayload, CreateCallPayload, UpdateCallPayload, SendEmailPayload } from './leads.hooks';
import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';

/**
 * Leads API Service
 * Encapsulates all lead-related API calls
 */
export const leadsService = {
  /**
   * Fetch paginated leads with filters
   */
  fetchLeads: async (filters: LeadFilters): Promise<LeadsResponse> => {
    const { page, pageSize, searchQuery, statusFilter, healthcareFilter } = filters;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
    });

    if (searchQuery) {
      queryParams.append('searchLead', searchQuery);
    }
    if (statusFilter) {
      queryParams.append('searchLeadStatus', statusFilter);
    }
    if (healthcareFilter) {
      queryParams.append('searchHcoUUID', healthcareFilter);
    }

    const response = await apiClient.get<LeadsResponse>(
      `${APIPATH.LEAD.GETLEAD}?${queryParams.toString()}`
    );

    return response;
  },

  /**
   * Fetch individual lead by ID
   */
  fetchLeadById: async (id: string): Promise<Lead> => {
    const response = await apiClient.get<{ data: Lead }>(APIPATH.LEAD.GETLEAD + id);
    return response.data;
  },

  /**
   * Fetch contacts for a lead
   */
  getContacts: async (hcoUUID: string): Promise<HCOContactPerson[]> => {
    const response = await apiClient.get<{ data: HCOContactPerson[] }>(APIPATH.HCO.CONTACTPERSONS(hcoUUID));
    return response.data;
  },

  /**
   * Create a new lead
   */
  createLead: async (data: CreateLeadData): Promise<Lead> => {
    const response = await apiClient.post<{ data: Lead }>(APIPATH.LEAD.CREATELEAD, data);
    return response.data;
  },

  /**
   * Cancel a lead
   */
  cancelLead: async (data: CancelLeadData): Promise<void> => {
    await apiClient.put(APIPATH.LEAD.CANCEL + data.leadUUID, {
      closeReason: data.closeReason,
    });
  },

  /**
   * Convert lead to deal
   */
  convertLeadToDeal: async (leadUUID: string): Promise<void> => {
    await apiClient.post(APIPATH.LEAD.CONVERT + leadUUID);
  },

  // ==================== TAB DATA FETCHING ====================

  /**
   * Fetch follow-ups for a lead
   */
  fetchLeadFollowUps: async (leadUUID: string): Promise<FollowUP[]> => {
    const response = await apiClient.get<{ data: FollowUP[] }>(
      APIPATH.LEAD.TABS.FOLLOWUP.GETALLFOLLOWUP + leadUUID
    );
    return response.data;
  },

  /**
   * Fetch calls for a lead
   */
  fetchLeadCalls: async (leadUUID: string): Promise<CallLog[]> => {
    const response = await apiClient.get<{ data: CallLog[] }>(
      APIPATH.LEAD.TABS.CALL.GETALLCALL + leadUUID
    );
    return response.data;
  },

  /**
   * Fetch emails for a lead
   */
  fetchLeadEmails: async (leadUUID: string): Promise<Email[]> => {
    const response = await apiClient.get<{ data: Email[] }>(
      APIPATH.LEAD.TABS.EMAIL.GETALLEMAIL(leadUUID)
    );
    return response.data;
  },

  // ==================== FOLLOW-UP MUTATIONS ====================

  /**
   * Create a new follow-up
   */
  createFollowUp: async (data: CreateFollowUpPayload): Promise<FollowUP> => {
    const response = await apiClient.post<{ data: FollowUP }>(
      APIPATH.LEAD.TABS.FOLLOWUP.CREATEFOLLOWUP,
      data
    );
    return response.data;
  },

  /**
   * Update a follow-up
   */
  updateFollowUp: async (followUpUUID: string, data: UpdateFollowUpPayload): Promise<FollowUP> => {
    const response = await apiClient.put<{ data: FollowUP }>(
      APIPATH.LEAD.TABS.FOLLOWUP.UPDATEFOLLOWUP + followUpUUID,
      data
    );
    return response.data;
  },

  /**
   * Complete a follow-up
   */
  completeFollowUp: async (followUpUUID: string, data: CompleteFollowUpValues): Promise<FollowUP> => {
    const response = await apiClient.patch<{ data: FollowUP }>(
      APIPATH.LEAD.TABS.FOLLOWUP.COMPLETEFOLLOWUP + followUpUUID + "/" + data.outcome,
    );
    return response.data;
  },

  /**
   * Cancel a follow-up
   */
  cancelFollowUp: async (followUpUUID: string, reason: string): Promise<FollowUP> => {
    const response = await apiClient.patch<{ data: FollowUP }>(
      APIPATH.LEAD.TABS.FOLLOWUP.CANCELFOLLOWUP + followUpUUID + "?reason=" + reason,
    );
    return response.data;
  },

  /**
   * Reschedule a follow-up
   */
  rescheduleFollowUp: async (followUpUUID: string, data: RescheduleFollowUpValues): Promise<FollowUP> => {
    const response = await apiClient.post<{ data: FollowUP }>(
      APIPATH.LEAD.TABS.FOLLOWUP.RESCHEDULEFOLLOWUP + followUpUUID,
      data
    );
    return response.data;
  },

  /**
   * Delete a follow-up
   */
  deleteFollowUp: async (followUpUUID: string): Promise<FollowUP> => {
    const response = await apiClient.delete<{ data: FollowUP }>(APIPATH.LEAD.TABS.FOLLOWUP.DELETEFOLLOWUP + followUpUUID);
    return response.data;
  },

  // ==================== CALL MUTATIONS ====================

  /**
   * Create a new call log
   */
  createCall: async (data: CreateCallPayload): Promise<CallLog> => {
    const response = await apiClient.post<{ data: CallLog }>(
      APIPATH.LEAD.TABS.CALL.CREATECALL,
      data
    );
    return response.data;
  },

  /**
   * Update a call log
   */
  updateCall: async (callLogUUID: string, data: UpdateCallPayload): Promise<CallLog> => {
    const response = await apiClient.put<{ data: CallLog }>(
      APIPATH.LEAD.TABS.CALL.UPDATECALL + callLogUUID,
      data
    );
    return response.data;
  },

  /**
   * Delete a call log
   */
  deleteCall: async (callLogUUID: string): Promise<void> => {
    await apiClient.delete(APIPATH.LEAD.TABS.CALL.DELETECALL + callLogUUID);
  },

  // ==================== EMAIL MUTATIONS ====================

  /**
   * Send an email
   */
  sendEmail: async (data: SendEmailPayload): Promise<Email> => {
    const response = await apiClient.post<{ data: Email }>(
      APIPATH.LEAD.TABS.EMAIL.CREATEEMAIL,
      data
    );
    return response.data;
  },
};
