'use client';

import InputBox from '@/components/Input/Input';
import Label from '@/components/Label/Label';
import ModalWrapper from '@/components/Modal/Modal';
import { UploadFileValues } from '@/context/store/dealsStore';
import { Attachment } from '@/lib/types';
import { GlobalDate } from '@/Utils/helpers';
import { Button, Input, Modal, Tooltip, Upload } from 'antd';
import dayjs from 'dayjs';
import { Field, Form, Formik } from 'formik';
import debounce from 'lodash/debounce';
import {
  Calendar,
  Download,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  Paperclip,
  Plus,
  Search,
  Sheet,
  Trash2,
  User,
} from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';


// Constants
const FILE_ICON_MAP: Record<string, React.ReactNode> = {
  xlsx: <Sheet className="w-4.5 h-4.5" />,
  pdf: <FileText className="w-4.5 h-4.5" />,
  doc: <FileText className="w-4.5 h-4.5" />,
  docx: <FileText className="w-4.5 h-4.5" />,
  jpg: <FileImage className="w-4.5 h-4.5" />,
  jpeg: <FileImage className="w-4.5 h-4.5" />,
  png: <FileImage className="w-4.5 h-4.5" />,
  gif: <FileImage className="w-4.5 h-4.5" />,
  mp4: <FileVideo className="w-4.5 h-4.5" />,
  mov: <FileVideo className="w-4.5 h-4.5" />,
  mp3: <FileAudio className="w-4.5 h-4.5" />,
  zip: <FileArchive className="w-4.5 h-4.5" />,
  js: <FileCode className="w-4.5 h-4.5" />,
  ts: <FileCode className="w-4.5 h-4.5" />,
  html: <FileCode className="w-4.5 h-4.5" />,
  css: <FileCode className="w-4.5 h-4.5" />,
};

const FILE_COLOR_MAP: Record<string, string> = {
  pdf: 'red',
  doc: 'blue',
  docx: 'blue',
  xlsx: 'blue',
  jpg: 'purple',
  jpeg: 'purple',
  png: 'purple',
  gif: 'purple',
  mp4: 'pink',
  mov: 'pink',
  mp3: 'indigo',
  zip: 'yellow',
  js: 'cyan',
  ts: 'cyan',
  html: 'cyan',
  css: 'cyan',
};

const bgClassMap: Record<string, string> = {
  red: 'bg-red-50 dark:bg-red-900/20',
  blue: 'bg-blue-50 dark:bg-blue-900/20',
  purple: 'bg-purple-50 dark:bg-purple-900/20',
  pink: 'bg-pink-50 dark:bg-pink-900/20',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
  cyan: 'bg-cyan-50 dark:bg-cyan-900/20',
  gray: 'bg-gray-50 dark:bg-gray-800',
};

const textClassMap: Record<string, string> = {
  red: 'text-red-500',
  blue: 'text-blue-500',
  purple: 'text-purple-500',
  pink: 'text-pink-500',
  indigo: 'text-indigo-500',
  yellow: 'text-yellow-500',
  cyan: 'text-cyan-500',
  gray: 'text-gray-500',
};

// Helper function
const getExtension = (fileName = '') => fileName.split('.').pop()?.toLowerCase() ?? '';

// Memoized FileIcon component
const FileIcon = memo<{ extension: string }>(({ extension }) => {
  const ext = extension.toLowerCase();
  const icon = FILE_ICON_MAP[ext] ?? <File className="w-3 h-3" />;
  const color = FILE_COLOR_MAP[ext] ?? 'gray';
  const bg = bgClassMap[color];
  const text = textClassMap[color];

  return (
    <div className={`flex items-center justify-center rounded-lg w-10 h-10 flex-shrink-0 ${bg}`}>
      <div className={text}>{icon}</div>
    </div>
  );
});

FileIcon.displayName = 'FileIcon';

// Memoized AttachmentCard component
const AttachmentCard = memo<{
  attachment: Attachment;
  onDelete: (id: string) => void;
  onDownload: (url: string) => void;
}>(({ attachment, onDelete, onDownload }) => {
  const handleDelete = useCallback(() => {
    onDelete(attachment.id);
  }, [attachment.id, onDelete]);

  const handleDownload = useCallback(() => {
    onDownload(attachment.url);
  }, [attachment.url, onDownload]);

  return (
    <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="p-4 pb-3 flex items-start gap-3">
        <FileIcon extension={attachment.type} />

        <div className="flex-1 min-w-0">
          <Tooltip title={attachment.name}>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
              {attachment.name}
            </h4>
          </Tooltip>
          {attachment.description && (
            <Tooltip title={attachment.description}>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 leading-tight">
                {attachment.description}
              </p>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700" />

      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <User size={12} className="flex-shrink-0" />
            <span className="truncate font-medium">{attachment.uploadedBy}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
            <Calendar size={12} className="flex-shrink-0" />
            <span className="truncate">{GlobalDate(attachment.uploadedAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Tooltip title="Download">
            <Button
              type="text"
              size="small"
              icon={<Download size={16} />}
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={handleDownload}
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
  );
});

AttachmentCard.displayName = 'AttachmentCard';

// Memoized EmptyState component
const EmptyState = memo(({  searchQuery, onClearSearch, onUpload }: {
  searchQuery: string;
  onClearSearch: () => void;
  onUpload: () => void;
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
              <Paperclip className="w-12 h-12 mx-auto text-gray-400" />
          )}
        </div>
        
        <div className="mt-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {isSearchState ? 'No Attachments Found' : 'No Attachments Yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {isSearchState 
              ? `We couldn't find any attachments matching "${searchQuery}".`
              : 'Start by uploading your first file to share with your team.'
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
              onClick={onUpload}
              className="h-10 px-5 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            >
              Upload First File
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

interface UploadFormProps {
  onClose: () => void;
  uploadFile: (values: UploadFileValues) => void;
}

// Memoized UploadForm component
const UploadForm = memo<UploadFormProps>(({ onClose, uploadFile }) => {

  const initialValues = useMemo(() => ({ name: '', description: '', file: File ?? null }), []);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: Yup.string().required('Name is required'),
        file: Yup.mixed().required('File is required'),
      }),
    []
  );

  const handleSubmit = useCallback(
    (values: any) => {
      const rawFile = values.file?.originFileObj ?? values.file;
      const type = getExtension(rawFile?.name ?? values.name ?? '');
      uploadFile({ ...values, type });
      onClose();
    },
    [uploadFile, onClose]
  );

  const onFileChange = useCallback((info: any, setFieldValue: (k: string, v: any) => void) => {
    const file = info.fileList.slice(-1)[0] ?? null;
    setFieldValue('file', file);
  }, []);

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ setFieldValue, errors, touched,values }) => (
        <Form id="uploadDocument" className="space-y-4">
          <InputBox name="name" label="Document Name" placeholder="Enter document name..." />

          <div>
            <Label text="Description" />
            <Field name="description">
              {({ field }: any) => (
                <Input.TextArea {...field} rows={3} placeholder="Enter document description..." />
              )}
            </Field>
          </div>

          <div>
            <Label text="Select File" />
            <Upload
              beforeUpload={() => false}
              showUploadList={false}
              onChange={(info) => onFileChange(info, setFieldValue)}
              multiple={false}
              accept="*"
            >
              <Button icon={<Plus size={16} />}>Select File</Button>
            </Upload>
            {errors.file && touched.file && (
              <div className="text-red-500 text-sm mt-1">{errors.file as string}</div>
            )}
            {
             values.file?.name && (
              <div className="mt-2 flex gap-2 items-center">
                <span><FileText size={16} className="flex-shrink-0" /></span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">{values.file.name}</span>
              </div>
             ) 
            }
          </div>
        </Form>
      )}
    </Formik>
  );
});

UploadForm.displayName = 'UploadForm';

export interface UploadModalProps {
  attachments: Attachment[];
  uploadFile: (values: UploadFileValues) => void;
  removeAttachment: (id: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ attachments, uploadFile, removeAttachment }) => {
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Controlled input for immediate UI
  const [query, setQuery] = useState('');
  // Debounced query used for filtering
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debouncedRef = useRef<any>(null);

  // create the debounced setter once
  useEffect(() => {
    debouncedRef.current = debounce((val: string) => {
      setDebouncedQuery(val);
    }, 300);

    return () => {
      debouncedRef.current?.cancel?.();
    };
  }, []);

  // Filter attachments based on debouncedQuery (not immediate query)
  const filteredAttachments = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return attachments;

    return attachments.filter((att: Attachment) =>
      att.name.toLowerCase().includes(q) ||
      (att.description && att.description.toLowerCase().includes(q))
    );
  }, [attachments, debouncedQuery]);

  const handleOpenModal = useCallback(() => setOpen(true), []);
  const handleCloseModal = useCallback(() => setOpen(false), []);

  const handleDeleteAttachment = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const handleDownloadAttachment = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deletingId) removeAttachment(deletingId);
    setDeletingId(null);
  }, [deletingId, removeAttachment]);

  const handleCancelDelete = useCallback(() => setDeletingId(null), []);

  // update visible input immediately, but update debouncedQuery via debouncedRef
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setQuery(v);
      debouncedRef.current?.(v);
    },
    []
  );

  // clear both UI and debounced value and cancel pending debounce
  const handleClearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    debouncedRef.current?.cancel?.();
  }, []);

  // Cleanup debounce on unmount is handled in the useEffect above

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-0">Attachments</h3>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenModal}
            className="flex items-center gap-1"
          >
            Upload File
          </Button>
        </div>

        {/* Search Input */}
        {attachments.length > 0 && (
          <div className="mb-6">
            <Input
              placeholder="Search notes by title, description, or author..."
              prefix={<Search size={16} className="text-gray-400" />}
              onChange={handleSearchChange}
              value={query}           // controlled input
              className="w-full max-w-md"
              allowClear
              onClear={handleClearSearch}
            />
          </div>
        )}

        {filteredAttachments?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAttachments.map((att: Attachment) => (
              <AttachmentCard
                key={att.id}
                attachment={att}
                onDelete={handleDeleteAttachment}
                onDownload={handleDownloadAttachment}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            searchQuery={debouncedQuery || query}
            onClearSearch={handleClearSearch}
            onUpload={handleOpenModal}
          />
        )}
      </div>

      <ModalWrapper
        title="Upload Document"
        open={open}
        onCancel={handleCloseModal}
        footer={
          <div className="pt-5">
            <Button type="primary" htmlType="submit" form="uploadDocument">
              Save Document
            </Button>
          </div>
        }
        width={600}
        destroyOnHidden
        maskClosable={false}
      >
        <UploadForm onClose={handleCloseModal} uploadFile={uploadFile} />
      </ModalWrapper>

        <Modal
          title="Confirm Delete"
          open={!!deletingId}
          onOk={handleConfirmDelete}
          onCancel={handleCancelDelete}
          okText="Delete"
          okType="primary"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          centered
        >
          <p>Are you sure you want to delete this <strong>attachment</strong>? This action cannot be undone.</p>
        </Modal>
    </>
  );
};
