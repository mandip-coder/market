'use client';

import CustomDatePicker from '@/components/CustomDatePicker/CustomDatePicker';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import InputBox from '@/components/Input/Input';
import Label from '@/components/Label/Label';
import ModalWrapper from '@/components/Modal/Modal';
import { Button, Input, Modal, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { Field, Form, Formik } from 'formik';
import debounce from 'lodash/debounce';
import {
  Clock,
  Edit,
  Phone,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { CallLog } from '../../../lib/types';
import { EmptyState } from './EmptyState';

// Constants
const OUTCOME_COLOR_MAP: Record<string, string> = {
  'Approved Switch': 'green',
  'No Interest': 'gray',
  'Follow Up': 'blue',
  'Not Interested': 'red',
  'Call Back': 'orange',
};

const bgClassMap: Record<string, string> = {
  green: 'bg-green-50 dark:bg-green-900/20',
  gray: 'bg-gray-50 dark:bg-gray-800',
  blue: 'bg-blue-50 dark:bg-blue-900/20',
  red: 'bg-red-50 dark:bg-red-900/20',
  orange: 'bg-orange-50 dark:bg-orange-900/20',
};

const textClassMap: Record<string, string> = {
  green: 'text-green-500',
  gray: 'text-gray-500',
  blue: 'text-blue-500',
  red: 'text-red-500',
  orange: 'text-orange-500',
};

const outcomeOptions = [
  { value: 'Approved Switch', label: 'Approved Switch' },
  { value: 'No Interest', label: 'No Interest' },
  { value: 'Follow Up', label: 'Follow Up' },
  { value: 'Not Interested', label: 'Not Interested' },
  { value: 'Call Back', label: 'Call Back' },
];

// Memoized OutcomeBadge component
const OutcomeBadge = memo<{ outcome: string }>(({ outcome }) => {
  const color = OUTCOME_COLOR_MAP[outcome] || 'gray';
  const bg = bgClassMap[color];
  const text = textClassMap[color];

  return (
    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${bg} ${text}`}>
      {outcome}
    </span>
  );
});

OutcomeBadge.displayName = 'OutcomeBadge';

// Memoized CallCard component
const CallCard = memo<{
  call: CallLog;
  onEdit: (call: CallLog) => void;
  onDelete: (id: string) => void;
}>(({ call, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(call);
  }, [call, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(call.callLogUUID.toString());
  }, [call.callLogUUID, onDelete]);

  return (
    <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="p-4 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <Tooltip title={call.subject}>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                {call.subject}
              </h4>
            </Tooltip>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500 mt-1">
              <Clock size={12} className="flex-shrink-0" />
              <span>{dayjs(call.callStartTime).format('MMM D, YYYY h:mm A')}</span>
              <span>•</span>
              <span>{call.duration} minutes</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<Edit size={16} />}
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={handleEdit}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                danger
                type="text"
                size="small"
                icon={<Trash2 size={16} />}
                className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleDelete}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700" />

      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">Purpose:</span>
            <div className="mt-1 text-gray-600 dark:text-gray-400 text-sm">{call.purpose}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">Outcome:</span>
            <div className="mt-1">
              <OutcomeBadge outcome={call.outcome} />
            </div>
          </div>
        </div>
        {call.agenda && (
          <div className="mt-3">
            <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">Agenda:</span>
            <div className="mt-1 text-gray-600 dark:text-gray-400 text-sm">{call.agenda}</div>
          </div>
        )}
        {call.outcome === 'No Interest' && call.reason && (
          <div className="mt-3">
            <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">Reason:</span>
            <div className="mt-1 text-gray-600 dark:text-gray-400 text-sm">{call.reason}</div>
          </div>
        )}
      </div>
    </div>
  );
});

CallCard.displayName = 'CallCard';

// Memoized CallForm component
const CallForm = memo<{
  onClose: () => void;
  editingCall: CallLog | null;
  logCall: (data: any) => void;
  updateCall: (id: string, data: any) => void;
}>(({ onClose, editingCall, logCall, updateCall }) => {
  const initialValues = useMemo(() => {
    if (editingCall) {
      return {
        subject: editingCall.subject || '',
        callStartTime: editingCall.callStartTime ? dayjs(editingCall.callStartTime) : null,
        duration: editingCall.duration || '',
        purpose: editingCall.purpose || '',
        agenda: editingCall.agenda || '',
        outcome: editingCall.outcome || 'No Interest',
        reason: editingCall.reason || ''
      };
    }
    return {
      subject: '',
      callStartTime: null,
      duration: '',
      purpose: '',
      agenda: '',
      outcome: 'No Interest',
      reason: ''
    };
  }, [editingCall]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        subject: Yup.string().required('Subject is required'),
        callStartTime: Yup.date()
          .typeError('Call start time must be a valid date')
          .required('Call start time is required'),
        duration: Yup.number()
          .typeError('Duration must be a number')
          .required('Duration is required'),
        purpose: Yup.string().required('Purpose is required'),
        outcome: Yup.string().required('Outcome is required'),
        reason: Yup.string().when('outcome', {
          is: 'No Interest',
          then: (schema) => schema.required('Reason is required'),
        }),
      }),
    []
  );

  const handleSubmit = useCallback(
    (values: any) => {
      if (editingCall) {
        updateCall(editingCall.callLogUUID, values);
      } else {
        logCall(values);
      }
      onClose();
    },
    [editingCall, logCall, updateCall, onClose]
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
      key={editingCall?.callLogUUID || 'new-call'}
    >
      {({ values }) => (
        <Form id="callForm" className="space-y-4">
          <InputBox
            name='subject'
            label='Subject'
            placeholder="Enter call subject..."
          />

          <div className="grid grid-cols-2 gap-4">
            <CustomDatePicker
              name='callStartTime'
              label='Call Start Time'
              format="YYYY-MM-DD hh:mm:ss A"
              showTime
              placeholder='YYYY-MM-DD hh:mm:ss A'
              needConfirm={false}
            />

            <InputBox
              name='duration'
              label='Duration'
              placeholder="e.g., 30 minutes"
            />
          </div>

          <InputBox
            name='purpose'
            label='Purpose'
            placeholder="Enter call purpose..."
          />

          <div>
            <Label text='Agenda' />
            <Field name="agenda">
              {({ field }: any) => (
                <Input.TextArea {...field} rows={3} placeholder="Enter call agenda..." />
              )}
            </Field>
          </div>

          <CustomSelect
            name='outcome'
            label='Outcome'
            required
            options={outcomeOptions}
          />

          {values.outcome === 'No Interest' && (
            <div className='relative'>
              <Label text='Reason' required />
              <Field name="reason">
                {({ field, meta }: any) => (
                  <>
                    <Input.TextArea
                      {...field}
                      rows={6}
                      placeholder="Enter note description..."
                      status={meta.touched && meta.error ? 'error' : ''}
                      required
                    />
                    {meta.touched && meta.error && (
                      <span className="field-error">{meta.error}</span>
                    )}
                  </>
                )}
              </Field>
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
});

CallForm.displayName = 'CallForm';

interface CallModalProps {
  calls: CallLog[];
  logCall: (data: any) => void;
  updateCall: (id: string, data: any) => void;
  deleteCall: (id: string) => void;
}

export const CallModal: React.FC<CallModalProps> = ({ calls, logCall, updateCall, deleteCall }) => {
  const [open, setOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<CallLog | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [callToDelete, setCallToDelete] = useState<CallLog | null>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debouncedRef = useRef<any>(null);

  useEffect(() => {
    debouncedRef.current = debounce((val: string) => {
      setDebouncedQuery(val);
    }, 300);

    return () => {
      debouncedRef.current?.cancel?.();
    };
  }, []);

  const filteredCalls = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return calls;

    return calls.filter((call: CallLog) =>
      call.subject.toLowerCase().includes(q) ||
      call.purpose.toLowerCase().includes(q) ||
      (call.agenda && call.agenda.toLowerCase().includes(q)) ||
      call.outcome.toLowerCase().includes(q) ||
      (call.reason && call.reason.toLowerCase().includes(q))
    );
  }, [calls, debouncedQuery]);

  const handleOpenModal = useCallback(() => setOpen(true), []);
  const handleCloseModal = useCallback(() => {
    setOpen(false);
    setEditingCall(null);
  }, []);

  const handleEdit = useCallback((call: CallLog) => {
    setEditingCall(call);
    setOpen(true);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    const call = calls.find(c => c.callLogUUID === id);
    if (call) {
      setCallToDelete(call);
      setDeleteModalOpen(true);
    }
  }, [calls]);

  const confirmDelete = useCallback(() => {
    if (callToDelete) {
      deleteCall(callToDelete.callLogUUID);
      setDeleteModalOpen(false);
      setCallToDelete(null);
    }
  }, [callToDelete, deleteCall]);

  const cancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setCallToDelete(null);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setQuery(v);
      debouncedRef.current?.(v);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    debouncedRef.current?.cancel?.();
  }, []);

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-0">Call History</h3>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenModal}
            className="flex items-center gap-1"
          >
            Log Call
          </Button>
        </div>

        {calls.length > 0 && (
          <div className="mb-6">
            <Input
              placeholder="Search calls by subject, purpose, outcome, or reason..."
              prefix={<Search size={16} className="text-gray-400" />}
              onChange={handleSearchChange}
              value={query}
              className="w-full max-w-md"
              allowClear
              onClear={handleClearSearch}
            />
          </div>
        )}

        {filteredCalls?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCalls.map((call: CallLog) => (
              <CallCard
                key={call.callLogUUID}
                call={call}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            searchQuery={debouncedQuery || query}
            onClearSearch={handleClearSearch}
            onAction={handleOpenModal}
            icon={Phone}
            emptyTitle="No Calls Logged"
            emptyDescription="Start by logging your first call to track your communication history."
            actionLabel="Log First Call"
          />
        )}
      </div>

      <ModalWrapper
        title={editingCall ? "Edit Call" : "Log Call"}
        open={open}
        onCancel={handleCloseModal}
        footer={
          <div className='pt-5 flex gap-2 justify-end'>
            <Button onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="primary" form='callForm' htmlType="submit">
              {editingCall ? "Update Call" : "Log Call"}
            </Button>
          </div>
        }
        width={600}
        destroyOnHidden
        maskClosable={false}
      >
        <CallForm onClose={handleCloseModal} editingCall={editingCall} logCall={logCall} updateCall={updateCall} />
      </ModalWrapper>

      <Modal
        title="Confirm Delete"
        open={deleteModalOpen}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        okButtonProps={{ type: "primary" }}
        centered
      >
        <p>Are you sure you want to delete this call log? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default memo(CallModal);
