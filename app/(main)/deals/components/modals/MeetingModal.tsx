'use client';
import CustomDatePicker from '@/components/CustomDatePicker/CustomDatePicker';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import InputBox from '@/components/Input/Input';
import Label from '@/components/Label/Label';
import { Button, Card, Col, Input, Modal, Popover, Row, Space, Tooltip } from 'antd';
import clsx from 'clsx';
import dayjs, { Dayjs } from 'dayjs';
import { Form, Formik } from 'formik';
import debounce from 'lodash/debounce';
import { Calendar, Clock, Edit, FileText, MapPin, Plus, Search, Trash2, Users } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { useDealStore } from '@/context/store/dealsStore';
import { Meeting } from '@/lib/types';
import ModalWrapper from '@/components/Modal/Modal';
import ContactOptionsRender from '@/components/shared/ContactOptionsRender';
import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry';

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
  attendeesUUID: string[];
  notes?: string;
  agenda?: string;
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
  attendeesUUID: Yup.array().min(1, 'At least one attendee is required'),
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
  onUpdateMom: (id: string, mom: string) => void;
}>(({ meeting, onEdit, onDelete, onUpdateMom }) => {
  const [momPopoverVisible, setMomPopoverVisible] = useState(false);

  const statusColor = useMemo(
    () => getMeetingStatus(meeting.startDatetime, meeting.endDatetime),
    [meeting.startDatetime, meeting.endDatetime]
  );

  const isMeetingEnded = statusColor.label === 'Ended';
  const venueName = VENUE_DISPLAY_MAP[meeting.venue] || meeting.venue;
  const attendeeCount = meeting.attendeesUUID?.length || 0;

  const handleMomSave = useCallback((value: string) => {
    onUpdateMom(meeting.meetingUUID, value);
    setMomPopoverVisible(false);
  }, [meeting.meetingUUID, onUpdateMom]);

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
          <div className={clsx(
            "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold",
            statusColor.bg,
            statusColor.text
          )}>
            <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
            <span className="leading-none">{statusColor.label}</span>
          </div>

          <div className="flex gap-1">
            <Tooltip title="Edit">
              <Button
                size='small'
                type="text"
                onClick={() => onEdit(meeting.meetingUUID)}
                className="p-1 rounded-md"
                icon={<Edit size={14} className="text-slate-500" />}
              />
            </Tooltip>

            {isMeetingEnded && (
              <Popover
                content={
                  <MomPopoverContent
                    initialValue={meeting.minutes || ''}
                    onSave={handleMomSave}
                    onCancel={() => setMomPopoverVisible(false)}
                  />
                }
                trigger="click"
                open={momPopoverVisible}
                onOpenChange={setMomPopoverVisible}
                placement="bottomRight"
              >
                <Tooltip title="Add/Update MOM">
                  <Button
                    size='small'
                    type="text"
                    className="p-1 rounded-md"
                    icon={<FileText size={14} className="text-slate-500" />}
                  />
                </Tooltip>
              </Popover>
            )}

            <Tooltip title="Delete">
              <Button
                size='small'
                danger
                type='text'
                onClick={() => onDelete(meeting.meetingUUID)}
                className="p-1 rounded-md"
                icon={<Trash2 size={14} className="text-red-500" />}
              />
            </Tooltip>
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
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">
              {dayjs(meeting.startDatetime).format("MMM D, YYYY")}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">
              {dayjs(meeting.startDatetime).format("hh:mm A")} - {dayjs(meeting.endDatetime).format("hh:mm A")}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">
              {attendeeCount} {attendeeCount === 1 ? 'attendee' : 'attendees'}
            </span>
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

  const debouncedSetQuery = useRef(
    debounce((value: string) => setDebouncedQuery(value), 300)
  ).current;

  const { meetings, addMeeting, updateMeeting, deleteMeeting, contactPersons } = useDealStore();

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
    if (!q) return meetings;

    return meetings.filter((meeting: Meeting) => {
      const searchStr = [
        meeting.meetingTitle,
        meeting.minutes,
        meeting.createdBy,
        meeting.location,
        VENUE_DISPLAY_MAP[meeting.venue],
        dayjs(meeting.startDatetime).format('MMM D, YYYY hh:mm A')
      ].filter(Boolean).join(' ').toLowerCase();

      return searchStr.includes(q);
    });
  }, [meetings, debouncedQuery]);

  const initialFormValues: MeetingFormValues = useMemo(() =>
    editingMeeting ? {
      meetingTitle: editingMeeting.meetingTitle,
      startDatetime: dayjs(editingMeeting.startDatetime),
      endDatetime: dayjs(editingMeeting.endDatetime),
      location: editingMeeting.location,
      venue: editingMeeting.venue,
      attendeesUUID: editingMeeting.attendeesUUID.map(contact => contact.hcoContactUUID),
      notes: editingMeeting.notes,
      agenda: editingMeeting.agenda
    } : {
      meetingTitle: '',
      startDatetime: dayjs(),
      endDatetime: dayjs(),
      location: '',
      venue: '',
      attendeesUUID: [],
      notes: '',
      agenda: ''
    },
    [editingMeeting]
  );

  const handleSubmit = useCallback((values: MeetingFormValues, { setSubmitting }: any) => {
    setSubmitting(false);
    setOpen(false);
    setEditingMeeting(null);
  }, [editingMeeting, updateMeeting, addMeeting, contactPersons]);

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

  const closeModal = useCallback(() => {
    setOpen(false);
    setEditingMeeting(null);
  }, []);

  const openNewMeetingModal = useCallback(() => {
    setEditingMeeting(null);
    setOpen(true);
  }, []);

  const validationSchema = useMemo(() => createValidationSchema(), []);

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
          <div className="mb-6">
            <Input
              placeholder="Search meetings..."
              prefix={<Search size={16} className="text-gray-400" />}
              onChange={handleSearchChange}
              value={query}
              className="w-full max-w-md"
              allowClear
              onClear={handleClearSearch}
            />
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
                      name='attendeesUUID'
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
                  <Button type="primary" htmlType="submit" loading={isSubmitting}>
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
        title="Confirm Delete"
        open={deleteModalOpen}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        centered
      >
        <p>Are you sure you want to delete this meeting? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default memo(MeetingManager);
