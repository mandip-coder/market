import { TimelineEvent } from "@/components/shared/TimelineComponent";
import { addTimelineEvent as addTimelineEventUtils } from "@/app/(main)/deals/utils/timeline";
import { Attachment, CallLog, Email, FollowUP, } from "@/lib/types";
import { create } from "zustand";
import { AddFollowUpValues, UploadFileValues, CompleteFollowUpValues, CancelFollowUpValues, RescheduleFollowUpValues } from "./dealsStore";
import { generateUniqueId } from "@/app/(main)/deals/utils/constants";
import dayjs, { Dayjs } from "dayjs";
import { GlobalDate } from "@/Utils/helpers";
import { Product } from "./productStore";
import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";
import { Healthcare } from "@/app/(main)/healthcares/lib/types";
import { LeadFormData } from "@/app/(main)/leads/components/LeadDrawer";



// Type definitions for actions
interface LogCallValues {
  callLogUUID: string;
  subject: string;
  callStartTime: string;
  duration: string;
  purpose: string;
  agenda: string;
  comment: string;
  outcome: string
  outcomeUUID: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
 export  interface EmailFormValues {
    leadUUID: string;
    dealUUID: string;
    recipients: string[];
    ccRecipients: string[];
    bccRecipients: string[];
    subject: string;
    body: string;
    attachments: {
      filename: string;
      url: string;
      filePath: string;
      size: number;
      mimeType: string;
    }[]
  }


interface LeadsStore {
  user: any;
  page: number;
  pageSize: number;
  leadUUID: string,
  setHcoUUID: (hcoUUID: string) => void,
  setHcoName: (hcoName: string) => void,
  setLeadUUID: (leadUUID: string) => void,
  hcoList: Healthcare[];
  setHcoList: (hcoList: Healthcare[]) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  productList: Product[];
  setProductList: (productList: Product[]) => void;
  setUser: (user: any) => void;
  leadModal: boolean;
  suggestionId?: string;
  preFilledData?: Partial<LeadFormData>;
  toggleLeadDrawer: (suggestionId?: string, preFilledData?: Partial<LeadFormData>) => void;
  selectedProducts: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string, reason?: string) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  attachments: Attachment[];
  timelineEvents: TimelineEvent[];
  uploadFile: (values: UploadFileValues) => void;
  removeAttachment: (attachmentId: string) => void;
  // Contact Persons
  contactPersons: HCOContactPerson[];
  setContactPersons: (contactPersons: HCOContactPerson[]) => void;
  hcoUUID: string | null;
  hcoName: string | null;
  // FollowUps Actions
  followUps: FollowUP[];
  setFollowUps: (followUps: FollowUP[]) => void;
  addFollowUp: (values: AddFollowUpValues) => void;
  updateFollowUp: (followUpUUId: string, values: AddFollowUpValues) => void;
  completeFollowUp: (followUpUUId: string, values: CompleteFollowUpValues) => void;
  cancelFollowUp: (followUpUUId: string, values: CancelFollowUpValues) => void;
  rescheduleFollowUp: (followUpUUId: string, values: RescheduleFollowUpValues) => void;
  deleteFollowUp: (followUpUUId: string) => void;
  // Calls Actions
  calls: CallLog[];
  setCalls: (calls: CallLog[]) => void;
  logCall: (values: LogCallValues) => void;
  updateCall: (callId: string, values: LogCallValues) => void;
  deleteCall: (callId: string) => void;
  // Emails Actions
  emails: Email[];
  setEmails: (emails: Email[]) => void;
  sendEmail: (values: EmailFormValues,) => void;
}


export const useLeadStore = create<LeadsStore>((set, get) => ({
  user: null,
  page: 1,
  pageSize: 10,
  leadUUID: '',
  setLeadUUID: (leadUUID: string) => set({ leadUUID }),
  productList: [],
  hcoList: [],
  setHcoList: (hcoList: Healthcare[]) => set({ hcoList }),
  setPage: (page: number) => set({ page }),
  setPageSize: (pageSize: number) => set({ pageSize }),
  setProductList: (productList: Product[]) => set({ productList }),
  setUser: (user) => set({ user }),
  leadModal: false,
  suggestionId: undefined,
  preFilledData: undefined,
  toggleLeadDrawer: (suggestionId?: string, preFilledData?: Partial<LeadFormData>) => {
    const currentModal = get().leadModal;
    set({
      leadModal: !currentModal,
      suggestionId: !currentModal ? suggestionId : undefined,
      preFilledData: !currentModal ? preFilledData : undefined,
    });
  },
  timelineEvents: [],
  selectedProducts: [],
  attachments: [],
  followUps: [],
  calls: [],
  emails: [],
  setEmails: (emails: Email[]) => set({ emails }),
  contactPersons: [],
  hcoUUID: null,
  hcoName: null,
  setHcoUUID: (hcoUUID: string) => set({ hcoUUID }),
  setHcoName: (hcoName: string) => set({ hcoName }),

  setCalls: (calls: CallLog[]) => set({ calls }),
  // Contact Persons
  setContactPersons: (contactPersons: HCOContactPerson[]) => {
    set({ contactPersons });
  },

  // FollowUps setter
  setFollowUps: (followUps: FollowUP[]) => {
    set({ followUps });
  },
  addProduct: (product: Product, reason?: string) => {
    const { selectedProducts, addTimelineEvent } = get();
    if (!selectedProducts.some((p) => p.productUUID === product.productUUID)) {
      const newSelectedProducts = [...selectedProducts, product];
      set({ selectedProducts: newSelectedProducts });

      addTimelineEvent({
        type: 'Product',
        title: `Added product: ${product.productName}`,
        description: `Product "${product.productName}" was added to the deal`,
        timestamp: new Date().toISOString(),
        color: 'orange',
        user: get().user?.name || 'System',
        details: { product, reason },
      });
    }
  },

  removeProduct: (productId: string, reason?: string) => {
    const { selectedProducts, addTimelineEvent } = get();
    const product = selectedProducts.find((p) => p.productUUID === productId);
    if (product) {
      const newSelectedProducts = selectedProducts.filter((p) => p.productUUID !== productId);
      set({ selectedProducts: newSelectedProducts });

      addTimelineEvent({
        type: 'Product',
        title: `Removed product: ${product.productName}`,
        description: `Product "${product.productName}" was removed from the deal`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'orange',
        details: { product, reason },
      });
    }
  },

  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => {
    const { timelineEvents } = get();
    const newEvent = { ...event, id: timelineEvents.length + 1 };
    // Use the imported utility function to handle the logic
    set({ timelineEvents: addTimelineEventUtils(timelineEvents, newEvent) });
  },
  uploadFile: (values: UploadFileValues) => {
    const { file, name, description, type } = values;
    const { attachments, addTimelineEvent } = get();

    const newAttachment: Attachment = {
      id: generateUniqueId(),
      name: name,
      url: URL.createObjectURL(file.originFileObj),
      uploadedAt: new Date().toISOString(),
      uploadedBy: get().user?.name || 'System',
      description,
      type
    };

    set({ attachments: [...attachments, newAttachment] });

    addTimelineEvent({
      type: 'Attachment',
      title: `Document uploaded: ${newAttachment.name}`,
      description: description || '',
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      color: 'green',
      details: { attachment: newAttachment, },
    });
  },

  removeAttachment: (attachmentId: string) => {
    const { attachments, addTimelineEvent } = get();
    const attachment = attachments.find((a) => a.id === attachmentId);
    if (attachment) {
      set({ attachments: attachments.filter((a) => a.id !== attachmentId) });

      addTimelineEvent({
        type: 'Attachment',
        title: `Deleted file: ${attachment.name}`,
        description: `File "${attachment.name}" was deleted from the deal`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'red',
        details: { attachment },
      });
    }
  },
  // FollowUps actions
  addFollowUp: (values: AddFollowUpValues) => {
    const { followUps, addTimelineEvent } = get();
    const newFollowUp: FollowUP = {
      followUpUUID: values.followUpUUID,
      subject: values.subject,
      scheduledDate: dayjs(values.scheduledDate).format('YYYY-MM-DD HH:mm:ss'),
      contactPersons: values.contactPersons,
      description: values.description,
      status: 'Scheduled',
    };
    set({ followUps: [...followUps, newFollowUp] });

    addTimelineEvent({
      type: 'Follow Up',
      title: `FollowUp created: ${values.subject}`,
      description: `New followUp "${values.subject}" was created`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      color: 'orange',
      details: { followUp: newFollowUp, contactPersons: values.contactPersons },
    });
  },

  updateFollowUp: (followUpUUID: string, values: AddFollowUpValues) => {
    const { followUps, addTimelineEvent } = get();
    const followUpIndex = followUps.findIndex((f) => f.followUpUUID === followUpUUID);
    if (followUpIndex !== -1) {
      const updatedFollowUp: FollowUP = {
        ...followUps[followUpIndex],
        subject: values.subject,
        scheduledDate: dayjs(values.scheduledDate).toISOString(),
        contactPersons: values.contactPersons,
        description: values.description,
      };

      const updatedFollowUps = [...followUps];
      updatedFollowUps[followUpIndex] = updatedFollowUp;
      set({ followUps: updatedFollowUps });

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp updated: ${values.subject}`,
        description: `FollowUp "${values.subject}" was updated`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'orange',
        details: { followUp: updatedFollowUp },
      });
    }
  },

  completeFollowUp: (followUpUUID: string, values: CompleteFollowUpValues) => {
    const { followUps, addTimelineEvent } = get();
    const followUpIndex = followUps.findIndex((f) => f.followUpUUID === followUpUUID);
    if (followUpIndex !== -1) {
      const updatedFollowUp: FollowUP = {
        ...followUps[followUpIndex],
        ...values,
      };

      const updatedFollowUps = [...followUps];
      updatedFollowUps[followUpIndex] = updatedFollowUp;
      set({ followUps: updatedFollowUps });

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp completed: ${updatedFollowUp.subject}`,
        description: `FollowUp completed with outcome: ${values.outcome}`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'green',
        details: { followUp: updatedFollowUp },
      });
    }
  },

  cancelFollowUp: (followUpUUID: string, values: CancelFollowUpValues) => {
    const { followUps, addTimelineEvent } = get();
    const followUpIndex = followUps.findIndex((f) => f.followUpUUID === followUpUUID);
    if (followUpIndex !== -1) {
      const updatedFollowUp: FollowUP = {
        ...followUps[followUpIndex],
        ...values
      };

      const updatedFollowUps = [...followUps];
      updatedFollowUps[followUpIndex] = updatedFollowUp;
      set({ followUps: updatedFollowUps });

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp cancelled: ${updatedFollowUp.subject}`,
        description: `FollowUp cancelled with reason: ${values.cancellationReason}`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'red',
        details: { followUp: updatedFollowUp },
      });
    }
  },

  rescheduleFollowUp: (followUpUUID: string, values: RescheduleFollowUpValues) => {
    const { followUps, addTimelineEvent } = get();
    const followUpIndex = followUps.findIndex((f) => f.followUpUUID === followUpUUID);
    if (followUpIndex !== -1) {
      const currentFollowUp = followUps[followUpIndex];
      const updatedFollowUp: FollowUP = {
        ...currentFollowUp,
        ...values,
        scheduledDate: dayjs(values.scheduledDate).toISOString(),
      };

      const updatedFollowUps = [...followUps];
      updatedFollowUps[followUpIndex] = updatedFollowUp;
      set({ followUps: updatedFollowUps });

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp rescheduled: ${updatedFollowUp.subject}`,
        description: `FollowUp rescheduled to ${GlobalDate(dayjs(values.scheduledDate).toISOString())} at ${dayjs(values.scheduledDate).format('hh:mm A')} - Reason: ${values.nextFollowUpNotes}`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'blue',
        details: { followUp: updatedFollowUp },
      });
    }
  },

  deleteFollowUp: (followUpUUID: string) => {
    const { followUps, addTimelineEvent } = get();
    const followUp = followUps.find((f) => f.followUpUUID === followUpUUID);
    if (followUp) {
      set({ followUps: followUps.filter((f) => f.followUpUUID !== followUpUUID) });

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp deleted: ${followUp.subject}`,
        description: `FollowUp was deleted from the lead`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'red',
        details: { followUp },
      });
    }
  },

  // Calls actions
  logCall: (values: LogCallValues) => {
    const { calls, addTimelineEvent } = get();
    const newCall: CallLog = {
      ...values,
    };

    set({ calls: [newCall,...calls] });

    addTimelineEvent({
      type: 'Call',
      title: `Call logged: ${values.subject}`,
      description: `Call with outcome: ${values.outcome}`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      color: 'blue',
      details: { call: newCall },
    });
  },

  updateCall: (callId: string, values: LogCallValues) => {
    const { calls, addTimelineEvent } = get();
    const callIndex = calls.findIndex((call) => call.callLogUUID === callId);
    if (callIndex !== -1) {
      const updatedCall: CallLog = {
        ...values,
      };

      const updatedCalls = [...calls];
      updatedCalls[callIndex] = updatedCall;
      set({ calls: updatedCalls });

      addTimelineEvent({
        type: 'Call',
        title: `Call updated: ${values.subject}`,
        description: `Call with outcome: ${values.outcome}`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'orange',
        details: { call: updatedCall },
      });
    }
  },

  deleteCall: (callId: string) => {
    const { calls, addTimelineEvent } = get();
    const call = calls.find((c) => c.callLogUUID === callId); // Find the call to get its details for the timeline event
    const updatedCalls = calls.filter((c) => c.callLogUUID !== callId);
    set({ calls: updatedCalls });

    addTimelineEvent({
      type: 'Call',
      title: 'Call deleted',
      description: `Call was deleted from the lead`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      color: 'red',
      details: { call: call }, // Pass the deleted call's details
    });
  },

  // Emails actions
  sendEmail: (values: EmailFormValues) => {
    const { emails, addTimelineEvent } = get();
    // In a real implementation, this would call the API and get the response
    // For now, we create a mock response that matches the Email interface
    const newEmail: Email = {
      emailUUID: generateUniqueId(),
      leadUUID: values.leadUUID,
      subject: values.subject,
      body: values.body,
      recipients: values.recipients,
      ccRecipients: values.ccRecipients,
      bccRecipients: values.bccRecipients,
      attachments: values.attachments,
      sentAt: new Date().toISOString(),
      sentBy: get().user?.name || 'System',
      sentByUUID: get().user?.userUUID || '',
      deliveryStatus: 'sent'
    };
    set({ emails: [...emails, newEmail] });

    addTimelineEvent({
      type: 'Email',
      title: `Email sent: ${values.subject}`,
      description: `Email sent to ${values.recipients.length} recipients`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      color: 'green',
      details: { email: newEmail },
    });
  },

}));

