'use client';
import CustomDatePicker from '@/components/CustomDatePicker/CustomDatePicker';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import InputBox from '@/components/Input/Input';
import Label from '@/components/Label/Label';
import { Button, Card, Col, Dropdown, Input, MenuProps, Modal, Popover, Row, Select, Space, Tag, Tooltip } from 'antd';
import clsx from 'clsx';
import dayjs, { Dayjs } from 'dayjs';
import { Field, Form, Formik } from 'formik';
import debounce from 'lodash/debounce';
import { ArrowUpDown, Calendar, Clock, Edit, FileText, MapPin, MoreVertical, Plus, RefreshCw, Search, Trash2, Users, XCircle } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { useDealStore } from '@/context/store/dealsStore';
import { Meeting } from '@/lib/types';
import ModalWrapper from '@/components/Modal/Modal';
import ContactOptionsRender from '@/components/shared/ContactOptionsRender';
import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry';
import { useApi } from '@/hooks/useAPI';
import { APIPATH } from '@/shared/constants/url';
import { toast } from 'react-toastify';
import { useLoading } from '@/hooks/useLoading';
import { useDropDowns } from '@/context/store/optimizedSelectors';

// Constants
const VENUE_OPTIONS = [
  {
    label: 'In Office',
    value: '019b07d7-ae28-7333-a440-1dfa2a98d89e',
    locationLabel: 'Room/Office',
    locationPlaceholder: 'room or office details'
  },
  {
    label: 'Client Location',
    value: '019b07d7-ae28-7ed6-9d48-9d52112ea6ed',
    locationLabel: 'Client Address',
    locationPlaceholder: 'client\'s address'
  },
  {
    label: 'Online',
    value: '019b07d7-ae28-7010-a122-b74d1efe5f81',
    locationLabel: 'Meeting Link',
    locationPlaceholder: 'meeting link (Zoom, Teams, etc.)'
  }
];

const VENUE_DISPLAY_MAP: Record<string, string> = {
  '019b07d7-ae28-7333-a440-1dfa2a98d89e': 'In Office',
  '019b07d7-ae28-7ed6-9d48-9d52112ea6ed': 'Client Location',
  '019b07d7-ae28-7010-a122-b74d1efe5f81': 'Online'
};

// Types
interface MeetingFormValues {
  meetingTitle: string;
  startDatetime: Dayjs;
  endDatetime: Dayjs;
  location: string;
  venue: string;
  attendees: string[];
  notes?: string;
  dealUUID: string;
}

// Utility functions
const STATUS_STYLES = {
  ended: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    label: 'Ended'
  },
  inProgress: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    label: 'In Progress'
  },
  upcoming: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'Upcoming'
  }
} as const;

const getMeetingStatus = (startDatetime: string, endDatetime?: string) => {
  if (!endDatetime) return STATUS_STYLES.upcoming;

  const now = Date.now();
  const start = new Date(startDatetime).getTime();
  const end = new Date(endDatetime).getTime();

  if (now > end) return STATUS_STYLES.ended;
  if (now >= start && now <= end) return STATUS_STYLES.inProgress;
  return STATUS_STYLES.upcoming;
};

// Helper function to determine if actions can be performed on a meeting
const canPerformActions = (meeting: Meeting) => {
  // Cannot perform edit/reschedule if meeting is Cancelled or Completed
  if (meeting.meetingStatus === 'Cancelled' || meeting.meetingStatus === 'Completed') {
    return false;
  }
  const now = dayjs();
  const endTime = dayjs(meeting.endDatetime);
  return now.isBefore(endTime);
};

// Helper function to format meeting date with custom labels
const formatMeetingDate = (datetime: string) => {
  const meetingDate = dayjs(datetime);
  const today = dayjs();
  const tomorrow = dayjs().add(1, 'day');

  if (meetingDate.isSame(today, 'day')) {
    return 'Today';
  } else if (meetingDate.isSame(tomorrow, 'day')) {
    return 'Tomorrow';
  } else {
    return meetingDate.fromNow();
  }
};

// Helper function to calculate meeting duration
const getMeetingDuration = (startDatetime: string, endDatetime: string) => {
  const start = dayjs(startDatetime);
  const end = dayjs(endDatetime);
  const durationInMinutes = end.diff(start, 'minute');
  
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${minutes} min${minutes > 1 ? 's' : ''}`;
  }
};

const getLocationFieldProps = (venueId: string) => {
  const venue = VENUE_OPTIONS.find(v => v.value === venueId);
  return venue
    ? { label: venue.locationLabel, placeholder: venue.locationPlaceholder }
    : { label: 'Location', placeholder: 'location' };
};

const getDisabledTimeConfig = (
  currentHour: number,
  currentMinute: number,
  compareHour: number,
  compareMinute: number,
  isBefore: boolean
) => ({
  disabledHours: () =>
    Array.from({ length: 24 }, (_, i) => i).filter(h =>
      isBefore ? h < compareHour : h > compareHour
    ),
  disabledMinutes: (hour: number) => {
    if (hour === compareHour) {
      return Array.from({ length: 60 }, (_, i) => i).filter(m =>
        isBefore ? m < compareMinute : m > compareMinute
      );
    }
    return isBefore && hour < compareHour
      ? Array.from({ length: 60 }, (_, i) => i)
      : [];
  }
});

const getDisabledTime = (
  current: Dayjs | null,
  baseTime: Dayjs,
  compareTime: Dayjs | null,
  isBefore: boolean
) => {
  if (!current) return {};

  const isSameDay = current.isSame(baseTime, 'day');
  const isSameDayAsCompare = compareTime && current.isSame(compareTime, 'day');

  if (!isSameDay && !isSameDayAsCompare) return {};

  const baseHour = baseTime.hour();
  const baseMinute = baseTime.minute();
  const compareHour = compareTime?.hour() ?? baseHour;
  const compareMinute = compareTime?.minute() ?? baseMinute;

  // Use the more restrictive time constraint
  const effectiveHour = isBefore
    ? Math.max(baseHour, compareHour)
    : Math.min(baseHour, compareHour);
  const effectiveMinute = effectiveHour === baseHour && effectiveHour === compareHour
    ? (isBefore ? Math.max(baseMinute, compareMinute) : Math.min(baseMinute, compareMinute))
    : (effectiveHour === compareHour ? compareMinute : baseMinute);

  return getDisabledTimeConfig(baseHour, baseMinute, effectiveHour, effectiveMinute, isBefore);
};

// Validation Schema
const createValidationSchema = () => Yup.object().shape({
  meetingTitle: Yup.string().trim().required('Meeting title is required'),
  startDatetime: Yup.mixed()
    .required('Start date and time is required')
    .test('is-valid-date', 'Invalid date', (value) => dayjs(value as any).isValid()),
  endDatetime: Yup.mixed()
    .required('End date and time is required')
    .test('is-valid-date', 'Invalid date', (value) => dayjs(value as any).isValid())
    .test('is-after-start', 'End time must be after start time', function (value) {
      const { startDatetime } = this.parent;
      if (!value || !startDatetime) return true;
      return dayjs(value as any).isAfter(dayjs(startDatetime as any));
    }),
  location: Yup.string().trim().required('Location is required'),
  venue: Yup.string().required('Venue is required'),
  attendees: Yup.array().min(1, 'At least one attendee is required'),
  notes: Yup.string().trim()
});

// EmptyState Component
const EmptyState = memo(({
  searchQuery,
  onClearSearch,
  onScheduleMeeting
}: {
  searchQuery: string;
  onClearSearch: () => void;
  onScheduleMeeting: () => void;
}) => {
  const isSearchState = Boolean(searchQuery);

  return (
    <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl transition-all duration-300">
      <div className="flex flex-col items-center justify-center">
        <div className={`transition-all duration-300 ${isSearchState ? 'scale-90 opacity-70' : 'scale-100 opacity-100'}`}>
          <div className="relative">
            {isSearchState ? (
              <Search className="w-12 h-12 mx-auto text-gray-400" />
            ) : (
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
            )}
            <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${isSearchState ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
          </div>
        </div>

        <div className="mt-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {isSearchState ? 'No Meetings Found' : 'No Meetings Scheduled'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {isSearchState
              ? `We couldn't find any meetings matching "${searchQuery}".`
              : 'Schedule your first meeting to keep track of important discussions.'
            }
          </p>
        </div>

        <Button
          type={isSearchState ? 'default' : 'primary'}
          icon={!isSearchState && <Plus size={16} />}
          onClick={isSearchState ? onClearSearch : onScheduleMeeting}
          className="h-10 px-5 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
        >
          {isSearchState ? 'Clear Search' : 'Schedule First Meeting'}
        </Button>
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// MOM Popover Content Component
const MomPopoverContent = memo(({
  initialValue,
  onSave,
  onCancel
}: {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="w-96">
      <div className="mb-2 font-medium">Minutes of Meeting</div>
      <Input.TextArea
        rows={6}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter minutes of meeting"
      />
      <div className="mt-3 flex justify-end gap-2">
        <Button size="small" onClick={onCancel}>Cancel</Button>
        <Button size="small" type="primary" onClick={() => onSave(value)}>Save</Button>
      </div>
    </div>
  );
});

MomPopoverContent.displayName = 'MomPopoverContent';

// MeetingCard Component
const MeetingCard = memo<{
  meeting: Meeting;
  onEdit: (meetingUUID: string) => void;
  onDelete: (id: string) => void;
  onCancel: (meeting: Meeting) => void;
  onReschedule: (meeting: Meeting) => void;
  onComplete: (meeting: Meeting) => void;
  onUpdateMom: (id: string, mom: string) => void;
}>(({ meeting, onEdit, onDelete, onCancel, onReschedule, onComplete, onUpdateMom }) => {
  const [momPopoverVisible, setMomPopoverVisible] = useState(false);

  const statusColor = useMemo(
    () => getMeetingStatus(meeting.startDatetime, meeting.endDatetime),
    [meeting.startDatetime, meeting.endDatetime]
  );

  const venueName = VENUE_DISPLAY_MAP[meeting.venue] || meeting.venue;
  const attendeeCount = meeting.attendees?.length || 0;
  const canEdit = canPerformActions(meeting);

  // Build menu items for dropdown
  const menuItems: MenuProps['items'] = [];
  const canComplete = meeting.meetingStatus !== 'Completed' && meeting.meetingStatus !== 'Cancelled';
  const isOverdue = meeting.meetingStatus === 'Overdue';

  // For overdue meetings, only allow cancel (complete is shown as button)
  if (isOverdue) {
    menuItems.push({
      key: 'cancel',
      label: 'Cancel',
      icon: <XCircle size={14} />,
      onClick: () => onCancel(meeting),
    });
  } else if (canEdit) {
    // Normal edit/reschedule/delete for upcoming meetings
    menuItems.push({
      key: 'edit',
      label: 'Edit',
      icon: <Edit size={14} />,
      onClick: () => onEdit(meeting.meetingUUID),
    });

    menuItems.push({
      key: 'reschedule',
      label: 'Reschedule',
      icon: <Calendar size={14} />,
      onClick: () => onReschedule(meeting),
    });

    menuItems.push({
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => onDelete(meeting.meetingUUID),
    });

    // Add cancel option for upcoming meetings
    if (meeting.meetingStatus !== 'Cancelled') {
      menuItems.push({ type: 'divider', key: 'divider' });
      menuItems.push({
        key: 'cancel',
        label: 'Cancel',
        icon: <XCircle size={14} />,
        onClick: () => onCancel(meeting),
      });
    }
  }

  // Get status display with tooltips for cancelled/rescheduled/completed
  const getStatusDisplay = () => {
    // Use backend status if available
    if (meeting.meetingStatus === 'Completed') {
      return (
        <Tooltip title={meeting.outcome ? `Outcome: ${meeting.outcome}` : 'Completed'}>
          <div className={clsx(
            "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold",
            "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          )}>
            <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
            <span className="leading-none">Completed</span>
          </div>
        </Tooltip>
      );
    }

    if (meeting.meetingStatus === 'Cancelled') {
      return (
        <Tooltip title={meeting.cancellationReason ? `Reason: ${meeting.cancellationReason}` : 'Cancelled'}>
          <div className={clsx(
            "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold",
            "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          )}>
            <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
            <span className="leading-none">Cancelled</span>
          </div>
        </Tooltip>
      );
    }
    
    if (meeting.meetingStatus === 'Rescheduled') {
      return (
        <Tooltip title={meeting.rescheduleReason ? `Reason: ${meeting.rescheduleReason}` : 'Rescheduled'}>
          <div className={clsx(
            "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold",
            "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          )}>
            <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
            <span className="leading-none">Rescheduled</span>
          </div>
        </Tooltip>
      );
    }

    if (meeting.meetingStatus === 'Overdue') {
      return (
        <div className={clsx(
          "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold",
          "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        )}>
          <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
          <span className="leading-none">Overdue</span>
        </div>
      );
    }

    // Default status based on time (Scheduled, In Progress, Ended)
    return (
      <div className={clsx(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold",
        statusColor.bg,
        statusColor.text
      )}>
        <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
        <span className="leading-none">{meeting.meetingStatus || statusColor.label}</span>
      </div>
    );
  };

  return (
    <Card
      hoverable
      size="small"
      variant="borderless"
      className={clsx(
        "!h-full overflow-hidden rounded-xl transition-all duration-300",
        "border border-slate-200 dark:border-slate-800",
        "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800"
      )}
    >
      <div className="flex flex-col h-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          {getStatusDisplay()}

          <div className="flex gap-1">
            {canComplete ? (
              <Space.Compact>
                <Button
                  type="primary"
                  color="green"
                  variant="outlined"
                  size="small"
                  onClick={() => onComplete(meeting)}
                >
                  Complete
                </Button>
                {menuItems.length > 0 && (
                  <Dropdown
                    menu={{ items: menuItems }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="primary"
                      color="green"
                      variant="outlined"
                      size="small"
                      icon={<MoreVertical size={14} />}
                    />
                  </Dropdown>
                )}
              </Space.Compact>
            ) : menuItems.length > 0 ? (
              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  size='small'
                  type="text"
                  icon={<MoreVertical size={14} className="text-slate-500" />}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                />
              </Dropdown>
            ) : (
             null
            )}
          </div>
        </div>

        {/* Title & Location */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
            {meeting.meetingTitle || "Untitled Meeting"}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {meeting.location || "Not specified"} ({venueName})
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
          <Tooltip title={`${dayjs(meeting.startDatetime).format('D MMM, YYYY')} • Duration: ${getMeetingDuration(meeting.startDatetime, meeting.endDatetime)}`}>
            <div className="flex items-center gap-1 cursor-help">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {formatMeetingDate(meeting.startDatetime)}
              </span>
            </div>
          </Tooltip>

          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">
              {dayjs(meeting.startDatetime).format("hh:mm A")} - {dayjs(meeting.endDatetime).format("hh:mm A")}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 flex-shrink-0" />
            <Tooltip title={meeting.attendees.map((attendee) => attendee.fullName).join(", ")}>
            <span className="truncate">
              {attendeeCount} {attendeeCount === 1 ? 'attendee' : 'attendees'}
            </span>
            </Tooltip>
          </div>
        </div>

        {meeting.notes && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notes:</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{meeting.notes}</div>
          </div>
        )}
      </div>
    </Card>
  );
});

MeetingCard.displayName = 'MeetingCard';

// Main Component
const MeetingManager = () => {
  const [open, setOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>(['Scheduled', 'Overdue', 'Rescheduled', 'Cancelled', 'Completed']);
  const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc' | null>('desc'); // Default: newest first
  
  // Action modals state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useLoading();
  const { outcomes } = useDropDowns();

  const debouncedSetQuery = useRef(
    debounce((value: string) => setDebouncedQuery(value), 300)
  ).current;

  const { meetings, addMeeting, updateMeeting, deleteMeeting, contactPersons, dealUUID } = useDealStore();
  
  // API instance
  const API = useApi();

  useEffect(() => {
    return () => debouncedSetQuery.cancel();
  }, [debouncedSetQuery]);

  // Memoize contact options to prevent recreation
  const contactOptions = useMemo(() =>
    contactPersons.map((contact) => ({
      label: contact.fullName,
      value: contact.hcoContactUUID,
      contact
    })),
    [contactPersons]
  );

  const filteredMeetings = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    
    let filtered = meetings;
    
    // Apply search filter
    if (q) {
      filtered = filtered.filter((meeting: Meeting) => {
        const searchStr = [
          meeting.meetingTitle,
          meeting.createdBy,
          meeting.location,
          VENUE_DISPLAY_MAP[meeting.venue],
          dayjs(meeting.startDatetime).format('D MMM, YYYY hh:mm A')
        ].filter(Boolean).join(' ').toLowerCase();

        return searchStr.includes(q);
      });
    }
    
    // Apply status filter
    if (statusFilters.length > 0) {
      filtered = filtered.filter((meeting: Meeting) => {
        const status = meeting.meetingStatus || getMeetingStatus(meeting.startDatetime, meeting.endDatetime).label;
        return statusFilters.includes(status);
      });
    }
    
    // Apply date sorting
    if (dateSortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = dayjs(a.startDatetime);
        const dateB = dayjs(b.startDatetime);
        
        if (dateSortOrder === 'asc') {
          return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
        } else {
          return dateB.isBefore(dateA) ? -1 : dateB.isAfter(dateA) ? 1 : 0;
        }
      });
    }
    
    return filtered;
  }, [meetings, debouncedQuery, statusFilters, dateSortOrder]);

  const initialFormValues: MeetingFormValues = useMemo(() =>
    editingMeeting ? {
      meetingTitle: editingMeeting.meetingTitle,
      startDatetime: dayjs(editingMeeting.startDatetime),
      endDatetime: dayjs(editingMeeting.endDatetime),
      location: editingMeeting.location,
      venue: editingMeeting.venue,
      attendees: editingMeeting.attendees.map(contact => contact.hcoContactUUID),
      notes: editingMeeting.notes,
      dealUUID: editingMeeting.dealUUID
    } : {
      meetingTitle: '',
      startDatetime: dayjs(),
      endDatetime: dayjs(),
      location: '',
      venue: '',
      attendees: [],
      notes: '',
      dealUUID: dealUUID
    },
    [editingMeeting, dealUUID]
  );

  const handleSubmit = useCallback(async (values: MeetingFormValues, { setSubmitting }: any) => {
    try {
      setLoading(true);
      
      // Format the values for API
      const formattedValues = {
        meetingTitle: values.meetingTitle,
        startDatetime: dayjs(values.startDatetime).format("YYYY-MM-DD HH:mm:ss"),
        endDatetime: dayjs(values.endDatetime).format("YYYY-MM-DD HH:mm:ss"),
        location: values.location,
        venue: values.venue,
        attendees: values.attendees,
        notes: values.notes || "",
        dealUUID: dealUUID,
      };

      if (editingMeeting) {
        // Update existing meeting
        const response = await API.put(
          `${APIPATH.DEAL.TABS.MEETING.UPDATEMEETING}${editingMeeting.meetingUUID}`,
          formattedValues
        );
        
        if (response) {
          updateMeeting(editingMeeting.meetingUUID, response.data);
          toast.success("Meeting updated successfully");
          setOpen(false);
          setEditingMeeting(null);
        }
      } else {
        // Create new meeting
        const response = await API.post(
          APIPATH.DEAL.TABS.MEETING.CREATEMEETING,
          formattedValues
        );
        
        if (response) {
          addMeeting(response.data);
          toast.success("Meeting scheduled successfully");
          setOpen(false);
        }
      }
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast.error(editingMeeting ? "Failed to update meeting" : "Failed to schedule meeting");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }, [editingMeeting, updateMeeting, addMeeting, dealUUID, API, setLoading]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSetQuery(value);
  }, [debouncedSetQuery]);

  const handleClearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    debouncedSetQuery.cancel();
  }, [debouncedSetQuery]);

  const handleEdit = useCallback((meetingUUID: string) => {
    const meeting = meetings.find(m => m.meetingUUID === meetingUUID);
    if (meeting) {
      setEditingMeeting(meeting);
      setOpen(true);
    }
  }, [meetings]);

  const handleDeleteClick = useCallback((id: string) => {
    setMeetingToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (meetingToDelete) {
      deleteMeeting(meetingToDelete);
      setDeleteModalOpen(false);
      setMeetingToDelete(null);
    }
  }, [meetingToDelete, deleteMeeting]);

  const handleUpdateMom = useCallback((id: string, mom: string) => {
    updateMeeting(id, { minutes: mom } as any);
  }, [updateMeeting]);

  const handleCancelClick = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setCancelModalOpen(true);
  }, []);

  const handleRescheduleClick = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setRescheduleModalOpen(true);
  }, []);

  const handleCompleteClick = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setCompleteModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setEditingMeeting(null);
  }, []);

  const openNewMeetingModal = useCallback(() => {
    setEditingMeeting(null);
    setOpen(true);
  }, []);

  const validationSchema = useMemo(() => createValidationSchema(), []);

  // Toggle date sort order
  const toggleDateSort = useCallback(() => {
    setDateSortOrder(prev => {
      if (prev === 'desc') return 'asc';
      if (prev === 'asc') return null;
      return 'desc';
    });
  }, []);

  // Get sort icon rotation
  const getSortIconClass = () => {
    if (dateSortOrder === 'asc') return 'rotate-180';
    if (dateSortOrder === 'desc') return '';
    return 'opacity-50';
  };

  return (
    <>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-0">Meeting History</h3>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={openNewMeetingModal}
            className="flex items-center gap-1"
          >
            Schedule Meeting
          </Button>
        </div>

        {meetings.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Input
                placeholder="Search meetings..."
                prefix={<Search size={16} className="text-gray-400" />}
                onChange={handleSearchChange}
                value={query}
                className="w-full max-w-md"
                allowClear
                onClear={handleClearSearch}
              />

              <div className='flex items-center gap-3'>
              {/* Date Sort Button */}
              <Tooltip title={dateSortOrder === 'desc' ? 'Sorted: Newest First' : dateSortOrder === 'asc' ? 'Sorted: Oldest First' : 'Click to Sort by Date'}>
                <Button
                  icon={<ArrowUpDown size={16} className={`transition-transform ${getSortIconClass()}`} />}
                  onClick={toggleDateSort}
                  type={dateSortOrder ? 'primary' : 'default'}
                >
                  {dateSortOrder === 'desc' ? 'Newest First' : dateSortOrder === 'asc' ? 'Oldest First' : 'Sort by Date'}
                </Button>
              </Tooltip>

              {/* Status Filter Select */}
              <Select
                mode="multiple"
                placeholder="Filter by Status"
                value={statusFilters}
                onChange={setStatusFilters}
                maxTagCount="responsive"
                className='w-100'
                options={[
                  { value: 'Scheduled', label: 'Scheduled' },
                  { value: 'Overdue', label: 'Overdue' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Cancelled', label: 'Cancelled' },
                  { value: 'Rescheduled', label: 'Rescheduled' },
                ]}
                allowClear
              />
            </div>
            </div>
          </div>
        )}

        {filteredMeetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeetings.map((meeting: Meeting) => (
              <MeetingCard
                key={meeting.meetingUUID}
                meeting={meeting}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onCancel={handleCancelClick}
                onReschedule={handleRescheduleClick}
                onComplete={handleCompleteClick}
                onUpdateMom={handleUpdateMom}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            searchQuery={debouncedQuery || query}
            onClearSearch={handleClearSearch}
            onScheduleMeeting={openNewMeetingModal}
          />
        )}
      </div>

      {/* Meeting Form Modal */}
      <ModalWrapper
        title={
          <div className="flex items-center">
            <Calendar size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
            <span>{editingMeeting ? "Edit Meeting" : "Schedule Meeting"}</span>
          </div>
        }
        open={open}
        onCancel={closeModal}
        footer={null}
        width={700}
        maskClosable={false}
        destroyOnHidden
      >
        <Formik
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ setFieldValue, values, isSubmitting }) => {
            const locationProps = getLocationFieldProps(values.venue);
            const now = dayjs();
            const startDate = values.startDatetime ? dayjs(values.startDatetime) : null;

            return (
              <Form>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <InputBox
                      required
                      name='meetingTitle'
                      label='Meeting Title'
                      placeholder='Enter meeting title'
                    />
                  </Col>

                  <Col span={12}>
                    <CustomDatePicker
                      required
                      label='Start Date & Time'
                      name='startDatetime'
                      showTime
                      disabledDate={(current) =>
                        current && current < dayjs().startOf('day')
                      }
                      disabledTime={(current) =>
                        current?.isSame(now, 'day')
                          ? getDisabledTime(current, now, null, true)
                          : {}
                      }
                      format="YYYY-MM-DD hh:mm A"
                      placeholder='YYYY-MM-DD hh:mm A'
                      needConfirm={false}
                    />
                  </Col>

                  <Col span={12}>
                    <CustomDatePicker
                      required
                      label='End Date & Time'
                      name='endDatetime'
                      showTime
                      disabledDate={(current) => {
                        if (current && current < dayjs().startOf('day')) return true;
                        if (startDate && current) {
                          return current.isBefore(startDate, 'day');
                        }
                        return false;
                      }}
                      disabledTime={(current) =>
                        getDisabledTime(current, now, startDate, true)
                      }
                      format="YYYY-MM-DD hh:mm A"
                      placeholder='YYYY-MM-DD hh:mm A'
                      needConfirm={false}
                    />
                  </Col>

                  <Col span={12}>
                    <CustomSelect
                      required
                      name='venue'
                      label='Venue'
                      allowClear
                      options={VENUE_OPTIONS.map(v => ({ label: v.label, value: v.value }))}
                    />
                  </Col>

                  <Col span={12}>
                    <InputBox
                      name='location'
                      label={locationProps.label}
                      required
                      placeholder={`Enter ${locationProps.placeholder}`}
                    />
                  </Col>

                  <Col span={24}>
                    <CustomSelect
                      required
                      name='attendees'
                      label='Attendees'
                      mode="multiple"
                      placeholder="Select attendees"
                      options={contactOptions}
                      showSearch={{ optionFilterProp: "label" }}
                      hideSelected
                      optionRender={(option) => (
                        <SuspenseWithBoundary>
                          <ContactOptionsRender option={option} />
                        </SuspenseWithBoundary>
                      )}
                    />
                  </Col>

                  <Col span={24}>
                    <Label text="Notes" />
                    <Input.TextArea
                      rows={3}
                      placeholder="Add any additional notes about the meeting"
                      value={values.notes}
                      onChange={(e) => setFieldValue('notes', e.target.value)}
                    />
                  </Col>
                </Row>

                <div className="mt-6 flex justify-end gap-2">
                  <Button onClick={closeModal}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={isSubmitting || loading}>
                    {editingMeeting ? "Update Meeting" : "Schedule Meeting"}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </ModalWrapper>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Meeting"
        open={deleteModalOpen}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        width={400}
        destroyOnHidden
        centered
      >
        <p>Are you sure you want to delete this meeting?</p>
        {meetingToDelete && meetings.find(m => m.meetingUUID === meetingToDelete) && (
          <p className="font-medium mt-2">
            "{meetings.find(m => m.meetingUUID === meetingToDelete)?.meetingTitle}"
          </p>
        )}
      </Modal>

      {/* Cancel Meeting Modal */}
      <Modal
        title="Cancel Meeting"
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        footer={null}
        width={400}
        destroyOnHidden
      >
        <Formik
          initialValues={{ cancellationReason: "" }}
          validationSchema={Yup.object({
            cancellationReason: Yup.string().required("Cancel reason is required"),
          })}
          onSubmit={async (values) => {
            if (selectedMeeting) {
              try {
                setLoading(true);
                const response = await API.patch(
                  `${APIPATH.DEAL.TABS.MEETING.CANCELMEETING}${selectedMeeting.meetingUUID}?reason=${values.cancellationReason}`
                );
                if (response) {
                  updateMeeting(selectedMeeting.meetingUUID, response.data);
                  toast.success("Meeting cancelled successfully");
                  setCancelModalOpen(false);
                  setSelectedMeeting(null);
                }
              } catch (error) {
                console.error("Error cancelling meeting:", error);
                toast.error("Failed to cancel meeting");
              } finally {
                setLoading(false);
              }
            }
          }}
        >
          {({ isValid, dirty }) => (
            <Form className="space-y-4">
              <Label text="Cancel Reason" required />
              <Field name="cancellationReason">
                {({ field, meta }: any) => (
                  <div className="relative">
                    <Input.TextArea
                      {...field}
                      required
                      autoSize={{ minRows: 4, maxRows: 6 }}
                      showCount
                      maxLength={2000}
                      placeholder="Enter reason for cancellation"
                    />
                    <span className="field-error">{meta.error}</span>
                  </div>
                )}
              </Field>
              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={() => setCancelModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={loading}
                  disabled={!isValid || !dirty}
                >
                  Cancel Meeting
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Reschedule Meeting Modal */}
      <Modal
        title="Reschedule Meeting"
        open={rescheduleModalOpen}
        onCancel={() => setRescheduleModalOpen(false)}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Formik
          initialValues={{
            startDatetime: selectedMeeting ? dayjs(selectedMeeting.startDatetime) : dayjs(),
            endDatetime: selectedMeeting ? dayjs(selectedMeeting.endDatetime) : dayjs(),
            rescheduleReason: "",
          }}
          validationSchema={Yup.object({
            startDatetime: Yup.mixed()
              .required("New start date & time is required")
              .test("is-future", "Date & time must be in the future", function (value) {
                if (!value) return false;
                const selectedDateTime = dayjs(value as string | Date | dayjs.Dayjs);
                const now = dayjs();
                return selectedDateTime.isAfter(now);
              }),
            endDatetime: Yup.mixed()
              .required("New end date & time is required")
              .test("is-after-start", "End time must be after start time", function (value) {
                const { startDatetime } = this.parent;
                if (!value || !startDatetime) return true;
                return dayjs(value as any).isAfter(dayjs(startDatetime as any));
              }),
            rescheduleReason: Yup.string().required("Reschedule reason is required"),
          })}
          onSubmit={async (values) => {
            if (selectedMeeting) {
              try {
                setLoading(true);
                const response = await API.post(
                  `${APIPATH.DEAL.TABS.MEETING.RESCHEDULEMEETING}${selectedMeeting.meetingUUID}`,
                  {
                    startDatetime: dayjs(values.startDatetime).format("YYYY-MM-DD HH:mm:ss"),
                    endDatetime: dayjs(values.endDatetime).format("YYYY-MM-DD HH:mm:ss"),
                    rescheduleReason: values.rescheduleReason,
                  }
                );
                if (response) {
                  updateMeeting(selectedMeeting.meetingUUID, response.data);
                  toast.success("Meeting rescheduled successfully");
                  setRescheduleModalOpen(false);
                  setSelectedMeeting(null);
                }
              } finally {
                setLoading(false);
              }
            }
          }}
          enableReinitialize
        >
          {({ isValid, values }) => {
            const now = dayjs();
            const startDate = values.startDatetime ? dayjs(values.startDatetime) : null;

            return (
              <Form className="space-y-4">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <CustomDatePicker
                      required
                      label="New Start Date & Time"
                      name="startDatetime"
                      showTime
                      disabledDate={(current) =>
                        current && current < dayjs().startOf('day')
                      }
                      disabledTime={(current) =>
                        current?.isSame(now, 'day')
                          ? getDisabledTime(current, now, null, true)
                          : {}
                      }
                      format="YYYY-MM-DD hh:mm A"
                      placeholder="YYYY-MM-DD hh:mm A"
                      needConfirm={false}
                    />
                  </Col>

                  <Col span={12}>
                    <CustomDatePicker
                      required
                      label="New End Date & Time"
                      name="endDatetime"
                      showTime
                      disabledDate={(current) => {
                        if (current && current < dayjs().startOf('day')) return true;
                        if (startDate && current) {
                          return current.isBefore(startDate, 'day');
                        }
                        return false;
                      }}
                      disabledTime={(current) =>
                        getDisabledTime(current, now, startDate, true)
                      }
                      format="YYYY-MM-DD hh:mm A"
                      placeholder="YYYY-MM-DD hh:mm A"
                      needConfirm={false}
                    />
                  </Col>
                </Row>

                <div className="relative">
                  <Label text="Reason" required />
                  <Field name="rescheduleReason">
                    {({ field, meta }: any) => (
                      <>
                        <Input.TextArea
                          {...field}
                          rows={2}
                          placeholder="Enter reason for rescheduling..."
                          status={meta.touched && meta.error ? "error" : ""}
                        />
                        {meta.touched && meta.error && (
                          <div className="field-error">
                            {meta.error}
                          </div>
                        )}
                      </>
                    )}
                  </Field>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button onClick={() => setRescheduleModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={!isValid}
                  >
                    Reschedule
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Modal>

      {/* Complete Meeting Modal */}
      <Modal
        title="Complete Meeting"
        open={completeModalOpen}
        onCancel={() => setCompleteModalOpen(false)}
        footer={null}
        width={400}
        destroyOnHidden
      >
        <Formik
          initialValues={{ outcome: "" }}
          validationSchema={Yup.object({
            outcome: Yup.string().required("Outcome is required"),
          })}
          onSubmit={async (values) => {
            if (selectedMeeting) {
              try {
                setLoading(true);
                const response = await API.patch(
                  `${APIPATH.DEAL.TABS.MEETING.COMPLETEMEETING}${selectedMeeting.meetingUUID}/${values.outcome}`
                );
                if (response) {
                  updateMeeting(selectedMeeting.meetingUUID, response.data);
                  toast.success("Meeting completed successfully");
                  setCompleteModalOpen(false);
                  setSelectedMeeting(null);
                }
              } catch (error) {
                console.error("Error completing meeting:", error);
                toast.error("Failed to complete meeting");
              } finally {
                setLoading(false);
              }
            }
          }}
        >
          {({ isValid, dirty }) => (
            <Form className="space-y-4">
              <CustomSelect
                name="outcome"
                label="Outcome"
                required
                options={outcomes.map((outcome) => ({
                  value: outcome.outcomeUUID,
                  label: outcome.outcomeName,
                }))}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={() => setCompleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={!isValid || !dirty}
                >
                  Complete
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default memo(MeetingManager);
