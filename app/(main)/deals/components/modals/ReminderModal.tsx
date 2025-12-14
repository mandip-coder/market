'use client';

import CustomDatePicker from '@/components/CustomDatePicker/CustomDatePicker';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import Label from '@/components/Label/Label';
import ModalWrapper from '@/components/Modal/Modal';
import { Button, Checkbox, DatePicker, Input, Modal, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { Field, Form, Formik } from 'formik';
import debounce from 'lodash/debounce';
import {
  Calendar as CalendarIcon,
  Edit,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { Reminder as ReminderType } from '../../../../../lib/types'; // <-- update path as needed
import { useDealStore } from '../../../../../context/store/dealsStore';
import { SelectProps } from 'antd/lib';

const generateInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const mockUsers = [
  { id: 1, name: 'Sarah Johnson', role: 'Project Manager', avatar: '#4F46E5' },
  { id: 2, name: 'Michael Chen', role: 'Developer', avatar: '#10B981' },
  { id: 3, name: 'Emily Rodriguez', role: 'Designer', avatar: '#F59E0B' },
  { id: 4, name: 'David Thompson', role: 'Marketing Lead', avatar: '#EF4444' },
  { id: 5, name: 'Jessica Williams', role: 'Product Owner', avatar: '#8B5CF6' }
];

// const reminderToOptions: SelectProps['options'] = [

//   ...mockUsers.map(user => ({
//     value: user.id.toString(),
//     label: (
//       <div className="flex items-center gap-2">
//         <div 
//           className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-medium"
//           style={{ backgroundColor: user.avatar }}
//         >
//           {generateInitials(user.name)}
//         </div>
//         <div className="flex-1">
//           <span className="text-xs font-medium text-gray-900 dark:text-gray-100 block truncate">
//             {user.name}
//           </span>
//           <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
//             {user.role}
//           </span>
//         </div>
//       </div>
//     ),
//   })),
// ];
// Reminder card
const ReminderCard = memo<{
  reminder: ReminderType;
  onEdit: (reminder: ReminderType) => void;
  onDelete: (id: string) => void;
}>(({ reminder, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => onEdit(reminder), [onEdit, reminder]);
  const handleDelete = useCallback(() => onDelete(reminder.id?.toString() ?? ''), [onDelete, reminder]);

  return (
    <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="p-4 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <Tooltip title={reminder.setReminderTo}>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                {reminder.setReminderTo}
              </h4>
            </Tooltip>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500 mt-1">
              <CalendarIcon size={12} className="flex-shrink-0" />
              <span>{dayjs(reminder.notifyDate).format('MMM D, YYYY')}</span>
              <span>•</span>
              <span>{reminder.sendEmail ? 'Email on' : 'No email'}</span>
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
                onClick={handleDelete}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700" />

      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">Description:</span>
          <div className="mt-1 text-gray-600 dark:text-gray-400 text-sm">{reminder.description}</div>
        </div>
      </div>
    </div>
  );
});

ReminderCard.displayName = 'ReminderCard';

// Empty state
const EmptyState = memo(({ searchQuery, onClearSearch, onAdd }: {
  searchQuery: string;
  onClearSearch: () => void;
  onAdd: () => void;
}) => {
  const isSearchState = Boolean(searchQuery);

  return (
    <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl transition-all duration-300">
      <div className="flex flex-col items-center justify-center">
        <div className={`transition-all duration-300 ${isSearchState ? 'scale-90 opacity-70' : 'scale-100 opacity-100'}`}>
          {isSearchState ? (
            <div className="relative">
              <Search className="w-12 h-12 mx-auto text-gray-400" />
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-xl opacity-30"></div>
            </div>
          ) : (
            <div className="relative">
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-400" />
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full blur-xl opacity-30"></div>
            </div>
          )}
        </div>

        <div className="mt-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {isSearchState ? 'No Reminders Found' : 'No Reminders'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {isSearchState
              ? `We couldn't find any reminders matching "${searchQuery}".`
              : 'Create your first reminder to get notified on the date you want.'
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          {isSearchState ? (
            <Button
              type="default"
              onClick={onClearSearch}
              className="h-10 px-5 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            >
              Clear Search
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={onAdd}
              className="h-10 px-5 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            >
              Add First Reminder
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// Reminder form
// Replace only the ReminderForm component with this improved version

const ReminderForm = memo<{ onClose: () => void; editingReminder: ReminderType | null }>(({ onClose, editingReminder }) => {
  const { addReminder, updateReminder } = useDealStore();

  const initialValues = useMemo(() => {
    if (editingReminder) {
      return {
        notifyDate: editingReminder.notifyDate ? dayjs(editingReminder.notifyDate) : null,
        setReminderTo: editingReminder.setReminderTo || '',
        description: editingReminder.description || '',
        sendEmail: !!editingReminder.sendEmail,
      };
    }
    return {
      notifyDate: null,
      setReminderTo: '',
      description: '',
      sendEmail: false,
    };
  }, [editingReminder]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        notifyDate: Yup.date().required('Date to be notified is required'),
        setReminderTo: Yup.string().required('Please select who to notify'),
        description: Yup.string().required('Description is required'),
      }),
    []
  );

  const handleSubmit = useCallback(
    (values: any) => {
      const payload: any = {
        // store in DB as formatted string (or keep date object as you prefer)
        notifyDate: dayjs(values.notifyDate).format('YYYY-MM-DD HH:mm:ss A'),
        setReminderTo: values.setReminderTo,
        description: values.description,
        sendEmail: !!values.sendEmail,
      };

      if (editingReminder) {
        updateReminder(editingReminder.id, payload);
      } else {
        addReminder(payload);
      }

      onClose();
    },
    [editingReminder, addReminder, updateReminder, onClose]
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
      key={editingReminder?.id || 'new-reminder'}
    >
      {({ values, setFieldValue }) => (
        <Form id="reminderForm" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className='relative'>
              <Label text="Date to be notified" required />
              <Field name="notifyDate">
                {({ field, form, meta }: any) => (
                  <>
                    {/* Important: pass name and id so Formik's handleBlur doesn't warn */}
                    <DatePicker
                      id={field.name}
                      name={field.name}
                      {...field}
                      value={values.notifyDate ? dayjs(values.notifyDate) : null}
                      onChange={(date) => {
                        setFieldValue(field.name, date);
                      }}
                      onBlur={() => {
                        form.setFieldTouched(field.name, true);
                      }}
                      showTime={{ format: 'hh:mm A' }}   
                      format="YYYY-MM-DD hh:mm A"
                      placeholder="Select date and time"
                      className='w-full'
                      status={meta.touched && meta.error ? 'error' : ''}
                      needConfirm={false}
                    />
                    {meta.touched && meta.error && <span className="field-error">{meta.error}</span>}
                  </>
                )}
              </Field>
            </div>

            <CustomSelect
              name="setReminderTo"
              label="Set reminder to"
              required
              options={mockUsers.map((user) => ({ label: user.name, value: user.id.toString() }))}
            />
          </div>

          <div className='relative'>
            <Label text="Description" required />
            <Field name="description">
              {({ field, meta }: any) => (
                <>
                  <Input.TextArea
                    {...field}
                    id={field.name}
                    rows={4}
                    placeholder="Enter description..."
                    status={meta.touched && meta.error ? 'error' : ''}
                    required
                  />
                  {meta.touched && meta.error && <span className="field-error">{meta.error}</span>}
                </>
              )}
            </Field>
          </div>

          <div>
            <Field name="sendEmail" type="checkbox">
              {({ field }: any) => (
                // Antd Checkbox accepts checked + onChange; spreading field helps but ensure checked prop is correct
                <Checkbox id={field.name} {...field} checked={!!field.value} onChange={(e) => setFieldValue(field.name, e.target.checked)}>
                  Send also an email for this reminder
                </Checkbox>
              )}
            </Field>
          </div>
        </Form>
      )}
    </Formik>
  );
});


ReminderForm.displayName = 'ReminderForm';

const ReminderModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderType | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<ReminderType | null>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debouncedRef = useRef<any>(null);
  const { reminders, deleteReminder } = useDealStore();

  useEffect(() => {
    debouncedRef.current = debounce((val: string) => {
      setDebouncedQuery(val);
    }, 300);

    return () => {
      debouncedRef.current?.cancel?.();
    };
  }, []);

  const filteredReminders = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return reminders;

    return reminders.filter((r: ReminderType) =>
      r.setReminderTo?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.notifyDate?.toLowerCase().includes(q)
    );
  }, [reminders, debouncedQuery]);

  const handleOpenModal = useCallback(() => setOpen(true), []);
  const handleCloseModal = useCallback(() => {
    setOpen(false);
    setEditingReminder(null);
  }, []);

  const handleEdit = useCallback((r: ReminderType) => {
    setEditingReminder(r);
    setOpen(true);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    const r = reminders.find(item => item.id?.toString() === id);
    if (r) {
      setReminderToDelete(r);
      setDeleteModalOpen(true);
    }
  }, [reminders]);

  const confirmDelete = useCallback(() => {
    if (reminderToDelete) {
      deleteReminder(reminderToDelete.id);
      setDeleteModalOpen(false);
      setReminderToDelete(null);
    }
  }, [reminderToDelete, deleteReminder]);

  const cancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setReminderToDelete(null);
  }, []);

  // search handlers
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-0">Reminders</h3>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenModal}
            className="flex items-center gap-1"
          >
            Add Reminder
          </Button>
        </div>

        {/* Search Input */}
        {reminders.length > 0 && (
          <div className="mb-6">
            <Input
              placeholder="Search reminders by date, recipient, or description..."
              prefix={<Search size={16} className="text-gray-400" />}
              onChange={handleSearchChange}
              value={query}
              className="w-full max-w-md"
              allowClear
              onClear={handleClearSearch}
            />
          </div>
        )}

        {filteredReminders?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReminders.map((r: ReminderType) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            searchQuery={debouncedQuery || query}
            onClearSearch={handleClearSearch}
            onAdd={handleOpenModal}
          />
        )}
      </div>

      <ModalWrapper
        title={editingReminder ? "Edit Reminder" : "Set Lead Reminder"}
        open={open}
        onCancel={handleCloseModal}
        footer={
          <div className='pt-5 flex gap-2 justify-end'>
            <Button onClick={handleCloseModal}>
              Close
            </Button>
            <Button type="primary" form='reminderForm' htmlType="submit">
              {editingReminder ? "Update Reminder" : "Save"}
            </Button>
          </div>
        }
        width={600}
        destroyOnHidden
        maskClosable={false}
      >
        <ReminderForm onClose={handleCloseModal} editingReminder={editingReminder} />
      </ModalWrapper>

      {/* Delete Confirmation Modal */}
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
        <p>Are you sure you want to delete this reminder? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default memo(ReminderModal);