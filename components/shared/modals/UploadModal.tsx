"use client";

import { toast } from '@/components/AppToaster/AppToaster';
import InputBox from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import ModalWrapper from "@/components/Modal/Modal";
import { UploadFileValues } from "@/context/store/dealsStore";
import { Attachment } from "@/lib/types";
import { APIPATH } from "@/shared/constants/url";
import { GlobalDate } from "@/Utils/helpers";
import { App, Button, Image, Input, Tooltip, Upload } from "antd";
import { UploadFile, UploadProps } from "antd/lib";
import { Field, Form, Formik } from "formik";
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
  RefreshCw,
  Search,
  Sheet,
  Trash2,
  User,
} from "lucide-react";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import * as Yup from "yup";
import { CustomUploadList } from "./AttachmentModal";
import { EmptyState } from "./EmptyState";

// Constants
const MAX_FILE_SIZE_MB = 50;
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
  pdf: "red",
  doc: "blue",
  docx: "blue",
  xlsx: "blue",
  jpg: "purple",
  jpeg: "purple",
  png: "purple",
  gif: "purple",
  mp4: "pink",
  mov: "pink",
  mp3: "indigo",
  zip: "yellow",
  js: "cyan",
  ts: "cyan",
  html: "cyan",
  css: "cyan",
};

const bgClassMap: Record<string, string> = {
  red: "bg-red-50 dark:bg-red-900/20",
  blue: "bg-blue-50 dark:bg-blue-900/20",
  purple: "bg-purple-50 dark:bg-purple-900/20",
  pink: "bg-pink-50 dark:bg-pink-900/20",
  indigo: "bg-indigo-50 dark:bg-indigo-900/20",
  yellow: "bg-yellow-50 dark:bg-yellow-900/20",
  cyan: "bg-cyan-50 dark:bg-cyan-900/20",
  gray: "bg-gray-50 dark:bg-gray-800",
};

const textClassMap: Record<string, string> = {
  red: "text-red-500",
  blue: "text-blue-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
  indigo: "text-indigo-500",
  yellow: "text-yellow-500",
  cyan: "text-cyan-500",
  gray: "text-gray-500",
};

// Memoized FileIcon component
const FileIcon = memo<{ extension: string }>(({ extension }) => {
  const ext = extension.toLowerCase();
  const icon = FILE_ICON_MAP[ext] ?? <File className="w-3 h-3" />;
  const color = FILE_COLOR_MAP[ext] ?? "gray";
  const bg = bgClassMap[color];
  const text = textClassMap[color];

  return (
    <div
      className={`flex items-center justify-center rounded-lg w-10 h-10 flex-shrink-0 ${bg}`}
    >
      <div className={text}>{icon}</div>
    </div>
  );
});

FileIcon.displayName = "FileIcon";

// Memoized AttachmentCard component
const AttachmentCard = memo<{
  attachment: Attachment;
  onDelete: (id: string) => void;
}>(({ attachment, onDelete }) => {
  const handleDelete = useCallback(() => {
    onDelete(attachment.attachmentUUID);
  }, [attachment.attachmentUUID, onDelete]);

  const handleDownload = useCallback(() => {
    window.open(attachment.url, "_blank");
  }, [attachment.url]);

  const extension = attachment.mimeType.split("/")[1];
  return (
    <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="p-4 pb-3 flex items-start gap-3">
        {["png", "jpg", "jpeg", "gif"].includes(extension) ? (
          <Image
            src={attachment.url}
            alt={attachment.filename}
            className="!w-10 !h-10 !object-cover !rounded-lg"
          />
        ) : (
          <FileIcon extension={extension} />
        )}

        <div className="flex-1 min-w-0">
          <Tooltip title={attachment.filename}>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
              {attachment.documentName}
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
            <span className="truncate font-medium">{attachment.createdBy}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
            <Calendar size={12} className="flex-shrink-0" />
            <span className="truncate">{GlobalDate(attachment.createdAt)}</span>
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

AttachmentCard.displayName = "AttachmentCard";

interface UploadFormProps {
  onClose: () => void;
  uploadFile: (values: UploadFileValues) => void;
  dealUUID: string;
}

// Memoized UploadForm component
const UploadForm = memo<UploadFormProps>(
  ({ onClose, uploadFile, dealUUID }) => {
    const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

    const initialValues = useMemo(
      () => ({
        documentName: "",
        description: "",
        fileName: "",
        filePath: "",
        url: "",
        dealUUID,
        size: 0,
        mimeType: "",
      }),
      []
    );

    const validationSchema = useMemo(
      () =>
        Yup.object({
          documentName: Yup.string().required("Document Name is required"),
          description: Yup.string().required("Description is required"),
          dealUUID: Yup.string().required("Deal UUID is required"),
        }),
      [uploadedFiles]
    );
    const handleSubmit = useCallback(
      (values: any) => {
        // Check if there are uploaded files
        const successfulUploads = uploadedFiles.filter(
          (f) => f.status === "done" && f.response
        );

        if (successfulUploads.length === 0) {
          toast.error("Please upload at least one file");
          return;
        }

        // Use the first successfully uploaded file
        const uploadedFile = successfulUploads[0];
        const response = uploadedFile.response;

        // Map backend response to required API format
        const payload = {
          documentName: values.documentName,
          description: values.description,
          fileName: response.originalFileName,
          filePath: response.filePath,
          url: response.fileUrl,
          dealUUID: values.dealUUID || "", // TODO: Get from props or context
          size: response.fileSize,
          mimeType: response.fileType,
        };

        uploadFile(payload);
        setUploadedFiles([]);
        onClose();
      },
      [uploadedFiles, uploadFile, onClose]
    );

    const uploadProps: UploadProps = {
      multiple: false,
      action: APIPATH.FILEUPLOAD,
      maxCount: 1,
      fileList: uploadedFiles,
      data: {
        moduleName: "dealDocuments",
      },
      showUploadList: false,

      beforeUpload: (file: File) => {
        const isLt10M = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB;
        if (!isLt10M) {
          toast.error(`File must be smaller than ${MAX_FILE_SIZE_MB}MB!`);
          return Upload.LIST_IGNORE;
        }
        return true;
      },

      onChange: (info) => {
        setUploadedFiles(info.fileList);
      },
    };

    const removeUploadedFile = useCallback(
      (file: UploadFile) => {
        setUploadedFiles(uploadedFiles.filter((f) => f.uid !== file.uid));
      },
      [uploadedFiles]
    );

    // Store Formik helpers in a ref to use in upload onChange
    const formikHelpersRef = useRef<any>(null);

    return (
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          errors,
          touched,
          validateForm,
          setFieldTouched,
          setFieldValue,
        }) => {
          formikHelpersRef.current = {
            validateForm,
            setFieldTouched,
            setFieldValue,
          };

          return (
            <Form id="uploadDocument" className="space-y-4">
              <InputBox
                name="documentName"
                label="Document Name"
                placeholder="Enter document name..."
                required
              />

              <div className="relative">
                <Label text="Description" required />
                <Field name="description">
                  {({ field, meta }: any) => (
                    <>
                      <Input.TextArea
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        {...field}
                        placeholder="Enter document description..."
                      />
                      {meta.error && meta.touched && (
                        <span className="field-error">
                          {meta.error as string}
                        </span>
                      )}
                    </>
                  )}
                </Field>
              </div>

              <div className="relative">
                <Label text="Upload File" required />
                <Upload.Dragger {...uploadProps} className="p-6">
                  <p className="ant-upload-drag-icon">
                    <Plus
                      className="text-4xl text-blue-500 mx-auto"
                      size={48}
                    />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for single file upload. Max file size:{" "}
                    {MAX_FILE_SIZE_MB}MB
                  </p>
                </Upload.Dragger>

                {/* Custom Upload List */}

                {/* File validation error */}
                {errors.fileName && touched.fileName && (
                  <span className="field-error">
                    {errors.fileName as string}
                  </span>
                )}
              </div>
              <CustomUploadList
                fileList={uploadedFiles}
                onRemove={removeUploadedFile}
                className="grid-cols-1"
              />
            </Form>
          );
        }}
      </Formik>
    );
  }
);

UploadForm.displayName = "UploadForm";

export interface UploadModalProps {
  attachments: Attachment[];
  uploadFile: (values: UploadFileValues) => void;
  removeAttachment: (id: string) => void;
  dealUUID: string;
  refetching: boolean;
  refetch: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  attachments,
  uploadFile,
  removeAttachment,
  dealUUID,
  refetching,
  refetch,
}) => {
  const { modal } = App.useApp();
  const [open, setOpen] = useState(false);

  // Controlled input for immediate UI
  const [query, setQuery] = useState("");

  // Filter attachments based on debouncedQuery (not immediate query)
  const filteredAttachments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return attachments;

    return attachments.filter(
      (att: Attachment) =>
        att.documentName.toLowerCase().includes(q) ||
        (att.description && att.description.toLowerCase().includes(q)) ||
        att.createdBy.toLowerCase().includes(q)
    );
  }, [attachments, query]);

  const handleOpenModal = useCallback(() => setOpen(true), []);
  const handleCloseModal = useCallback(() => setOpen(false), []);

  const handleDeleteAttachment = useCallback(
    (id: string) => {
      modal.confirm({
        title: "Confirm Delete",
        content: (
          <p>
            Are you sure you want to delete this <strong>attachment</strong>?
            This action cannot be undone.
          </p>
        ),
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        centered: true,
        onOk: () => {
          removeAttachment(id);
        },
      });
    },
    [modal, removeAttachment]
  );

  // update visible input immediately, but update debouncedQuery via debouncedRef
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setQuery(v);
    },
    []
  );

  // clear both UI and debounced value and cancel pending debounce
  const handleClearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-0">
            Attachments
          </h3>
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
          <div className="mb-6 flex items-center gap-2 justify-between">
            <Input
              placeholder="Search notes by title, description, or author..."
              prefix={<Search size={16} className="text-gray-400" />}
              onChange={handleSearchChange}
              value={query} // controlled input
              className="w-full max-w-md"
              allowClear
              onClear={handleClearSearch}
            />
            <Button
              size="small"
              icon={
                <RefreshCw
                  size={16}
                  className={refetching ? "animate-spin" : ""}
                />
              }
              onClick={refetch}
              title="Refresh calls"
            >
              Refresh
            </Button>
          </div>

        {filteredAttachments?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAttachments.map((att: Attachment) => (
              <AttachmentCard
                key={att.attachmentUUID}
                attachment={att}
                onDelete={handleDeleteAttachment}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            searchQuery={query}
            onClearSearch={handleClearSearch}
            actionLabel="Upload First File"
            emptyDescription="Start by uploading your first file to share with your team."
            emptyTitle="No Attachments Yet"
            icon={Paperclip}
            onAction={handleOpenModal}
            searchDescription={`We couldn't find any attachments matching "${query}".`}
            searchTitle="No Attachments Found"
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
        <UploadForm
          onClose={handleCloseModal}
          uploadFile={uploadFile}
          dealUUID={dealUUID}
        />
      </ModalWrapper>
    </>
  );
};
