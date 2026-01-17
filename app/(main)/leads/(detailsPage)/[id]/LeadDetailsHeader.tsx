"use client";
import { formatUserDisplay, GlobalDate } from "@/Utils/helpers";
import Label from "@/components/Label/Label";
import { LoadingOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Input, Modal, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Field, Form, Formik } from "formik";
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import * as Yup from "yup";
import { useCancelLead, useConvertLead } from "../../services/leads.hooks";
import { Lead } from "../../services/leads.types";
import { useLoginUser } from "@/hooks/useToken";

dayjs.extend(relativeTime);

export const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 20 },
  },
};

const { TextArea } = Input;
const { Title, Text } = Typography;
interface LeadDetails {
  data: Lead;
}
export default function LeadDetailsHeader({
  headerDetails,
}: {
  headerDetails: LeadDetails;
}) {
  const response = headerDetails;
  const lead = response?.data;
  const router = useRouter();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [convertModalVisible, setConvertModalVisible] = useState(false);

  const userUUID = useLoginUser()?.userUUID

  const cancelLeadMutation = useCancelLead();
  const convertLeadMutation = useConvertLead();

  const handleBack = useCallback(() => {
    router.push("/leads");
  }, [router]);

  const STATUSMAP = {
    new: {
      text: <span className="text-blue-900 dark:text-blue-400">New</span>,
      color: "#8bb5f0",
    },
    inProgress: {
      text: (
        <div className="flex items-center gap-1">
          <LoadingOutlined className="h-3.5 w-3.5 " spin />
          <span className="text-green-900 dark:text-green-400">
            In Progress
          </span>
        </div>
      ),
      color: "#8bd268",
    },
    cancelled: {
      text: (
        <Tooltip title={lead?.closeReason}>
          <span className="text-red-900 dark:text-red-400">Cancelled</span>
        </Tooltip>
      ),
      color: "#ea757c",
    },
  };

  const getStatusIcon = (status: string) => {
    if (status === "new") {
      return STATUSMAP.new;
    } else if (status === "inProgress") {
      return STATUSMAP.inProgress;
    } else if (status === "cancelled") {
      return STATUSMAP.cancelled;
    } else {
      return STATUSMAP.new;
    }
  };

  const handleCancelLead = () => {
    setCancelModalVisible(true);
  };

  const handleConvertToDeal = () => {
    setConvertModalVisible(true);
  };

  const handleCancelConfirm = async (values: { closeReason: string }) => {
    cancelLeadMutation
      .mutateAsync({
        leadUUID: lead.leadUUID,
        closeReason: values.closeReason,
      })
      .then(() => {
        setCancelModalVisible(false);
        // router.push("/leads");
      });
  };

  const handleConvertConfirm = async (values: { summary: string }) => {
    convertLeadMutation
      .mutateAsync({ leadUUID: lead.leadUUID, summary: values.summary })
      .then((response) => {
        setConvertModalVisible(false);
        if (response?.dealUUID) {
          router.push(`/deals/${response.dealUUID}`);
        } else {
          router.push("/leads");
        }
      });
  };

  const cancelValidationSchema = Yup.object({
    closeReason: Yup.string().required(
      "Please provide reason for cancellation"
    ),
  });

  const convertValidationSchema = Yup.object({
    summary: Yup.string().required("Please provide summary"),
  });

  return (
    <motion.div
      // @ts-ignore
      variants={headerVariants}
      initial="hidden"
      animate="show"
    >
      <Card className="shadow-sm">
        {/* Header section with title and back button */}
        <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Title
                  level={3}
                  className="!mb-0 text-gray-900 dark:text-white"
                >
                  {lead.leadName}
                </Title>
                <Badge
                  color={getStatusIcon(lead.leadStatus).color}
                  text={getStatusIcon(lead.leadStatus).text}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Building size={16} />
                <span>{lead.hcoName}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              danger
              icon={<X size={16} />}
              onClick={handleCancelLead}
              disabled={lead.leadStatus === "cancelled"}
            >
              Cancel Prospect
            </Button>
            <Button
              type="primary"
              icon={<CheckCircle size={16} />}
              onClick={handleConvertToDeal}
              disabled={lead.leadStatus === "cancelled"}
            >
              Convert To Deal
            </Button>
            <Button
              type="default"
              icon={<ArrowLeft size={16} />}
              onClick={handleBack}
            >
              Back
            </Button>
          </div>
        </div>

        {/* Information grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Created Date */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <div>
              <Text type="secondary" className="text-xs">
                Created On
              </Text>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {GlobalDate(lead.leadDate)} by {formatUserDisplay(lead.createdBy, lead.createdUUID, userUUID) || "—"}
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <div>
              <Text type="secondary" className="text-xs">
                Last Updated
              </Text>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {GlobalDate(lead.updatedAt)} by {formatUserDisplay(lead.updatedBy, lead.updatedUUID, userUUID) || "—"}
              </div>
            </div>
          </div>

          {/* Assigned To
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <div>
              <Text type="secondary" className="text-xs">
                Assigned To
              </Text>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatUserDisplay(lead.createdBy,lead.createdUUID,userUUID) || "Unassigned"}
              </div>
            </div>
          </div> */}
        </div>

        {/* Summary section */}
        {lead.summary && (
          <div className="p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border-l-3 border-blue-500">
            <Text type="secondary" className="text-xs block mb-1">
              Summary
            </Text>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "{lead.summary}"
            </p>
          </div>
        )}
        {lead.closeReason && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border-l-3 border-red-500">
            <Text type="secondary" className="text-xs block mb-1">
              Close Reason
            </Text>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {lead.closeReason}
            </p>
          </div>
        )}
      </Card>

      {/* Cancel Lead Modal */}
      <Modal
        title="Cancel prospect"
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        footer={null}
        width={500}
      >
        <Formik
          initialValues={{ closeReason: "" }}
          validationSchema={cancelValidationSchema}
          onSubmit={handleCancelConfirm}
        >
          {({ isValid, dirty }) => (
            <Form className="space-y-4">
              <div>
                <Label text="Reason for Cancellation" required />
                <Field name="closeReason">
                  {({ field, meta }: any) => (
                    <div className="relative">
                      <TextArea
                        {...field}
                        rows={4}
                        placeholder="Please provide details about the cancellation..."
                        status={meta.touched && meta.error ? "error" : ""}
                      />
                      {meta.touched && meta.error && (
                        <span className="field-error">{meta.error}</span>
                      )}
                    </div>
                  )}
                </Field>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={() => setCancelModalVisible(false)}>
                  Back
                </Button>
                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={cancelLeadMutation.isPending}
                  disabled={!isValid || !dirty}
                >
                  Confirm Cancellation
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Convert To Deal Modal */}
      <Modal
        title="Convert Prospect To Deal"
        open={convertModalVisible}
        onCancel={() => setConvertModalVisible(false)}
        footer={null}
        width={500}
      >
        <Formik
          initialValues={{ summary: "" }}
          validationSchema={convertValidationSchema}
          onSubmit={handleConvertConfirm}
        >
          {({ isValid, dirty }) => (
            <Form className="space-y-4">
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <Text>
                  You are about to convert this prospect into a deal. This action
                  will create a new deal record.
                </Text>
              </div>
              <div className="relative">
                <Label text="Deal Summary" required />
                <Field name="summary">
                  {({ field, meta }: any) => (
                    <>
                      <TextArea
                        {...field}
                        rows={4}
                        placeholder="Add a summary for the new deal..."
                      />
                      {meta.touched && meta.error ? (
                        <span className="field-error">{meta.error}</span>
                      ) : null}
                    </>
                  )}
                </Field>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={() => setConvertModalVisible(false)}>
                  Back
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={convertLeadMutation.isPending}
                  disabled={!isValid || !dirty}
                >
                  Convert
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </motion.div>
  );
}
