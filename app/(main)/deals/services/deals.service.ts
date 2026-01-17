import {
  CompleteFollowUpValues,
  RescheduleFollowUpValues,
  UploadFileValues,
} from "@/context/store/dealsStore";
import { Product } from "@/app/(main)/products/services/types";
import { apiClient } from "@/lib/apiClient/apiClient";
import {
  Attachment,
  CallLog,
  Email,
  FollowUP,
  Meeting,
  Note,
} from "@/lib/types";
import { APIPATH } from "@/shared/constants/url";
import {
  CompleteMeetingPayload,
  CreateCallPayload,
  CreateFollowUpPayload,
  CreateMeetingPayload,
  CreateNotePayload,
  RescheduleMeetingPayload,
  SendEmailPayload,
  UpdateCallPayload,
  UpdateFollowUpPayload,
  UpdateMeetingPayload,
  UpdateNotePayload,
} from "./deals.hooks";
import {
  CreateDealData,
  Deal,
  DealFilters,
  DealsResponse,
  DealTimelineCounts,
  TimelineEvents,
  TimelineFilters,
  TimelineResponse,
  UpdateDealStagePayload,
} from "./deals.types";

/**
 * Deals API Service
 * Encapsulates all deal-related API calls
 */
export const dealsService = {
  /**
   * Fetch paginated deals with filters
   */
  fetchDeals: async (filters: DealFilters): Promise<DealsResponse> => {
    const { page, pageSize, searchQuery, stageFilter, healthcareFilter } =
      filters;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
    });

    if (searchQuery) {
      queryParams.append("searchDeal", searchQuery);
    }
    if (stageFilter) {
      queryParams.append("searchDealStage", stageFilter);
    }
    if (healthcareFilter) {
      queryParams.append("searchHcoUUID", healthcareFilter);
    }

    const response = await apiClient.get<DealsResponse>(
      `${APIPATH.DEAL.GETALLDEALS}?${queryParams.toString()}`
    );

    return response;
  },

  /**
   * Fetch individual deal by ID
   */
  fetchDealById: async (id: string): Promise<Deal> => {
    const response = await apiClient.get<{ data: Deal }>(
      APIPATH.DEAL.GETDEAL + id
    );
    return response.data;
  },

  /**
   * Create a new deal
   */
  createDeal: async (data: CreateDealData): Promise<Deal> => {
    const response = await apiClient.post<{ data: Deal }>(
      APIPATH.DEAL.CREATEDEAL,
      data
    );
    return response.data;
  },

  /**
   * Update deal stage
   */
  updateDealStage: async (
    dealUUID: string,
    data: UpdateDealStagePayload
  ): Promise<Deal> => {
    const response = await apiClient.post<{ data: Deal }>(
      APIPATH.DEAL.TABS.DEALSTAGEUPDATE(dealUUID),
      data
    );
    return response.data;
  },

  // ==================== TAB DATA FETCHING ====================

  /**
   * Fetch all contacts for a deal
   */
  fetchDealContacts: async (dealUUID: string): Promise<any[]> => {
    const response = await apiClient.get<{ data: any[] }>(
      APIPATH.DEAL.TABS.DEALALLCONTACTS(dealUUID)
    );
    return response.data;
  },

  /**
   * Fetch Products  for a deal
   */
  fetchDealProducts: async (dealUUID: string): Promise<Product[]> => {
    const response = await apiClient.get<{ data: Product[] }>(
      APIPATH.DEAL.TABS.PRODUCTS.GETPRODUCTS(dealUUID)
    );
    return response.data;
  },

  /**
   * Add Product to a deal
   */
  addDealProduct: async (payload: {
    productUUID: string;
    dealUUID: string;
  }): Promise<Product> => {
    const response = await apiClient.post<{ data: Product }>(
      APIPATH.DEAL.TABS.PRODUCTS.ADDDEALPRODCUT,
      payload
    );
    return response.data;
  },

  /**
   * Delete Product from a deal
   */
  deleteDealProduct: async (payload: {
    productUUID: string;
    dealUUID: string;
    reason?: string;
  }): Promise<void> => {
    await apiClient.post(APIPATH.DEAL.TABS.PRODUCTS.DELETEDEALPRODUCT, payload);
  },

  /**
   * Fetch follow-ups for a deal
   */
  fetchDealFollowUps: async (dealUUID: string): Promise<FollowUP[]> => {
    const response = await apiClient.get<{ data: FollowUP[] }>(
      APIPATH.DEAL.TABS.FOLLOWUP.GETALLFOLLOWUP + dealUUID
    );
    return response.data;
  },

  /**
   * Fetch calls for a deal
   */
  fetchDealCalls: async (dealUUID: string): Promise<CallLog[]> => {
    const response = await apiClient.get<{ data: CallLog[] }>(
      APIPATH.DEAL.TABS.CALL.GETALLCALL + dealUUID
    );
    return response.data;
  },

  /**
   * Fetch emails for a deal
   */
  fetchDealEmails: async (dealUUID: string): Promise<Email[]> => {
    const response = await apiClient.get<{ data: Email[] }>(
      APIPATH.DEAL.TABS.EMAIL.GETALLEMAIL(dealUUID)
    );
    return response.data;
  },

  /**
   * Fetch notes for a deal
   */
  fetchDealNotes: async (dealUUID: string): Promise<Note[]> => {
    const response = await apiClient.get<{ data: Note[] }>(
      APIPATH.DEAL.TABS.NOTES.GETALLNOTES + dealUUID
    );
    return response.data;
  },

  /**
   * Fetch meetings for a deal
   */
  fetchDealMeetings: async (dealUUID: string): Promise<Meeting[]> => {
    const response = await apiClient.get<{ data: Meeting[] }>(
      APIPATH.DEAL.TABS.MEETING.GETALLMEETING + dealUUID
    );
    return response.data;
  },

  // ==================== FOLLOW-UP MUTATIONS ====================

  /**
   * Create a new follow-up
   */
  createFollowUp: async (data: CreateFollowUpPayload): Promise<FollowUP> => {
    const response = await apiClient.post<{ data: FollowUP }>(
      APIPATH.DEAL.TABS.FOLLOWUP.CREATEFOLLOWUP,
      data
    );
    return response.data;
  },

  /**
   * Update a follow-up
   */
  updateFollowUp: async (
    followUpUUID: string,
    data: UpdateFollowUpPayload
  ): Promise<FollowUP> => {
    const response = await apiClient.put<{ data: FollowUP }>(
      APIPATH.DEAL.TABS.FOLLOWUP.UPDATEFOLLOWUP + followUpUUID,
      data
    );
    return response.data;
  },

  /**
   * Complete a follow-up
   */
  completeFollowUp: async (
    followUpUUID: string,
    data: CompleteFollowUpValues
  ): Promise<FollowUP> => {
    const response = await apiClient.patch<{ data: FollowUP }>(
      APIPATH.DEAL.TABS.FOLLOWUP.COMPLETEFOLLOWUP +
        followUpUUID +
        "/" +
        data.outcome
    );
    return response.data;
  },

  /**
   * Cancel a follow-up
   */
  cancelFollowUp: async (
    followUpUUID: string,
    reason: string
  ): Promise<FollowUP> => {
    const response = await apiClient.patch<{ data: FollowUP }>(
      APIPATH.DEAL.TABS.FOLLOWUP.CANCELFOLLOWUP +
        followUpUUID +
        "?reason=" +
        reason
    );
    return response.data;
  },

  /**
   * Reschedule a follow-up
   */
  rescheduleFollowUp: async (
    followUpUUID: string,
    data: RescheduleFollowUpValues
  ): Promise<FollowUP> => {
    const response = await apiClient.post<{ data: FollowUP }>(
      APIPATH.DEAL.TABS.FOLLOWUP.RESCHEDULEFOLLOWUP + followUpUUID,
      data
    );
    return response.data;
  },

  /**
   * Delete a follow-up
   */
  deleteFollowUp: async (followUpUUID: string): Promise<FollowUP> => {
    const response = await apiClient.delete<{ data: FollowUP }>(
      APIPATH.DEAL.TABS.FOLLOWUP.DELETEFOLLOWUP + followUpUUID
    );
    return response.data;
  },

  // ==================== CALL MUTATIONS ====================

  /**
   * Create a new call log
   */
  createCall: async (data: CreateCallPayload): Promise<CallLog> => {
    const response = await apiClient.post<{ data: CallLog }>(
      APIPATH.DEAL.TABS.CALL.CREATECALL,
      data
    );
    return response.data;
  },

  /**
   * Update a call log
   */
  updateCall: async (
    callLogUUID: string,
    data: UpdateCallPayload
  ): Promise<CallLog> => {
    const response = await apiClient.put<{ data: CallLog }>(
      APIPATH.DEAL.TABS.CALL.UPDATECALL + callLogUUID,
      data
    );
    return response.data;
  },

  /**
   * Delete a call log
   */
  deleteCall: async (callLogUUID: string): Promise<void> => {
    await apiClient.delete(APIPATH.DEAL.TABS.CALL.DELETECALL + callLogUUID);
  },

  // ==================== EMAIL MUTATIONS ====================

  /**
   * Send an email
   */
  sendEmail: async (data: SendEmailPayload): Promise<Email> => {
    const response = await apiClient.post<{ data: Email }>(
      APIPATH.DEAL.TABS.EMAIL.CREATEEMAIL,
      data
    );
    return response.data;
  },

  // ==================== NOTE MUTATIONS ====================

  /**
   * Create a new note
   */
  createNote: async (data: CreateNotePayload): Promise<Note> => {
    const response = await apiClient.post<{ data: Note }>(
      APIPATH.DEAL.TABS.NOTES.CREATENOTE,
      data
    );
    return response.data;
  },

  /**
   * Update a note
   */
  updateNote: async (
    noteUUID: string,
    data: UpdateNotePayload
  ): Promise<Note> => {
    const response = await apiClient.put<{ data: Note }>(
      APIPATH.DEAL.TABS.NOTES.UPDATENOTE + noteUUID,
      data
    );
    return response.data;
  },

  /**
   * Delete a note
   */
  deleteNote: async (noteUUID: string): Promise<void> => {
    await apiClient.delete(APIPATH.DEAL.TABS.NOTES.DELETENOTE + noteUUID);
  },

  // ==================== MEETING MUTATIONS ====================

  /**
   * Create a new meeting
   */
  createMeeting: async (data: CreateMeetingPayload): Promise<Meeting> => {
    const response = await apiClient.post<{ data: Meeting }>(
      APIPATH.DEAL.TABS.MEETING.CREATEMEETING,
      data
    );
    return response.data;
  },

  /**
   * Update a meeting
   */
  updateMeeting: async (
    meetingUUID: string,
    data: UpdateMeetingPayload
  ): Promise<Meeting> => {
    const response = await apiClient.put<{ data: Meeting }>(
      APIPATH.DEAL.TABS.MEETING.UPDATEMEETING + meetingUUID,
      data
    );
    return response.data;
  },

  /**
   * Complete a meeting
   */
  completeMeeting: async (
    meetingUUID: string,
    data: CompleteMeetingPayload
  ): Promise<Meeting> => {
    const response = await apiClient.patch<{ data: Meeting }>(
      APIPATH.DEAL.TABS.MEETING.COMPLETEMEETING +
        meetingUUID +
        "/" +
        data.outcome
    );
    return response.data;
  },

  /**
   * Cancel a meeting
   */
  cancelMeeting: async (
    meetingUUID: string,
    reason: string
  ): Promise<Meeting> => {
    const response = await apiClient.patch<{ data: Meeting }>(
      APIPATH.DEAL.TABS.MEETING.CANCELMEETING +
        meetingUUID +
        "?reason=" +
        reason
    );
    return response.data;
  },

  /**
   * Reschedule a meeting
   */
  rescheduleMeeting: async (
    meetingUUID: string,
    data: RescheduleMeetingPayload
  ): Promise<Meeting> => {
    const response = await apiClient.post<{ data: Meeting }>(
      APIPATH.DEAL.TABS.MEETING.RESCHEDULEMEETING + meetingUUID,
      data
    );
    return response.data;
  },

  /**
   * Delete a meeting
   */
  deleteMeeting: async (meetingUUID: string): Promise<void> => {
    await apiClient.delete(
      APIPATH.DEAL.TABS.MEETING.DELETEMEETING + meetingUUID
    );
  },
  /**
   * Fetch attachments for a deal
   */
  fetchDealAttachments: async (dealUUID: string): Promise<Attachment[]> => {
    const response = await apiClient.get<{ data: Attachment[] }>(
      APIPATH.DEAL.TABS.ATTACHMENTS.GETALLATTACHMENTS + dealUUID
    );
    return response.data;
  },

  /**
   * Add attachment to a deal
   */
  addDealAttachment: async (
    payload: UploadFileValues
  ): Promise<UploadFileValues> => {
    const response = await apiClient.post<{ data: UploadFileValues }>(
      APIPATH.DEAL.TABS.ATTACHMENTS.ADDDEALATTACHMENT,
      payload
    );
    return response.data;
  },

  /**
   * Delete attachment from a deal
   */
  deleteDealAttachment: async (payload: {
    attachmentUUID: string;
  }): Promise<void> => {
    await apiClient.delete(
      APIPATH.DEAL.TABS.ATTACHMENTS.DELETEDEALATTACHMENT +
        payload.attachmentUUID
    );
    return;
  },
  /**
   * Update attachment for a deal
   */
  updateDealAttachment: async (payload: Attachment): Promise<Attachment> => {
    const response = await apiClient.put<{ data: Attachment }>(
      APIPATH.DEAL.TABS.ATTACHMENTS.UPDATEDEALATTACHMENT +
        payload.attachmentUUID,
      payload
    );
    return response.data;
  },
  /**
   * Fetch timeline for a deal
   */
  fetchTimeline: async (
    dealUUID: string,
    filters: TimelineFilters
  ): Promise<TimelineResponse["data"]> => {
    const { page, tabs } = filters;

    const queryParams = new URLSearchParams({
      page: page.toString(),
    });

    if (tabs) {
      const formattedTabs = tabs.map((tab) =>
        tab
          .split(" ")
          .map((word, index) =>
            index === 0
              ? word.toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join("")
      );
      queryParams.append("filters", formattedTabs.join(","));
    }
    const response = await apiClient.get<TimelineResponse>(
      APIPATH.DEAL.TABS.TIMELINE(dealUUID) + "?" + queryParams.toString()
    );
    return response.data;
  },
  fetchTimelineCounts: async (
    dealUUID: string
  ): Promise<DealTimelineCounts> => {
    const response = await apiClient.get<{ data: DealTimelineCounts }>(
      APIPATH.DEAL.TABS.TIMELINECOUNTS(dealUUID)
    );
    return response.data;
  },
};
