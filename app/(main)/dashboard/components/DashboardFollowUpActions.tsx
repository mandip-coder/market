"use client";

import CustomDatePicker from "@/components/CustomDatePicker/CustomDatePicker";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import Label from "@/components/Label/Label";
import { FollowUP, followUpStatus } from "@/lib/types";
import { useOutcomes } from "@/services/dropdowns/dropdowns.hooks";
import {
  Button,
  Dropdown,
  Input,
  MenuProps,
  Modal
} from "antd";
import dayjs from "dayjs";
import { Field, Form, Formik } from "formik";
import {
  Calendar,
  MoreVertical,
  Trash2,
  XCircle
} from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";

// Re-using the types from the dashboard service - but using FollowUP as base for now
// We'll trust the component pass-through
interface DashboardFollowUpActionsProps {
  followUp: FollowUP;
  onComplete: (followUpUUID: string, data: { outcome: string }) => void;
  onCancel: (followUpUUID: string, data: { cancellationReason: string }) => void;
  onReschedule: (
    followUpUUID: string,
    data: { scheduledDate: string; nextFollowUpNotes: string }
  ) => void;
  onDelete?: (followUpUUID: string) => void; // Optional if not needed on dashboard
  isCompleting?: boolean;
  isCanceling?: boolean;
  isRescheduling?: boolean;
  isDeleting?: boolean;
}

export const DashboardFollowUpActions = ({
  followUp,
  onComplete,
  onCancel,
  onReschedule,
  onDelete,
  isCompleting,
  isCanceling,
  isRescheduling,
  isDeleting,
}: DashboardFollowUpActionsProps) => {
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { data: outcomes = [] } = useOutcomes();

  const canPerformActions = (status: followUpStatus) => {
    return status !== "Completed" && status !== "Cancelled";
  };

  const menuItems: MenuProps["items"] = [];
  const canAct = canPerformActions(followUp.status);

  if (canAct) {
    if (followUp.status !== "Rescheduled") {
      menuItems.push({
        key: "reschedule",
        label: "Reschedule",
        icon: <Calendar size={14} />,
        onClick: () => setRescheduleModalOpen(true),
      });
    }

    if (onDelete) {
      menuItems.push({
        key: "delete",
        label: "Delete",
        icon: <Trash2 size={14} />,
        danger: true,
        onClick: () => setDeleteModalOpen(true),
      });
    }

    if (menuItems.length > 0) {
      menuItems.push({ type: "divider", key: "divider" });
    }

    menuItems.push({
      key: "cancel",
      label: "Cancel",
      icon: <XCircle size={14} />,
      onClick: () => setCancelModalOpen(true),
    });
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        {canAct && (
             <Button
                type="primary"
                color="green"
                variant="outlined"
                size="small"
                onClick={() => setCompleteModalOpen(true)}
              >
                Complete
              </Button>
        )}
        
        {menuItems.length > 0 && (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreVertical size={16} />}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            />
          </Dropdown>
        )}
      </div>
      {/* Complete Modal */}
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
            onComplete(followUp.followUpUUID, { outcome: values.outcome });
            setCompleteModalOpen(false);
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
                  loading={isCompleting}
                  disabled={!isValid || !dirty}
                >
                  Complete
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Reschedule Modal */}
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
            scheduledDate: dayjs(),
            nextFollowUpNotes: "",
          }}
          validationSchema={Yup.object({
            scheduledDate: Yup.mixed()
              .required("New date & time is required")
              .test("is-future", "Date & time must be in the future", function (
                value
              ) {
                if (!value) return false;
                const selectedDateTime = dayjs(
                  value as string | Date | dayjs.Dayjs
                );
                const now = dayjs();
                return selectedDateTime.isAfter(now);
              }),
            nextFollowUpNotes: Yup.string().required(
              "Reschedule reason is required"
            ),
          })}
          onSubmit={(values) => {
            onReschedule(followUp.followUpUUID, {
              scheduledDate: dayjs(values.scheduledDate).format(
                "YYYY-MM-DD HH:mm:ss"
              ),
              nextFollowUpNotes: values.nextFollowUpNotes,
            });
            setRescheduleModalOpen(false);
          }}
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
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
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
                        <div className="field-error text-red-500 text-xs">
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
                  loading={isRescheduling}
                  disabled={!isValid}
                >
                  Reschedule
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Cancel Modal */}
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
            onCancel(followUp.followUpUUID, {
              cancellationReason: values.cancellationReason,
            });
            setCancelModalOpen(false);
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
                    <span className="field-error text-red-500 text-xs text-right block">
                      {meta.error}
                    </span>
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
                  loading={isCanceling}
                  disabled={!isValid || !dirty}
                >
                  Cancel Follow Up
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};
