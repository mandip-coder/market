"use client";
import AddNewContactModal, {
  HCOContactPerson,
} from "@/components/AddNewContactModal/AddNewContactModal";
import CustomDatePicker from "@/components/CustomDatePicker/CustomDatePicker";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import InputBox from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import ModalWrapper from "@/components/Modal/Modal";
import {
  CancelFollowUpValues,
  CompleteFollowUpValues,
  RescheduleFollowUpValues,
} from "@/context/store/dealsStore";

import {
  CreateFollowUpPayload,
  UpdateFollowUpPayload,
} from "@/app/(main)/leads/services/leads.types";
import { useOutcomes } from "@/services/dropdowns/dropdowns.hooks";
import { UseMutationResult } from "@tanstack/react-query";
import {
  Button,
  Divider,
  Dropdown,
  Input,
  MenuProps,
  Modal,
  Space,
  Table,
  Tag,
} from "antd";
import { ColumnProps } from "antd/es/table";
import Paragraph from "antd/es/typography/Paragraph";
import { Tooltip } from "antd/lib";
import dayjs from "dayjs";
import { Field, Form, Formik } from "formik";
import debounce from "lodash/debounce";
import {
  Calendar,
  CheckCircle,
  Edit,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  XCircle
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from '@/components/AppToaster/AppToaster';
import * as Yup from "yup";
import { FollowUP, followUpStatus } from "../../../lib/types";
import ContactOptionsRender from "../ContactOptionsRender";
import { EmptyState } from "./EmptyState";

interface FollowUpModalProps {
  followUps: FollowUP[];
  createFollowUp: UseMutationResult<
    FollowUP,
    Error,
    CreateFollowUpPayload,
    unknown
  >;
  updateFollowUp: UseMutationResult<
    FollowUP,
    Error,
    { followUpUUID: string; data: UpdateFollowUpPayload },
    unknown
  >;
  completeFollowUp: UseMutationResult<
    FollowUP,
    Error,
    { followUpUUID: string; data: CompleteFollowUpValues },
    unknown
  >;
  cancelFollowUp: UseMutationResult<
    FollowUP,
    Error,
    { followUpUUID: string; data: CancelFollowUpValues },
    unknown
  >;
  rescheduleFollowUp: UseMutationResult<
    FollowUP,
    Error,
    { followUpUUID: string; data: RescheduleFollowUpValues },
    unknown
  >;
  deleteFollowUp: UseMutationResult<FollowUP, Error, string, unknown>;
  contactPersons: HCOContactPerson[];
  onAddContactPerson?: (contact: HCOContactPerson) => void;
  hcoUUID: string | null;
  hcoName: string | null;
  leadUUID?: string;
  dealUUID?: string;
  refetching: boolean;
  refetch: () => void;
}
export const FollowUpModesEnum = {
  CALL: "Call",
  MEETING: "Meeting",
  EMAIL: "Email",
  VIDEO_CALL: "Video Call",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
  VISIT: "Visit",
}
export const FollowUpModes = Object.keys(FollowUpModesEnum);

// Create options for the follow-up mode dropdown
const followUpModeOptions = FollowUpModes.map((mode) => ({
  value: mode,
  label: FollowUpModesEnum[mode as keyof typeof FollowUpModesEnum],
}));



export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  followUps,
  createFollowUp,
  updateFollowUp,
  completeFollowUp,
  cancelFollowUp,
  rescheduleFollowUp,
  deleteFollowUp,
  contactPersons,
  hcoUUID,
  hcoName,
  leadUUID,
  dealUUID,
  refetching,
  refetch
}) => {
  const [open, setOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUP | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debouncedRef = useRef<any>(null);
  const { data: outcomes = [] } = useOutcomes();
  const [statusFilters, setStatusFilters] = useState<followUpStatus[]>([
    "Scheduled",
    "Overdue",
    "Rescheduled",
    "Cancelled",
  ]);

  // Action modals state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUP | null>(
    null
  );
  const [addContactModalOpen, setAddContactModalOpen] = useState(false);
  const [pendingContactPersons, setPendingContactPersons] = useState<string[]>(
    []
  );
  const formikRef = useRef<any>(null);

  const initialValues = {
    ...(leadUUID && { leadUUID }),
    ...(dealUUID && { dealUUID }),
    subject: editingFollowUp?.subject || "",
    scheduledDate: editingFollowUp ? dayjs(editingFollowUp.scheduledDate) : "",
    contactPersons: editingFollowUp?.contactPersons || [],
    description: editingFollowUp?.description || "",
    followUpMode: editingFollowUp?.followUpMode || FollowUpModes[0],
  };

  const validationSchema = Yup.object({
    leadUUID: leadUUID
      ? Yup.string().required("Lead UUID is required")
      : Yup.string(),
    dealUUID: dealUUID
      ? Yup.string().required("Deal UUID is required")
      : Yup.string(),
    subject: Yup.string().required("Subject is required"),
    scheduledDate: Yup.mixed()
      .required("Date & time is required")
      .test("is-future", "Date & time must be in the future", function (value) {
        if (!value) return false;
        const selectedDateTime = dayjs(value as string | Date | dayjs.Dayjs);
        const now = dayjs();
        return selectedDateTime.isAfter(now);
      }),
    contactPersons: Yup.array().min(
      1,
      "At least one contact person is required"
    ),
    description: Yup.string().required("description is required"),
    followUpMode: Yup.string()
      .required("Follow-up mode is required")
      .oneOf(FollowUpModes, "Invalid follow-up mode"),
  });

  useEffect(() => {
    debouncedRef.current = debounce((val: string) => {
      setDebouncedQuery(val);
    }, 300);

    return () => {
      debouncedRef.current?.cancel?.();
    };
  }, []);

  // Auto-select newly added contact persons
  useEffect(() => {
    if (pendingContactPersons.length > 0 && formikRef.current) {
      const currentContactPersons =
        formikRef.current.values.contactPersons || [];
      const newContactPersons = [
        ...new Set([...currentContactPersons, ...pendingContactPersons]),
      ];
      formikRef.current.setFieldValue("contactPersons", newContactPersons);
      setPendingContactPersons([]);
    }
  }, [pendingContactPersons]);

  const filteredFollowUps = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();

    let filtered = followUps;

    // Apply search filter
    if (q) {
      filtered = filtered.filter(
        (f: FollowUP) =>
          f.subject.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }

    // Apply status filter
    if (statusFilters.length > 0) {
      filtered = filtered.filter((f: FollowUP) =>
        statusFilters.includes(f.status)
      );
    }

    return filtered;
  }, [followUps, debouncedQuery, statusFilters]);

  const handleSubmit = async (values: any) => {
    const formattedValues = {
      ...values,
      contactPersons: values.contactPersons,
      scheduledDate: dayjs(values.scheduledDate).format("YYYY-MM-DD HH:mm:ss"),
      ...(leadUUID && { leadUUID }),
      ...(dealUUID && { dealUUID }),
    };
    if (editingFollowUp) {
      updateFollowUp.mutate(
        {
          followUpUUID: editingFollowUp.followUpUUID,
          data: formattedValues,
        },
        {
          onSuccess: () => {
            setOpen(false);
          },
        }
      );
    } else {
      createFollowUp.mutate(formattedValues, {
        onSuccess: () => {
          setOpen(false);
        },
      });
    }
  };

  const handleOpenModal = useCallback(() => {
    setEditingFollowUp(null);
    setOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpen(false);
    setEditingFollowUp(null);
  }, []);

  const handleEdit = useCallback((f: FollowUP) => {
    setEditingFollowUp({
      ...f,
      // @ts-ignore
      contactPersons: f.contactPersons.map((cp) => cp.hcoContactUUID),
    });
    setOpen(true);
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
    setQuery("");
    setDebouncedQuery("");
    debouncedRef.current?.cancel?.();
  }, []);

  // Helper function to determine if actions can be performed
  const canPerformActions = (followUp: FollowUP) => {
    if (followUp.status === "Completed" || followUp.status === "Cancelled")
      return false;
    const now = dayjs();
    const scheduled = dayjs(followUp.scheduledDate);
    return now.isBefore(scheduled);
  };

  // Action handlers
  const handleCompleteClick = (followUp: FollowUP) => {
    setSelectedFollowUp(followUp);
    setCompleteModalOpen(true);
  };

  const handleCancelClick = (followUp: FollowUP) => {
    setSelectedFollowUp(followUp);
    setCancelModalOpen(true);
  };

  const handleRescheduleClick = (followUp: FollowUP) => {
    setSelectedFollowUp(followUp);
    setRescheduleModalOpen(true);
  };

  const handleDeleteClick = (followUp: FollowUP) => {
    setSelectedFollowUp(followUp);
    setDeleteModalOpen(true);
  };

  const getStatusDisplay = (followUp: FollowUP) => {
    if (followUp.status === "Completed") {
      return (
        <Tooltip title={"Outcome: " + followUp.outcome}>
          <Tag color="green">Completed</Tag>
        </Tooltip>
      );
    }
    if (followUp.status === "Cancelled") {
      return (
        <Tooltip title={"Reason: " + followUp.cancellationReason}>
          <Tag color="red">Cancelled</Tag>
        </Tooltip>
      );
    }
    if (followUp.status === "Overdue") {
      return <Tag color="orange">Overdue</Tag>;
    }
    if (followUp.status === "Rescheduled") {
      return (
        <Tooltip title={"Reason: " + followUp.nextFollowUpNotes}>
          <Tag color="purple">Rescheduled</Tag>
        </Tooltip>
      );
    }
    return <Tag color="blue">Scheduled</Tag>;
  };

  const contactPersonOptions = useMemo(
    () =>
      contactPersons.map((contact) => ({
        value: contact.hcoContactUUID,
        label: contact.fullName,
        title: contact.email,
        contact,
      })),
    [contactPersons]
  );
  const handleAddNewContact = (contactData: HCOContactPerson) => {
    setTimeout(() => {
      if (contactData) {
        const currentContacts = formikRef.current?.values.contactPersons || [];
        formikRef.current?.setFieldValue("contactPersons", [
          ...currentContacts,
          contactData.hcoContactUUID,
        ]);
        formikRef.current?.setFieldTouched("contactPersons", true);
        setAddContactModalOpen(false);
      }
    }, 100);
  };

  // Custom dropdown render for Contact Persons select
  const contactPersonsDropdownRender = useCallback(
    (menu: React.ReactNode) => (
      <>
        {menu}
        <Divider style={{ margin: "8px 0" }} />
        <div className="flex items-center justify-end p-2">
          <Button
            type="primary"
            icon={<UserPlus size={16} />}
            onClick={() => setAddContactModalOpen(true)}
          >
            Add New Contact
          </Button>
        </div>
      </>
    ),
    [setAddContactModalOpen]
  );

  const columns: ColumnProps<FollowUP>[] = [
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      width: "20%",
      sorter: (a: FollowUP, b: FollowUP) => {
        const subjectA = a.subject.toLowerCase();
        const subjectB = b.subject.toLowerCase();
        return subjectA.localeCompare(subjectB);
      },
      render: (text: string) => (
        <div className="font-medium text-gray-800 dark:text-white">{text}</div>
      ),
    },
    {
      title: "Scheduled Date & Time",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      width: "15%",
      sorter: (a: FollowUP, b: FollowUP) => {
        const dateA = dayjs(a.scheduledDate);
        const dateB = dayjs(b.scheduledDate);
        return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
      },
      render: (scheduledDate: string, record: FollowUP) => {
        const date = dayjs(scheduledDate);
        const now = dayjs();
        const isOverdue =
          date.isBefore(now) &&
          record.status !== "Completed" &&
          record.status !== "Cancelled";

        return (
          <div className={isOverdue ? "text-red-600 dark:text-red-400" : ""}>
            {date.format("D MMM, YYYY hh:mm A")}
            {isOverdue && <div className="text-xs">Overdue</div>}
          </div>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <Paragraph
          className="text-gray-600 !font-medium dark:text-gray-400"
          ellipsis={{
            tooltip: text,
            rows: 2,
            symbol: "...",
          }}
        >
          {text}
        </Paragraph>
      ),
    },
    {
      title: "Contact Persons",
      dataIndex: "contactPersons",
      key: "contactPersons",
      render: (_: any, record: FollowUP) => {
        const primaryContactPerson = record.contactPersons[0];
        const remainingContactPersons = record.contactPersons.slice(1);
        const remainingCount = remainingContactPersons.length;

        return (
          <div className="flex items-center gap-2">
            <Tag color="blue">{primaryContactPerson.fullName}</Tag>
            {remainingCount > 0 && (
              <Tooltip
                mouseEnterDelay={0.3}
                title={
                  <div className="space-y-1">
                    {remainingContactPersons.map((contactPerson) => (
                      <div key={contactPerson.hcoContactUUID}>
                        {contactPerson.fullName}
                      </div>
                    ))}
                  </div>
                }
              >
                <Tag variant="filled" color="blue" className="cursor-pointer">
                  +{remainingCount}
                </Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Scheduled", value: "Scheduled" },
        { text: "Overdue", value: "Overdue" },
        { text: "Rescheduled", value: "Rescheduled" },
        { text: "Cancelled", value: "Cancelled" },
        { text: "Completed", value: "Completed" },
      ],
      filteredValue: statusFilters,
      onFilter: (value: any, record: FollowUP) => record.status === value,
      render: (_: any, record: FollowUP) => getStatusDisplay(record),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: FollowUP) => {
        const canEdit = canPerformActions(record);
        const canComplete =
          record.status !== "Completed" && record.status !== "Cancelled";

        const menuItems: MenuProps["items"] = [];

        if (canEdit) {
          menuItems.push({
            key: "edit",
            label: "Edit",
            icon: <Edit size={14} />,
            onClick: () => handleEdit(record),
          });

          // Only allow reschedule if not already rescheduled
          if (record.status !== "Rescheduled") {
            menuItems.push({
              key: "reschedule",
              label: "Reschedule",
              icon: <Calendar size={14} />,
              onClick: () => handleRescheduleClick(record),
            });
          }

          menuItems.push({
            key: "delete",
            label: "Delete",
            icon: <Trash2 size={14} />,
            danger: true,
            onClick: () => handleDeleteClick(record),
          });
        }

        if (canComplete) {
          if (menuItems.length > 0) {
            menuItems.push({ type: "divider", key: "divider" });
          }
          menuItems.push({
            key: "cancel",
            label: "Cancel",
            icon: <XCircle size={14} />,
            onClick: () => handleCancelClick(record),
          });
        }

        if (menuItems.length === 0 && !canComplete) {
          return <span className="text-gray-400">-</span>;
        }

        if (canComplete) {
          return (
            <Space.Compact>
              <Button
                type="primary"
                color="green"
                variant="outlined"
                onClick={() => handleCompleteClick(record)}
              >
                Complete
              </Button>
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="primary"
                  color="green"
                  variant="outlined"
                  icon={<MoreVertical size={14} />}
                />
              </Dropdown>
            </Space.Compact>
          );
        }

        // Otherwise, show regular dropdown
        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreVertical size={16} />}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-0">
            Follow Ups
          </h3>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenModal}
            className="flex items-center gap-1"
          >
            Add Follow Up
          </Button>
        </div>

        {followUps.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-3">
            <Input
              placeholder="Search follow ups by subject or description..."
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
                  className={refetching ? "!animate-spin" : ""}
                />
              }
              disabled={refetching}
              onClick={refetch}
              title="Refresh follow-ups"
            >
              Refresh
            </Button>
          </div>
        )}

        {followUps?.length ? (
          <Table<FollowUP>
            columns={columns}
            dataSource={filteredFollowUps}
            rowKey="followUpUUID"
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Follow Ups`,
            }}
            onChange={(pagination, filters, sorter) => {
              if (filters.status) {
                setStatusFilters(filters.status as followUpStatus[]);
              }
            }}
            className="overflow-x-auto"
          />
        ) : (
          <EmptyState
            searchQuery={debouncedQuery || query}
            onClearSearch={handleClearSearch}
            onAction={handleOpenModal}
            icon={CheckCircle}
            emptyTitle="No Follow Ups"
            emptyDescription="Create your first followup to start tracking important follow ups."
            actionLabel="Create First Follow Up"
          />
        )}
      </div>

      {/* Add/Edit Follow Up Modal */}
      <ModalWrapper
        title={editingFollowUp ? "Edit Follow Up" : "Add Follow Up"}
        open={open}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        destroyOnHidden
        maskClosable={false}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
          innerRef={formikRef}
        >
          {({ isValid, dirty, errors }) => {
            return (
              <Form id="followupForm" className="space-y-4">
                <InputBox required name="subject" label="Subject" />

                <div className="grid grid-cols-2 gap-4">
                  <CustomDatePicker
                    name="scheduledDate"
                    label="Date & Time"
                    required
                    showTime
                    format="YYYY-MM-DD hh:mm A"
                    needConfirm={false}
                    disabledDate={(current) => {
                      // Disable dates before today
                      return current && current < dayjs().startOf("day");
                    }}
                    disabledTime={(current) => {
                      // If selected date is today, disable past hours and minutes
                      if (!current || !dayjs(current).isSame(dayjs(), "day")) {
                        return {};
                      }
                      const now = dayjs();
                      return {
                        disabledHours: () => {
                          const hours = [];
                          for (let i = 0; i < now.hour(); i++) {
                            hours.push(i);
                          }
                          return hours;
                        },
                        disabledMinutes: (selectedHour: number) => {
                          if (selectedHour === now.hour()) {
                            const minutes = [];
                            for (let i = 0; i <= now.minute(); i++) {
                              minutes.push(i);
                            }
                            return minutes;
                          }
                          return [];
                        },
                      };
                    }}
                  />
                  <CustomSelect
                    name="followUpMode"
                    label="Follow-up Mode"
                    required
                    options={followUpModeOptions}
                  />
                </div>

                <CustomSelect
                  name="contactPersons"
                  label="Contact Persons"
                  required
                  mode="multiple"
                  optionRender={(option) => (
                    <ContactOptionsRender option={option} />
                  )}
                  options={contactPersonOptions}
                  maxResponsive
                  hideSelected
                  popupRender={contactPersonsDropdownRender}
                />
                <div>
                  <Label text="Description" required />
                  <Field name="description">
                    {({ field }: any) => (
                      <Input.TextArea
                        {...field}
                        rows={2}
                        placeholder="Enter description..."
                      />
                    )}
                  </Field>
                </div>

                <div className="gap-2 flex justify-end pt-4">
                  <Button type="default" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={
                      updateFollowUp.isPending || createFollowUp.isPending
                    }
                    disabled={!isValid || (!!editingFollowUp && !dirty)}
                  >
                    {editingFollowUp ? "Update Follow Up" : "Add Follow Up"}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </ModalWrapper>

      {/* Complete Follow Up Modal */}
      <Modal
        title="Complete Follow Up"
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
          onSubmit={(values) => {
            if (selectedFollowUp) {
              completeFollowUp.mutate(
                {
                  followUpUUID: selectedFollowUp.followUpUUID,
                  data: { outcome: values.outcome },
                },
                {
                  onSuccess: () => {
                    setCompleteModalOpen(false);
                    setSelectedFollowUp(null);
                  },
                }
              );
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
                  loading={completeFollowUp.isPending}
                  disabled={!isValid || !dirty}
                >
                  Complete
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Cancel Follow Up Modal */}
      <Modal
        title="Cancel Follow Up"
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        footer={null}
        width={400}
        destroyOnHidden
      >
        <Formik
          initialValues={{ cancellationReason: "" }}
          validationSchema={Yup.object({
            cancellationReason: Yup.string().required(
              "Cancel reason is required"
            ),
          })}
          onSubmit={(values) => {
            if (selectedFollowUp) {
              cancelFollowUp.mutate(
                {
                  followUpUUID: selectedFollowUp.followUpUUID,
                  data: { cancellationReason: values.cancellationReason },
                },
                {
                  onSuccess: () => {
                    setCancelModalOpen(false);
                    setSelectedFollowUp(null);
                  },
                }
              );
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
                  loading={cancelFollowUp.isPending}
                  disabled={!isValid || !dirty}
                >
                  Cancel Follow Up
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Reschedule Follow Up Modal */}
      <Modal
        title="Reschedule Follow Up"
        open={rescheduleModalOpen}
        onCancel={() => setRescheduleModalOpen(false)}
        footer={null}
        width={500}
        destroyOnHidden
      >
        <Formik
          initialValues={{
            scheduledDate: selectedFollowUp
              ? dayjs(selectedFollowUp.scheduledDate)
              : dayjs(),
            nextFollowUpNotes: "",
          }}
          validationSchema={Yup.object({
            scheduledDate: Yup.mixed()
              .required("New date & time is required")
              .test(
                "is-future",
                "Date & time must be in the future",
                function (value) {
                  if (!value) return false;
                  const selectedDateTime = dayjs(
                    value as string | Date | dayjs.Dayjs
                  );
                  const now = dayjs();
                  return selectedDateTime.isAfter(now);
                }
              ),
            nextFollowUpNotes: Yup.string().required(
              "Reschedule reason is required"
            ),
          })}
          onSubmit={(values) => {
            if (selectedFollowUp) {
              rescheduleFollowUp.mutate(
                {
                  followUpUUID: selectedFollowUp.followUpUUID,
                  data: {
                    scheduledDate: dayjs(values.scheduledDate).format(
                      "YYYY-MM-DD HH:mm:ss"
                    ),
                    nextFollowUpNotes: values.nextFollowUpNotes,
                  },
                },
                {
                  onSuccess: () => {
                    setRescheduleModalOpen(false);
                    setSelectedFollowUp(null);
                  },
                }
              );
            }
          }}
          enableReinitialize
        >
          {({ isValid }) => (
            <Form className="space-y-4">
              <CustomDatePicker
                name="scheduledDate"
                label="New Date & Time"
                required
                showTime
                format="YYYY-MM-DD hh:mm A"
                needConfirm={false}
                disabledDate={(current) => {
                  // Disable dates before today
                  return current && current < dayjs().startOf("day");
                }}
                disabledTime={(current) => {
                  // If selected date is today, disable past hours and minutes
                  if (!current || !dayjs(current).isSame(dayjs(), "day")) {
                    return {};
                  }
                  const now = dayjs();
                  return {
                    disabledHours: () => {
                      const hours = [];
                      for (let i = 0; i < now.hour(); i++) {
                        hours.push(i);
                      }
                      return hours;
                    },
                    disabledMinutes: (selectedHour: number) => {
                      if (selectedHour === now.hour()) {
                        const minutes = [];
                        for (let i = 0; i <= now.minute(); i++) {
                          minutes.push(i);
                        }
                        return minutes;
                      }
                      return [];
                    },
                  };
                }}
              />
              <div className="relative">
                <Label text="Reason" required />
                <Field name="nextFollowUpNotes">
                  {({ field, meta }: any) => (
                    <>
                      <Input.TextArea
                        {...field}
                        rows={2}
                        placeholder="Enter description..."
                        status={meta.touched && meta.error ? "error" : ""}
                      />
                      {meta.touched && meta.error && (
                        <div className="field-error">{meta.error}</div>
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
                  loading={rescheduleFollowUp.isPending}
                  disabled={!isValid}
                >
                  Reschedule
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Follow Up"
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={() => {
          if (selectedFollowUp) {
            deleteFollowUp.mutate(selectedFollowUp.followUpUUID, {
              onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedFollowUp(null);
              },
            });
          }
        }}
        confirmLoading={deleteFollowUp.isPending}
        okText="Delete"
        okButtonProps={{ danger: true }}
        width={400}
        destroyOnHidden
      >
        <p>Are you sure you want to delete this follow-up?</p>
        {selectedFollowUp && (
          <p className="font-medium mt-2">"{selectedFollowUp.subject}"</p>
        )}
      </Modal>

      {/* Add New Contact Modal */}
      <AddNewContactModal
        open={addContactModalOpen}
        onClose={() => setAddContactModalOpen(false)}
        onSave={(values) => handleAddNewContact(values)}
        showExtraFields={false}
        requireHelthcareId={true}
        hcoUUID={hcoUUID || undefined}
        hcoName={hcoName || undefined}
      />
    </>
  );
};

export default FollowUpModal;
