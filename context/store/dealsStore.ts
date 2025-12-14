// stores/dealStore.ts

import { create } from 'zustand';
import dayjs, { Dayjs } from 'dayjs';
import {
  Attachment,
  CallLog,
  Email,
  FollowUP,
  Meeting,
  Note,
  Reminder,
  stages,
  Stage,
  STAGE_LABELS,
} from '../../lib/types';
import { addTimelineEvent as addTimelineEventUtil } from '../../app/(main)/deals/utils/timeline';
import { TimelineEvent } from '@/components/shared/TimelineComponent';
import { generateUniqueId } from '../../app/(main)/deals/utils/constants';
import { GlobalDate } from '@/Utils/helpers';
import { Healthcare } from '@/app/(main)/healthcares/lib/types';
import { Product } from './productStore';
import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';

export interface UploadFileValues {
  file: { originFileObj: File; name: string };
  name: string;
  description?: string;
  type: string
}

interface AddMeetingValues {
  meetingTitle: string;
  startDatetime: string;
  endDatetime: string;
  location: string;
  venue: 'in-office' | 'client location' | 'online';
  attendees: string[];
  notes?: string;
  agenda?: string;
  minutes?: string;
}

export interface AddFollowUpValues {
  subject: string;
  scheduledDateTime: string;
  contactPersons: string[];
  remark?: string;
  followUpUUId: string
}

export interface CompleteFollowUpValues {
  outcome: string;
}

export interface CancelFollowUpValues {
  cancelReason: string;
}

export interface RescheduleFollowUpValues {
  scheduledDateTime: Dayjs;
  rescheduleReason: string;
}

interface LogCallValues {
  callLogUUID: string;
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

interface AddNoteValues {
  title: string;
  description: string;
}



export interface ContactPersonReview {
  hcoContactUUID: string;
  fullName: string;
  role?: string;
  rating: number;
  comment: string;
}

export interface stageValues {
  dealStage: stages;
  reason: string;
  lossReason?: string
  proof?: string[]
  contactPersonReviews?: ContactPersonReview[]
}

interface ReminderValues {
  reminderUUID: string,
  notifyDate: Dayjs,
  setReminderTo: string,
  description: string
  sendEmail?: boolean
}
interface DealStore {
  dealUUID: string;
  setDealUUID: (dealUUID: string) => void;
  viewMode: 'grid' | 'table';
  productList: Product[];
  hcoList: Healthcare[];
  page: number;
  hcoDetails: {
    hcoUUID: string
    hcoName: string
  };
  setProductList: (productList: Product[]) => void;
  setHcoDetails: (hcoDetails: { hcoUUID: string; hcoName: string }) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  dealStage: stages;
  setDealStage: (dealStage: stages) => void;
  selectedProducts: Product[];
  setSelectedProducts: (products: Product[]) => void;
  contactPersons: HCOContactPerson[];
  attachments: Attachment[];
  meetings: Meeting[];
  followUps: FollowUP[];
  calls: CallLog[];
  emails: Email[];
  notes: Note[];
  reminders: Reminder[];
  timelineEvents: TimelineEvent[];
  lastUpdated: string | null;
  setViewMode: (mode: 'grid' | 'table') => void;
  setHcoList: (hcoList: Healthcare[]) => void;
  openDealDrawer: boolean;
  setDealDrawer: (open: boolean) => void;
  setPage: (page: number) => void;
  setStage: (values: stageValues) => void;
  // Products Actions
  addProduct: (product: Product) => void;
  removeProduct: (productId: string, reason?: string) => void;

  // Contact Persons
  setContactPersons: (contactPersons: HCOContactPerson[]) => void;

  // Attachments Actions
  uploadFile: (values: UploadFileValues) => void;
  removeAttachment: (attachmentId: string) => void;

  // Meetings Actions
  addMeeting: (values: AddMeetingValues) => void;
  deleteMeeting: (meetingId: string) => void;
  updateMeeting: (meetingId: string, values: Meeting) => void;
  // FollowUps Actions
  addFollowUp: (values: AddFollowUpValues) => void;
  updateFollowUp: (followUpUUId: string, values: AddFollowUpValues) => void;
  completeFollowUp: (followUpUUId: string, values: CompleteFollowUpValues) => void;
  cancelFollowUp: (followUpUUId: string, values: CancelFollowUpValues) => void;
  rescheduleFollowUp: (followUpUUId: string, values: RescheduleFollowUpValues) => void;
  deleteFollowUp: (followUpUUId: string) => void;

  // Calls Actions
  logCall: (values: LogCallValues) => void;
  updateCall: (callId: string, values: LogCallValues) => void;
  deleteCall: (callId: string) => void;
  // Emails Actions
  sendEmail: (values: SendEmailValues, recipients: string[]) => void;

  // Notes Actions
  addNote: (values: AddNoteValues) => void;
  deleteNote: (noteId: string) => void;
  updateNote: (noteId: string, values: AddNoteValues) => void;

  // Reminders Actions
  addReminder: (values: ReminderValues) => void;
  deleteReminder: (reminderId: string) => void;
  updateReminder: (reminderId: string, values: ReminderValues) => void;

  // Timeline Actions
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  setValues: (values: Partial<DealStore>) => void;
  // Recipients Actions
  user: any;
  setUser: (user: any) => void;
}


export const useDealStore = create<DealStore>((set, get,) => ({
  // functional actions
  dealUUID: '',
  setDealUUID: (dealUUID: string) => set({ dealUUID }),
  viewMode: 'grid',
  hcoList: [],
  page: 1,
  dealStage: Stage.DISCUSSION,
  setDealStage: (dealStage: stages) => set({ dealStage }),
  selectedProducts: [],
  contactPersons: [],
  attachments: [],
  meetings: [],
  followUps: [],
  calls: [],
  emails: [],
  notes: [],
  hcoDetails: { hcoUUID: '', hcoName: '' },
  reminders: [],
  timelineEvents: [],
  lastUpdated: null,
  setViewMode: (mode: 'grid' | 'table') => set({ viewMode: mode, page: 1 }),
  setPage: (page: number) => set({ page }),
  openDealDrawer: false,
  setDealDrawer: (open: boolean) => set({ openDealDrawer: open }),
  pageSize: 10,
  setPageSize: (pageSize: number) => set({ pageSize }),
  setHcoList: (hcoList: Healthcare[]) => set({ hcoList }),
  setHcoDetails: (hcoDetails: { hcoUUID: string; hcoName: string }) => set({ hcoDetails }),
  productList: [],
  setProductList: (productList: Product[]) => set({ productList }),
  setValues: (values: Partial<DealStore>) => set(values),
  user: null,
  setUser: (user) => set({ user }),
  // Products actions
  setStage: (values: { dealStage: stages, reason: string, lossReason?: string, contactPersonReviews?: ContactPersonReview[] }) => {
    const { dealStage, addTimelineEvent } = get();
    addTimelineEvent({
      type: 'Stage Change',
      title: `Stage changed from ${STAGE_LABELS[dealStage]} to ${STAGE_LABELS[values.dealStage]}`,
      description: `Stage changed to ${STAGE_LABELS[values.dealStage]}`,
      timestamp: new Date().toISOString(),
      color: 'green',
      user: get().user?.name || 'System',
      userUUID: get().user?.userUUID,
      details: {
        previousStage: dealStage,
        newStage: values.dealStage,
        reason: values.reason,
        lossReason: values.lossReason,
        contactPersonReviews: values.contactPersonReviews
      },
    })
    set({ dealStage: values.dealStage, });
  },
  setSelectedProducts: (products: Product[]) => set({ selectedProducts: products }),
  // Products actions
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
        userUUID: get().user?.userUUID,
        details: { product, reason },
      });
    }
  },

  removeProduct: (productId: string) => {
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
        userUUID: get().user?.userUUID,
        color: 'orange',
        details: { product },
      });
    }
  },


  // Contact Persons
  setContactPersons: (contactPersons: HCOContactPerson[]) => {
    set({ contactPersons });
  },

  // Attachments actions
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
      userUUID: get().user?.userUUID,
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
        userUUID: get().user?.userUUID,
        color: 'red',
        details: { attachment },
      });
    }
  },

  // Meetings actions
  addMeeting: (values: AddMeetingValues) => {
    const { meetings, addTimelineEvent } = get();
    const newMeeting: Meeting = {
      meetingUUID: (meetings.length + 1).toString(),
      meetingTitle: values.meetingTitle,
      startDatetime: dayjs(values.startDatetime, 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD hh:mm:ss'),
      endDatetime: dayjs(values.endDatetime, 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD hh:mm:ss'),
      location: values.location,
      venue: values.venue,
      notes: values.notes,
      attendeesUUID: values.attendees as any,
      agenda: values.agenda || '',
      minutes: values.minutes || '',
      meetingStatus: 'scheduled',
      createdBy: get().user?.name || 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: get().user?.name || 'System',
      dealUUID: get().dealUUID,
    };
    set({ meetings: [...meetings, newMeeting] });

    addTimelineEvent({
      type: 'Meeting',
      title: 'Meeting added',
      description: `Meeting scheduled for ${dayjs(newMeeting.startDatetime).format('MMM D, YYYY')}`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      userUUID: get().user?.userUUID,
      color: 'purple',
      details: { ...newMeeting },
    });
  },
  updateMeeting: (meetingId: string, values: Partial<Meeting>) => {
    const { meetings, addTimelineEvent } = get();
    const meetingIndex = meetings.findIndex((m) => m.meetingUUID === meetingId);
    if (meetingIndex !== -1) {
      const updatedMeeting: Meeting = {
        ...meetings[meetingIndex],
        ...values,
        updatedAt: new Date().toISOString(),
        updatedBy: get().user?.name || 'System',
      };
      const updatedMeetings = [...meetings];
      updatedMeetings[meetingIndex] = updatedMeeting;
      set({ meetings: updatedMeetings });

      addTimelineEvent({
        type: 'Meeting',
        title: 'Meeting updated',
        description: "Meeting was updated in the deal",
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        userUUID: get().user?.userUUID,
        color: 'orange',
        details: { ...updatedMeeting },
      });
    }
  },
  deleteMeeting: (meetingId: string) => {
    const { meetings, addTimelineEvent } = get();
    const meeting = meetings.find((m) => m.meetingUUID === meetingId);
    if (meeting) {
      set({ meetings: meetings.filter((m) => m.meetingUUID !== meetingId) });

      addTimelineEvent({
        type: 'Meeting',
        title: 'Meeting deleted',
        description: `Meeting ${dayjs(meeting.startDatetime).format('MMM D, YYYY')} was deleted from the deal`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        userUUID: get().user?.userUUID,
        color: 'red',
        details: { ...meeting },
      });
    }
  },
  // FollowUps actions
  addFollowUp: (values: AddFollowUpValues) => {
    const { followUps, addTimelineEvent } = get();
    const newFollowUp: FollowUP = {
      followUpUUId: generateUniqueId(),
      subject: values.subject,
      scheduledDateTime: dayjs(values.scheduledDateTime).toISOString(),
      contactPersons: values.contactPersons,
      remark: values.remark,
      isCompleted: false,
      isCancelled: false,
    };
    set({ followUps: [...followUps, newFollowUp] });

    addTimelineEvent({
      type: 'Follow Up',
      title: `FollowUp created: ${values.subject}`,
      description: `New followUp "${values.subject}" was created`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      userUUID: get().user?.userUUID,
      color: 'orange',
      details: { followUp: newFollowUp },
    });
  },

  updateFollowUp: (followUpUUId: string, values: AddFollowUpValues) => {
    const { followUps, addTimelineEvent } = get();
    const followUpIndex = followUps.findIndex((f) => f.followUpUUId === followUpUUId);
    if (followUpIndex !== -1) {
      const updatedFollowUp: FollowUP = {
        ...followUps[followUpIndex],
        subject: values.subject,
        scheduledDateTime: dayjs(values.scheduledDateTime).toISOString(),
        contactPersons: values.contactPersons,
        remark: values.remark,
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
        userUUID: get().user?.userUUID,
        color: 'orange',
        details: { followUp: updatedFollowUp },
      });
    }
  },

  completeFollowUp: (followUpUUId: string, values: CompleteFollowUpValues) => {
    const { followUps, addTimelineEvent } = get();
    const followUpIndex = followUps.findIndex((f) => f.followUpUUId === followUpUUId);
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

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp completed: ${updatedFollowUp.subject}`,
        description: `FollowUp completed with outcome: ${values.outcome}`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        userUUID: get().user?.userUUID,
        color: 'green',
        details: { followUp: updatedFollowUp },
      });
    }
  },

  cancelFollowUp: (followUpUUId: string, values: CancelFollowUpValues) => {
    const { followUps, addTimelineEvent } = get();
    const followUpIndex = followUps.findIndex((f) => f.followUpUUId === followUpUUId);
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

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp cancelled: ${updatedFollowUp.subject}`,
        description: `FollowUp cancelled with reason: ${values.cancelReason}`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        userUUID: get().user?.userUUID,
        color: 'red',
        details: { followUp: updatedFollowUp },
      });
    }
  },

  rescheduleFollowUp: (followUpId: string, values: RescheduleFollowUpValues) => {
    const { followUps, addTimelineEvent } = get();
    const followUpIndex = followUps.findIndex((f) => f.followUpUUId === followUpId);
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

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp rescheduled: ${updatedFollowUp.subject}`,
        description: `FollowUp rescheduled to ${GlobalDate(dayjs(values.scheduledDateTime).toISOString())} at ${dayjs(values.scheduledDateTime).format('hh:mm A')} - Reason: ${values.rescheduleReason}`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        userUUID: get().user?.userUUID,
        color: 'blue',
        details: { followUp: updatedFollowUp },
      });
    }
  },

  deleteFollowUp: (followUpId: string) => {
    const { followUps, addTimelineEvent } = get();
    const followUp = followUps.find((f) => f.followUpUUId === followUpId);
    if (followUp) {
      set({ followUps: followUps.filter((f) => f.followUpUUId !== followUpId) });

      addTimelineEvent({
        type: 'Follow Up',
        title: `FollowUp deleted: ${followUp.subject}`,
        description: `FollowUp was deleted from the deal`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        userUUID: get().user?.userUUID,
        color: 'red',
        details: { followUp },
      });
    }
  },

  // Calls actions
  logCall: (values: LogCallValues) => {
    const { calls, addTimelineEvent } = get();
    const newCall: CallLog = {
      callLogUUID: generateUniqueId(),
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
      userUUID: get().user?.userUUID,
      color: 'blue',
      details: { call: newCall },
    });
  },
  updateCall: (callId: string, values: LogCallValues) => {
    const { calls, addTimelineEvent } = get();
    const callIndex = calls.findIndex((call) => call.callLogUUID === callId);
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
        userUUID: get().user?.userUUID,
        color: 'orange',
        details: { call: updatedCall },
      });
    }
  },
  deleteCall: (callId: string) => {
    const { calls, addTimelineEvent } = get();
    const updatedCalls = calls.filter((call) => call.callLogUUID !== callId);
    set({ calls: updatedCalls });

    addTimelineEvent({
      type: 'Call',
      title: 'Call deleted',
      description: `Call was deleted from the deal`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      userUUID: get().user?.userUUID,
      color: 'red',
      details: { call: calls.find((call) => call.callLogUUID === callId) },
    });
  },

  // Emails actions
  sendEmail: (values: SendEmailValues, recipients: string[]) => {
    const { emails, addTimelineEvent } = get();
    const newEmail: Email = {
      emailUUID: generateUniqueId(),
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
      userUUID: get().user?.userUUID,
      color: 'green',
      details: { email: newEmail },
    });
  },

  // Notes actions
  addNote: (values: AddNoteValues) => {
    const { notes, addTimelineEvent } = get();
    const newNote: Note = {
      noteUUID: generateUniqueId(),
      title: values.title,
      description: values.description,
      createdAt: new Date().toISOString(),
      createdBy: get().user?.name || 'System',
    };
    set({ notes: [...notes, newNote] });

    addTimelineEvent({
      type: 'Note',
      title: `Note added: ${values.title}`,
      description: `New note added to the deal`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      userUUID: get().user?.userUUID,
      color: 'gray',
      details: { note: newNote },
    });
  },
  deleteNote: (noteId: string) => {
    const { notes, addTimelineEvent } = get();
    const updatedNotes = notes.filter((note) => note.noteUUID !== noteId);
    set({ notes: updatedNotes });

    addTimelineEvent({
      type: 'Note',
      title: 'Note deleted',
      description: `Note was deleted from the deal`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      userUUID: get().user?.userUUID,
      color: 'red',
      details: { note: notes.find((note) => note.noteUUID === noteId) },
    });
  },
  updateNote: (noteId: string, values: AddNoteValues) => {
    const { notes, addTimelineEvent } = get();
    const noteIndex = notes.findIndex((note) => note.noteUUID === noteId);
    if (noteIndex !== -1) {
      const updatedNote: Note = {
        ...notes[noteIndex],
        title: values.title,
        description: values.description,
        createdAt: new Date().toISOString(),
        createdBy: get().user?.name || 'System',
      };

      const updatedNotes = [...notes];
      updatedNotes[noteIndex] = updatedNote;
      set({ notes: updatedNotes });

      addTimelineEvent({
        type: 'Note',
        title: `Note updated: ${values.title}`,
        description: `Note was updated in the deal`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        userUUID: get().user?.userUUID,
        color: 'orange',
        details: { note: updatedNote },
      });
    }
  },
  addReminder: (values: ReminderValues) => {
    const { reminders, addTimelineEvent } = get();
    const newReminder: Reminder = {
      reminderUUID: values.reminderUUID,
      description: values.description,
      notifyDate: dayjs(values.notifyDate, 'YYYY-MM-DD hh:mm A').toISOString(),
      setReminderTo: values.setReminderTo,
      sendEmail: values.sendEmail,
      createdAt: new Date().toISOString(),
      createdBy: get().user?.name || 'System',
    };
    set({ reminders: [...reminders, newReminder] });

    addTimelineEvent({
      type: 'Reminder',
      title: `Reminder added for: ${values.setReminderTo}`,
      description: `New reminder was added to the deal`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      userUUID: get().user?.userUUID,
      color: 'blue',
      details: { reminder: newReminder },
    });
  },
  deleteReminder: (reminderId: string) => {
    const { reminders, addTimelineEvent } = get();
    const updatedReminders = reminders.filter((reminder) => reminder.reminderUUID !== reminderId);
    set({ reminders: updatedReminders });

    addTimelineEvent({
      type: 'Reminder',
      title: 'Reminder deleted',
      description: `Reminder was deleted from the deal`,
      timestamp: new Date().toISOString(),
      user: get().user?.name || 'System',
      userUUID: get().user?.userUUID,
      color: 'red',
      details: { reminder: reminders.find((reminder) => reminder.reminderUUID === reminderId) },
    });

  },
  updateReminder(reminderId, values: ReminderValues) {
    const { reminders, addTimelineEvent } = get();
    const reminderIndex = reminders.findIndex((reminder) => reminder.reminderUUID === reminderId);
    if (reminderIndex !== -1) {
      const updatedReminder: Reminder = {
        ...reminders[reminderIndex],
        description: values.description,
        notifyDate: dayjs(values.notifyDate, 'YYYY-MM-DD hh:mm A').toISOString(),
        setReminderTo: values.setReminderTo,
        sendEmail: values.sendEmail,
        createdAt: new Date().toISOString(),
        createdBy: get().user?.name || 'System',
      };

      const updatedReminders = [...reminders];
      updatedReminders[reminderIndex] = updatedReminder;
      set({ reminders: updatedReminders });
      addTimelineEvent({
        type: 'Reminder',
        title: `Reminder updated for: ${values.setReminderTo}`,
        description: `Reminder was updated in the deal`,
        timestamp: new Date().toISOString(),
        user: get().user?.name || 'System',
        userUUID: get().user?.userUUID,
        color: 'orange',
        details: { ...updatedReminder },
      });
    }
  },

  // Timeline actions
  // Fixed signature to match the interface definition
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => {
    const { timelineEvents } = get();
    const newEvent = { ...event, id: timelineEvents.length + 1 };
    // Use the imported utility function to handle the logic
    set({ timelineEvents: addTimelineEventUtil(timelineEvents, newEvent) });
  },


}
));

