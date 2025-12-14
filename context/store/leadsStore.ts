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

// Lead Form Data Interface
interface LeadFormData {
  leadName: string;
  summary: string;
  dateAndTime: string;
  leadSource: string;
  contactPerson: string[];
  owner: string[];
  hcoUUID: string;
}


// Type definitions for actions
interface LogCallValues {
  subject: string;
  callStartTime: Dayjs;
  duration: string;
  purpose: string;
  agenda: string;
  reason?: string;
  outcome: 'No Interest' | 'No Response (1 Month Chase)' | 'Require Further Information' |
  'Another Supplier Contract' | 'Non Formulary' | 'Switch Consideration' | 'Approved Switch';
}

interface SendEmailValues {
  subject: string;
  body: string;
}

interface LeadsStore {
  user: any;
  page: number;
  pageSize: number;
  leadUUID: string,
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
  addFollowUp: (values: AddFollowUpValues) => void;
  updateFollowUp: (taskId: number, values: AddFollowUpValues) => void;
  completeFollowUp: (followUpId: number, values: CompleteFollowUpValues) => void;
  cancelFollowUp: (followUpId: number, values: CancelFollowUpValues) => void;
  rescheduleFollowUp: (followUpId: number, values: RescheduleFollowUpValues) => void;
  deleteFollowUp: (followUpId: number) => void;
  // Calls Actions
  calls: CallLog[];
  logCall: (values: LogCallValues) => void;
  updateCall: (callId: number, values: LogCallValues) => void;
  deleteCall: (callId: number) => void;
  // Emails Actions
  emails: Email[];
  sendEmail: (values: SendEmailValues, recipients: string[]) => void;
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
  contactPersons: [],
  hcoUUID: null,
  hcoName: null,

  // Contact Persons
  setContactPersons: (contactPersons: HCOContactPerson[]) => {
    set({ contactPersons });
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
    const { followUps, addTimelineEvent, contactPersons } = get();
    const newFollowUp: FollowUP = {
      id: followUps.length + 1,
      subject: values.subject,
      priority: values.priority,
      scheduledDateTime: dayjs(values.scheduledDateTime).toISOString(),
      contactPersons: values.contactPersons,
      remark: values.remark,
      reminder: values.reminder,
      isCompleted: false,
      isCancelled: false,
    };
    set({ followUps: [...followUps, newFollowUp] });

    const contactPersonNames = values.contactPersons.map(id => {
      const person = contactPersons.find(p => p.hcoContactUUID === id);
      return person ? person.fullName : 'Unknown';
    });

    addTimelineEvent({
      type: 'Follow Up',
      title: `FollowUp created: ${values.subject}`,
      description: `New followUp "${values.subject}" was created`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      color: 'orange',
      details: { followUp: newFollowUp, contactPersonNames },
    });
  },

  updateFollowUp: (followUpId: number, values: AddFollowUpValues) => {
    const { followUps, addTimelineEvent, contactPersons } = get();
    const followUpIndex = followUps.findIndex((f) => f.id === followUpId);
    if (followUpIndex !== -1) {
      const updatedFollowUp: FollowUP = {
        ...followUps[followUpIndex],
        subject: values.subject,
        priority: values.priority,
        scheduledDateTime: dayjs(values.scheduledDateTime).toISOString(),
        contactPersons: values.contactPersons,
        remark: values.remark,
        reminder: values.reminder,
      };

      const updatedFollowUps = [...followUps];
      updatedFollowUps[followUpIndex] = updatedFollowUp;
      set({ followUps: updatedFollowUps });

      const contactPersonNames = values.contactPersons.map(id => {
        const person = contactPersons.find(p => p.hcoContactUUID === id);
        return person ? person.fullName : 'Unknown';
      });

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp updated: ${values.subject}`,
        description: `FollowUp "${values.subject}" was updated`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'orange',
        details: { followUp: updatedFollowUp, contactPersonNames },
      });
    }
  },

  completeFollowUp: (followUpId: number, values: CompleteFollowUpValues) => {
    const { followUps, addTimelineEvent, contactPersons } = get();
    const followUpIndex = followUps.findIndex((f) => f.id === followUpId);
    if (followUpIndex !== -1) {
      const updatedFollowUp: FollowUP = {
        ...followUps[followUpIndex],
        isCompleted: true,
        completedAt: new Date().toISOString(),
        outcome: values.outcome,
      };

      const updatedFollowUps = [...followUps];
      updatedFollowUps[followUpIndex] = updatedFollowUp;
      set({ followUps: updatedFollowUps });

      const contactPersonNames = updatedFollowUp.contactPersons.map(id => {
        const person = contactPersons.find(p => p.hcoContactUUID === id);
        return person ? person.fullName : 'Unknown';
      });

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp completed: ${updatedFollowUp.subject}`,
        description: `FollowUp completed with outcome: ${values.outcome}`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'green',
        details: { followUp: updatedFollowUp, contactPersonNames },
      });
    }
  },

  cancelFollowUp: (followUpId: number, values: CancelFollowUpValues) => {
    const { followUps, addTimelineEvent, contactPersons } = get();
    const followUpIndex = followUps.findIndex((f) => f.id === followUpId);
    if (followUpIndex !== -1) {
      const updatedFollowUp: FollowUP = {
        ...followUps[followUpIndex],
        isCancelled: true,
        cancelledAt: new Date().toISOString(),
        cancelReason: values.cancelReason,
      };

      const updatedFollowUps = [...followUps];
      updatedFollowUps[followUpIndex] = updatedFollowUp;
      set({ followUps: updatedFollowUps });

      const contactPersonNames = updatedFollowUp.contactPersons.map(id => {
        const person = contactPersons.find(p => p.hcoContactUUID === id);
        return person ? person.fullName : 'Unknown';
      });

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp cancelled: ${updatedFollowUp.subject}`,
        description: `FollowUp cancelled with reason: ${values.cancelReason}`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'red',
        details: { followUp: updatedFollowUp, contactPersonNames },
      });
    }
  },

  rescheduleFollowUp: (followUpId: number, values: RescheduleFollowUpValues) => {
    const { followUps, addTimelineEvent, contactPersons } = get();
    const followUpIndex = followUps.findIndex((f) => f.id === followUpId);
    if (followUpIndex !== -1) {
      const currentFollowUp = followUps[followUpIndex];
      const updatedFollowUp: FollowUP = {
        ...currentFollowUp,
        originalScheduledDateTime: currentFollowUp.originalScheduledDateTime || currentFollowUp.scheduledDateTime,
        scheduledDateTime: dayjs(values.scheduledDateTime).toISOString(),
        rescheduledAt: new Date().toISOString(),
        rescheduleReason: values.rescheduleReason,
      };

      const updatedFollowUps = [...followUps];
      updatedFollowUps[followUpIndex] = updatedFollowUp;
      set({ followUps: updatedFollowUps });

      const contactPersonNames = updatedFollowUp.contactPersons.map(id => {
        const person = contactPersons.find(p => p.hcoContactUUID === id);
        return person ? person.fullName : 'Unknown';
      });

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp rescheduled: ${updatedFollowUp.subject}`,
        description: `FollowUp rescheduled to ${GlobalDate(dayjs(values.scheduledDateTime).toISOString())} at ${dayjs(values.scheduledDateTime).format('hh:mm A')} - Reason: ${values.rescheduleReason}`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'blue',
        details: { followUp: updatedFollowUp, contactPersonNames },
      });
    }
  },

  deleteFollowUp: (followUpId: number) => {
    const { followUps, addTimelineEvent, contactPersons } = get();
    const followUp = followUps.find((f) => f.id === followUpId);
    if (followUp) {
      set({ followUps: followUps.filter((f) => f.id !== followUpId) });

      const contactPersonNames = followUp.contactPersons.map(id => {
        const person = contactPersons.find(p => p.hcoContactUUID === id);
        return person ? person.fullName : 'Unknown';
      });

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp deleted: ${followUp.subject}`,
        description: `FollowUp was deleted from the lead`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        color: 'red',
        details: { followUp, contactPersonNames },
      });
    }
  },

  // Calls actions
  logCall: (values: LogCallValues) => {
    const { calls, addTimelineEvent } = get();
    const newCall: CallLog = {
      id: calls.length + 1,
      subject: values.subject,
      callStartTime: dayjs(values.callStartTime, "YYYY-MM-DD hh:mm:ss A").format('YYYY-MM-DD HH:mm:ss'),
      duration: values.duration,
      purpose: values.purpose,
      agenda: values.agenda,
      outcome: values.outcome,
      reason: values.reason,
      loggedBy: get().user?.name || 'System',
    };
    set({ calls: [...calls, newCall] });

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

  updateCall: (callId: number, values: LogCallValues) => {
    const { calls, addTimelineEvent } = get();
    const callIndex = calls.findIndex((call) => call.id === callId);
    if (callIndex !== -1) {
      const updatedCall: CallLog = {
        ...calls[callIndex],
        subject: values.subject,
        callStartTime: dayjs(values.callStartTime, "YYYY-MM-DD hh:mm A").format('YYYY-MM-DD hh:mm:ss'),
        duration: values.duration,
        purpose: values.purpose,
        agenda: values.agenda,
        outcome: values.outcome,
        loggedBy: get().user?.name || 'System',
        reason: values.reason
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

  deleteCall: (callId: number) => {
    const { calls, addTimelineEvent } = get();
    const call = calls.find((c) => c.id === callId); // Find the call to get its details for the timeline event
    const updatedCalls = calls.filter((c) => c.id !== callId);
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
  sendEmail: (values: SendEmailValues, recipients: string[]) => {
    const { emails, addTimelineEvent } = get();
    const newEmail: Email = {
      id: emails.length + 1,
      subject: values.subject,
      body: values.body,
      recipients: recipients,
      sentAt: new Date().toISOString(),
      sentBy: get().user?.name || 'System',
    };
    set({ emails: [...emails, newEmail] });

    addTimelineEvent({
      type: 'Email',
      title: `Email sent: ${values.subject}`,
      description: `Email sent to ${recipients.length} recipients`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      color: 'green',
      details: { email: newEmail },
    });
  },

}));

