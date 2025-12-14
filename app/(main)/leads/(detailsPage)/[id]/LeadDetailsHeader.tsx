'use client'
import { GlobalDate } from "@/Utils/helpers";
import { LoadingOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Form, Input, message, Modal, Select, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  User,
  X
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { use, useCallback, useState } from "react";
import { Lead } from "../../components/LeadsListing";

dayjs.extend(relativeTime);

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 20 }
  }
};

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function LeadDetailsHeader({ headerDetails }: { headerDetails: Promise<Lead> }) {
  const lead = use(headerDetails);
  const router = useRouter();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [convertForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleBack = useCallback(() => {
    router.push('/leads');
  }, [router]);

  const STATUSMAP = {
    new: {
      text: <span className="text-blue-900 dark:text-blue-400">New</span>,
      color: "#8bb5f0",
    },
    inprogress: {
      text: <div className="flex items-center gap-1">
        <LoadingOutlined className="h-3.5 w-3.5 " spin />
        <span className="text-green-900 dark:text-green-400">In Progress</span>
      </div>,
      color: "#8bd268",
    },
    cancelled: {
      text: <Tooltip title={lead.closeReason}>
        <span className="text-red-900 dark:text-red-400">Cancelled</span></Tooltip>,
      color: "#ea757c",
    },
  }

  const getStatusIcon = (status: string) => {
    if (status === 'new') {
      return STATUSMAP.new;
    } else if (status === 'inprogress') {
      return STATUSMAP.inprogress;
    } else if (status === 'cancelled') {
      return STATUSMAP.cancelled;
    } else {
      return STATUSMAP.new;
    }
  }

  const handleCancelLead = () => {
    setCancelModalVisible(true);
  };

  const handleConvertToDeal = () => {
    setConvertModalVisible(true);
  };

  const handleCancelConfirm = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // API call to cancel lead with reason and comments
      message.success('Lead cancelled successfully');
      setCancelModalVisible(false);
      form.resetFields();
      // Update lead status or refresh data
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertConfirm = async () => {
    try {
      const values = await convertForm.validateFields();
      setLoading(true);
      // API call to convert lead to deal with optional summary
      message.success('Lead converted to deal successfully');
      setConvertModalVisible(false);
      convertForm.resetFields();
      // Redirect to deal page or update UI
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelReasons = [
    'Not interested',
    'Budget constraints',
    'Timeline issues',
    'Competitor selected',
    'No response',
    'Other'
  ];

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
                <Title level={3} className="!mb-0 text-gray-900 dark:text-white">
                  {lead.leadName}
                </Title>
                <Badge 
                  color={getStatusIcon(lead.status).color} 
                  text={getStatusIcon(lead.status).text} 
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
              disabled={lead.status === 'cancelled'}
            >
              Cancel Lead
            </Button>
            <Button
              type="primary"
              icon={<CheckCircle size={16} />}
              onClick={handleConvertToDeal}
              disabled={lead.status === 'cancelled'}
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
              <Text type="secondary" className="text-xs">Created On</Text>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {GlobalDate(lead.createdDate)} by {lead.createdBy || "—"}
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <div>
              <Text type="secondary" className="text-xs">Last Updated</Text>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {GlobalDate(lead.updatedAt)} by {lead.createdBy || "—"}
              </div>
            </div>
          </div>

          {/* Assigned To */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <div>
              <Text type="secondary" className="text-xs">Assigned To</Text>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lead.createdBy || "Unassigned"}
              </div>
            </div>
          </div>
        </div>

        {/* Summary section */}
        {lead.summary && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border-l-3 border-blue-500">
            <Text type="secondary" className="text-xs block mb-1">Summary</Text>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "{lead.summary}"
            </p>
          </div>
        )}
      </Card>

      {/* Cancel Lead Modal */}
      <Modal
        title="Cancel Lead"
        open={cancelModalVisible}
        onOk={handleCancelConfirm}
        onCancel={() => setCancelModalVisible(false)}
        confirmLoading={loading}
        okText="Confirm Cancellation"
        cancelText="Back"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Reason for Cancellation"
            rules={[{ required: true, message: 'Please select a reason for cancellation' }]}
          >
            <Select placeholder="Select a reason">
              {cancelReasons.map(reason => (
                <Option key={reason} value={reason}>{reason}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="comments"
            label="Additional Comments"
            rules={[{ required: true, message: 'Please provide additional comments' }]}
          >
            <TextArea rows={4} placeholder="Please provide details about the cancellation..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Convert To Deal Modal */}
      <Modal
        title="Convert Lead To Deal"
        open={convertModalVisible}
        onOk={handleConvertConfirm}
        onCancel={() => setConvertModalVisible(false)}
        confirmLoading={loading}
        okText="Convert"
        cancelText="Back"
        width={500}
      >
        <Form form={convertForm} layout="vertical">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <Text>You are about to convert this lead into a deal. This action will create a new deal record.</Text>
          </div>
          <Form.Item
            name="summary"
            label="Deal Summary (Optional)"
          >
            <TextArea rows={4} placeholder="Add a summary for the new deal..." />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  )
}