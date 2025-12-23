"use client";

import CustomDatePicker from "@/components/CustomDatePicker/CustomDatePicker";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import InputBox from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import ModalWrapper from "@/components/Modal/Modal";
import { useDropDowns } from "@/context/store/optimizedSelectors";
import { GlobalDate } from "@/Utils/helpers";
import {
  Button,
  Card,
  Divider,
  Input,
  Modal,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { Field, Form, Formik } from "formik";
import debounce from "lodash.debounce";
import {
  CheckCircle,
  Clock,
  Edit,
  FileText,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Target,
  Trash2,
} from "lucide-react";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { CallLog } from "../../../lib/types";
import { EmptyState } from "./EmptyState";
import { CreateCallPayload, UpdateCallPayload } from "@/app/(main)/leads/services";
import { UseMutationResult } from "@tanstack/react-query";
const { Text, Paragraph } = Typography;

// Constants

const CallCard = memo(
  ({
    call,
    onEdit = () => console.log("Edit clicked"),
    onDelete = () => console.log("Delete clicked"),
  }: {
    call: CallLog;
    onEdit: (call: CallLog) => void;
    onDelete: (callLogUUID: string) => void;
  }) => {
    const handleEdit = useCallback(() => {
      onEdit(call);
    }, [call, onEdit]);

    const handleDelete = useCallback(() => {
      onDelete(call.callLogUUID);
    }, [call.callLogUUID, onDelete]);

    const getDurationColor = (minutes: number) => {
      if (minutes < 15) return "blue";
      if (minutes < 45) return "green";
      return "orange";
    };

    return (
      <Card hoverable size="small" className="transition-all duration-200">
        {/* Compact Header with Quick Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <Tooltip title={call.subject}>
                <Text strong className="text-sm block truncate">
                  {call.subject}
                </Text>
              </Tooltip>
              <Space size={4} className="mt-1" wrap>
                <Clock size={12} className="text-gray-400" />
                <Text type="secondary" className="text-xs">
                  {dayjs(call.callStartTime).format("DD MMM, YYYY hh:mm:ss A")}
                </Text>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Tag
                  color={getDurationColor(Number(call.duration))}
                  className="text-xs m-0 px-1.5 py-0"
                >
                  {call.duration} min
                </Tag>
              </Space>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <Space size={4} className="flex-shrink-0">
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<Edit size={16} />}
                onClick={handleEdit}
                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<Trash2 size={16} />}
                onClick={handleDelete}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              />
            </Tooltip>
          </Space>
        </div>

        <Divider className="my-2" />

        {/* Compact Details Section */}
        <div className="space-y-2">
          {/* Purpose & Outcome in Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Space size={4} className="mb-1">
                <Target size={12} className="text-purple-500" />
                <Text
                  strong
                  className="text-xs text-gray-600 dark:text-gray-400"
                >
                  Purpose
                </Text>
              </Space>
              <Paragraph
                className="m-0 text-xs text-gray-700 dark:text-gray-300"
                ellipsis={{ rows: 1, tooltip: call.purpose }}
              >
                {call.purpose}
              </Paragraph>
            </div>

            <div>
              <Space size={4} className="mb-1">
                <CheckCircle size={12} className="text-green-500" />
                <Text
                  strong
                  className="text-xs text-gray-600 dark:text-gray-400"
                >
                  Outcome
                </Text>
              </Space>
              <Paragraph
                className="m-0 text-xs text-gray-700 dark:text-gray-300"
                ellipsis={{ rows: 1, tooltip: call.outcome }}
              >
                {call.outcome}
              </Paragraph>
            </div>
          </div>

          {/* Agenda - Only if exists */}
          {call.agenda && (
            <div>
              <Space size={4} className="mb-1">
                <FileText size={12} className="text-blue-500" />
                <Text
                  strong
                  className="text-xs text-gray-600 dark:text-gray-400"
                >
                  Agenda
                </Text>
              </Space>
              <Paragraph
                className="m-0 text-xs text-gray-700 dark:text-gray-300"
                ellipsis={{ rows: 1, tooltip: call.agenda }}
              >
                {call.agenda}
              </Paragraph>
            </div>
          )}

          {/* Comment - Only if exists */}
          {call.comment && (
            <div>
              <Space size={4} className="mb-1">
                <MessageSquare size={12} className="text-orange-500" />
                <Text
                  strong
                  className="text-xs text-gray-600 dark:text-gray-400"
                >
                  Comment
                </Text>
              </Space>
              <Paragraph
                className="m-0 text-xs text-gray-700 dark:text-gray-300"
                ellipsis={{ rows: 1, tooltip: call.comment }}
              >
                {call.comment}
              </Paragraph>
            </div>
          )}
        </div>

        <Divider />

        <Space size={6}>
          <Text type="secondary" className="text-xs">
            Logged By {call.createdBy} On
          </Text>
          <Text type="secondary" className="text-xs">
            {GlobalDate(call.createdAt)}
          </Text>
        </Space>
      </Card>
    );
  }
);

CallCard.displayName = "CallCard";

// Memoized CallForm component
const CallForm = memo<{
  onClose: () => void;
  editingCall: CallLog | null;
  createCall: UseMutationResult<CallLog, Error, CreateCallPayload, unknown>;
  updateCall: UseMutationResult<CallLog, Error, { callLogUUID: string; data: UpdateCallPayload }, unknown>;
  leadUUID?: string;
  dealUUID?: string;
}>(
  ({
    onClose,
    editingCall,
    createCall,
    updateCall,
    leadUUID,
    dealUUID,
  }) => {
    const { outcomes } = useDropDowns();
    const initialValues = useMemo(() => {
      if (editingCall) {
        return {
          subject: editingCall.subject || "",
          callStartTime: editingCall.callStartTime
            ? dayjs(editingCall.callStartTime)
            : null,
          duration: editingCall.duration || "",
          purpose: editingCall.purpose || "",
          agenda: editingCall.agenda || "",
          outcomeUUID: editingCall.outcomeUUID || "No Interest",
          comment: editingCall.comment || "",
        };
      }
      return {
        subject: "",
        callStartTime: dayjs(),
        duration: "",
        purpose: "",
        agenda: "",
        outcomeUUID: "",
        comment: "",
      };
    }, [editingCall]);

    const validationSchema = useMemo(
      () =>
        Yup.object({
          subject: Yup.string()
            .required("Subject is required")
            .max(255, "Subject must be at most 255 characters"),
          callStartTime: Yup.date()
            .typeError("Start time must be a valid date")
            .required("Start time is required")
            .max(new Date(), "Start time must be in the past")
            .test(
              "is-past",
              "Start time cannot be in the future",
              function (value) {
                if (!value) return true;
                return dayjs(value).isBefore(dayjs()) || dayjs(value).isSame(dayjs(), 'second');
              }
            ),
          duration: Yup.number()
            .typeError("Duration must be a number")
            .required("Duration is required")
            .min(0, "Duration must be at least 0 minutes")
            .max(5000, "Duration cannot exceed 5000 minutes")
            .integer("Duration must be a whole number"),
          purpose: Yup.string()
            .required("Purpose is required")
            .max(200, "Purpose must be at most 255 characters")
            .min(3, "Purpose must be at least 3 characters"),
          outcomeUUID: Yup.string().required("Outcome is required"),
          agenda: Yup.string()
            .required("Agenda is required")
            .max(200, "Agenda must be at most 200 characters")
            .min(3, "Agenda must be at least 3 characters"),
          comment: Yup.string()
            .max(3000, "Comment must be at most 3000 characters"),
        }),
      []
    );

    const handleSubmit = useCallback(
      async (values: any) => {
        const formattedValues = {
          ...values,
          callStartTime: dayjs(values.callStartTime).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          ...(leadUUID && { leadUUID }),
          ...(dealUUID && { dealUUID }),
        };

        if (editingCall) {
          updateCall.mutate({
            callLogUUID: editingCall.callLogUUID,
            data: formattedValues,
          }, {
            onSuccess: () => {
              onClose();
            },
          });
        } else {
          createCall.mutate(formattedValues, {
            onSuccess: () => {
              onClose();
            },
          });
        }
      },
      [
        editingCall,
        createCall,
        updateCall,
        onClose,
        leadUUID,
        dealUUID,
      ]
    );

    return (
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnChange={false}
        key={editingCall?.callLogUUID || "new-call"}
      >
        {({ isValid, dirty }) => (
          <Form id="callForm" className="space-y-4">
            <InputBox
              name="subject"
              label="Subject"
              placeholder="Enter call subject..."
              maxLength={200}
              required
              minLength={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <CustomDatePicker
                name="callStartTime"
                label="Call Start Time"
                format="YYYY-MM-DD hh:mm:ss A"
                showTime
                placeholder="YYYY-MM-DD hh:mm:ss A"
                needConfirm={false}
                maxDate={dayjs()}
                required
              />

              <InputBox
                name="duration"
                label="Duration"
                type={"number"}
                placeholder="e.g., 30 minutes"
                min={0}
                max={5000}
                required
              />
            </div>

            <InputBox
              name="purpose"
              label="Purpose"
              placeholder="Enter call purpose..."
              maxLength={250}
              required
              minLength={3}
            />

            <div className="relative">
              <Label text="Agenda" required />
              <Field name="agenda">
                {({ field, meta }: any) => (<>
                  <Input.TextArea
                    {...field}
                    required
                    rows={3}
                    maxLength={2000}
                    showCount
                    status={meta.touched && meta.error ? "error" : ""}
                    placeholder="Enter call agenda..."
                  />
                  {meta.touched && meta.error && (
                    <span className="field-error">{meta.error}</span>
                  )}
                </>
                )}
              </Field>
            </div>

            <CustomSelect
              name="outcomeUUID"
              label="Outcome"
              required
              options={outcomes.map((item: any) => ({
                value: item.outcomeUUID,
                label: item.outcomeName,
              }))}
            />

            <div className="relative">
              <Label text="Comments" />
              <Field name="comment">
                {({ field, meta }: any) => (
                  <>
                    <Input.TextArea
                      {...field}
                      rows={6}
                      maxLength={3000}
                      showCount
                      placeholder="Enter note description..."
                      status={meta.touched && meta.error ? "error" : ""}
                    />
                    {meta.touched && meta.error && (
                      <span className="field-error">{meta.error}</span>
                    )}
                  </>
                )}
              </Field>
            </div>
            <div className="pt-5 flex gap-2 justify-end border-t border-gray-100 dark:border-gray-700 mt-6">
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createCall.isPending || updateCall.isPending}
                disabled={!isValid || !dirty}
              >
                {editingCall ? "Update Communication" : "Log Communication"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    );
  }
);

CallForm.displayName = "CallForm";

interface CallModalProps {
  calls: CallLog[];
  createCall: UseMutationResult<CallLog, Error, CreateCallPayload, unknown>;
  updateCall: UseMutationResult<CallLog, Error, { callLogUUID: string; data: UpdateCallPayload }, unknown>;
  deleteCall: UseMutationResult<void, Error, string, unknown>;
  leadUUID?: string;
  dealUUID?: string;
}

export const CallModal: React.FC<CallModalProps> = ({
  calls,
  createCall,
  updateCall,
  deleteCall,
  leadUUID,
  dealUUID,
}) => {
  const [open, setOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<CallLog | null>(null);
  const [modal, contextHolder] = Modal.useModal();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [refreshLoading, setRefreshLoading] = useState(false);

  const debouncedUpdate = useMemo(
    () =>
      debounce((val: string) => {
        setDebouncedQuery(val);
      }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const filteredCalls = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return calls;

    return calls.filter(
      (call: CallLog) =>
        call.subject.toLowerCase().includes(q) ||
        call.purpose.toLowerCase().includes(q) ||
        (call.agenda && call.agenda.toLowerCase().includes(q)) ||
        call.outcome.toLowerCase().includes(q) ||
        (call.comment && call.comment.toLowerCase().includes(q))
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

  const handleDeleteClick = useCallback(
    (call: CallLog) => {
      modal.confirm({
        title: "Confirm Delete",
        content: (
          <p>
            Are you sure you want to delete this{" "}
            <strong>{call.subject} </strong>log? This action cannot be undone.
          </p>
        ),
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        okButtonProps: { type: "primary" },
        centered: true,
        onOk: () => {
          deleteCall.mutate(call.callLogUUID);
        },
      });
    },
    [deleteCall, modal]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setQuery(v);
      debouncedUpdate(v);
    },
    [debouncedUpdate]
  );

  const handleClearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  // Refresh handler to refetch call data
  const handleRefresh = useCallback(() => {
    toast.info("Refreshing calls...");
  }, []);

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-0">
            Communications
          </h3>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenModal}
            className="flex items-center gap-1"
          >
            Log Communication
          </Button>
        </div>

        {calls.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-3">
            <Input
              placeholder="Search calls by subject, purpose, outcome, or comment..."
              prefix={<Search size={16} className="text-gray-400" />}
              onChange={handleSearchChange}
              value={query}
              className="w-full max-w-md"
              allowClear
              onClear={handleClearSearch}
            />
            <Button
              size="small"
              icon={
                <RefreshCw
                  size={16}
                  className={refreshLoading ? "!animate-spin" : ""}
                />
              }
              disabled={refreshLoading}
              onClick={handleRefresh}
              title="Refresh calls"
            >
              Refresh
            </Button>
          </div>
        )}

        {filteredCalls?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCalls.map((call: CallLog) => (
              <CallCard
                key={call.callLogUUID}
                call={call}
                onEdit={handleEdit}
                onDelete={() => handleDeleteClick(call)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            searchQuery={debouncedQuery || query}
            onClearSearch={handleClearSearch}
            onAction={handleOpenModal}
            icon={Phone}
            emptyTitle="No Communications Logged"
            emptyDescription="Start by logging your first communication to track your communication history."
            actionLabel="Log First Communication"
          />
        )}
      </div>

      <ModalWrapper
        title={editingCall ? "Edit Communication" : "Log Communication"}
        open={open}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        destroyOnHidden
        maskClosable={false}
      >
        <CallForm
          onClose={handleCloseModal}
          editingCall={editingCall}
          createCall={createCall}
          updateCall={updateCall}
          leadUUID={leadUUID}
          dealUUID={dealUUID}
        />
      </ModalWrapper>

      {contextHolder}
    </>
  );
};

export default memo(CallModal);
