'use client';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import { QuillEditor } from '@/components/Editor/QuillEditor';
import InputBox from '@/components/Input/Input';
import Label from '@/components/Label/Label';
import ModalWrapper from '@/components/Modal/Modal';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EyeOutlined,
  MailOutlined,
  PaperClipOutlined,
  SearchOutlined,
  SendOutlined
} from '@ant-design/icons';
import {
  App,
  Avatar,
  Badge,
  Button,
  Input,
  Modal,
  Tag,
  Tooltip
} from 'antd';
import dayjs from 'dayjs';
import { Form, Formik, FormikProps } from 'formik';
import { File, Mail, Plus, Search } from 'lucide-react';
import { cloneElement, memo, ReactElement, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { Email } from '../../../lib/types';
import { EmptyState } from './EmptyState';
import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';
import ContactOptionsRender from '../ContactOptionsRender';
import { toast } from 'react-toastify';

export const FILE_ICON_MAP: Record<string, ReactElement> = {
  pdf: <File className="text-red-500" />,
  doc: <File className="text-blue-500" />,
  docx: <File className="text-blue-500" />,
  xls: <File className="text-green-500" />,
  xlsx: <File className="text-green-500" />,
  jpg: <File className="text-purple-500" />,
  jpeg: <File className="text-purple-500" />,
  png: <File className="text-purple-500" />,
  default: <File className="text-gray-500" />
};

const getFileIcon = (filename: string, className?: string): ReactElement => {
  const extension = filename?.split('.')?.pop()?.toLowerCase() || '';
  const icon = FILE_ICON_MAP[extension] || FILE_ICON_MAP.default;
  return className ? cloneElement(icon, { className } as any) : icon;
};

interface EmailModalProps {
  emails: Email[];
  sendEmail: (data: { subject: string; body: string }, recipients: string[]) => void;
  contacts: HCOContactPerson[];
  AttachmentModalComponent?: React.ComponentType<{
    visible: boolean;
    onClose: () => void;
    onSelect: (attachments: string[]) => void;
  }>;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  emails,
  sendEmail,
  contacts,
  AttachmentModalComponent
}) => {
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [isAttachmentModalVisible, setIsAttachmentModalVisible] = useState(false);
  const [isViewEmailModalVisible, setIsViewEmailModalVisible] = useState(false);
  const [viewingEmail, setViewingEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);

  interface EmailFormValues {
    leadUUID: string;
    dealUUID: string;
    toRecipients: string[];
    ccRecipients: string[];
    bccRecipients: string[];
    subject: string;
    body: string;
    attachments: string[]
  }
  const formikRef = useRef<FormikProps<EmailFormValues>>(null);

  const validationSchema = Yup.object({
    leadUUID: Yup.number(),
    toRecipients: Yup.array().min(1, 'At least one recipient is required'),
    ccRecipients: Yup.array(),
    bccRecipients: Yup.array(),
    subject: Yup.string().required('Subject is required'),
    body: Yup.string().required('Message is required'),
    attachments: Yup.array()
  });

  const initialValues = {
    leadUUID: "",
    dealUUID: "",
    toRecipients: [],
    ccRecipients: [],
    bccRecipients: [],
    subject: '',
    body: '',
    attachments: []
  };

  const filteredEmails = useMemo(() => {
    if (!searchTerm) return emails;

    return emails.filter(email =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, emails]);

  const handleCloseModal = () => {
    setIsEmailModalVisible(false);
    setShowCC(false);
    setShowBCC(false);
    setSelectedEmailId(null);
    formikRef.current?.resetForm();
    setSearchTerm('');
  }

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-0">
            Emails
          </h3>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsEmailModalVisible(true)}
            className="flex items-center gap-1"
          >
            Compose Email
          </Button>
        </div>

        {/* Search Bar */}
        {emails.length > 0 && (
          <div className="mb-6">
            <Input
              placeholder="Search follow ups by subject or remark..."
              prefix={<Search size={16} className="text-gray-400" />}
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              className="w-full max-w-md"
              allowClear
              onClear={() => setSearchTerm('')}
            />
          </div>
        )}

        {/* Email List */}
        <div className="space-y-4">
          {filteredEmails.length ? filteredEmails.map(email => (
            <div
              key={email.emailUUID}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-200 overflow-hidden ${selectedEmailId === email.emailUUID
                ? 'border-blue-500 shadow-lg ring-2 ring-blue-100 dark:ring-blue-900'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                }`}
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => setSelectedEmailId(email.emailUUID === selectedEmailId ? null : email.emailUUID)}
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <MailOutlined className="text-white text-xl" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {email.subject}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            status="success"
                            text={<span className="text-xs font-medium text-green-700 dark:text-green-400">Sent</span>}
                          />
                          <span className="text-xs text-gray-400">•</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <ClockCircleOutlined />
                            <span>{dayjs(email.sentAt).format('MMM D, YYYY h:mm A')}</span>
                          </div>
                        </div>
                      </div>
                      <Tooltip title="View full email">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingEmail(email);
                            setIsViewEmailModalVisible(true);
                          }}
                          className="flex-shrink-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        />
                      </Tooltip>
                    </div>

                    {/* Recipients */}
                    <div className="mb-3 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-0.5">To:</span>
                        <div className="flex-1 flex flex-wrap gap-1">
                          {email.recipients.map((recipient, idx) => (
                            <Tag
                              key={idx}
                              className="m-0 text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            >
                              {recipient}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div
                      className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 pl-3 border-l-2 border-gray-200 dark:border-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: email.body.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
                      }}
                    />

                    {/* Delivery Status */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                        <CheckCircleOutlined className="text-green-600 dark:text-green-400 text-xs" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <EmptyState
              searchQuery={searchTerm}
              onClearSearch={() => setSearchTerm('')}
              onAction={() => setIsEmailModalVisible(true)}
              icon={Mail}
              emptyTitle="No Emails Found"
              emptyDescription={searchTerm ? "No emails match your search criteria." : "No emails have been sent yet."}
              actionLabel="Send First Email"
            />
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <ModalWrapper
        title="Compose Email"
        open={isEmailModalVisible}
        onCancel={handleCloseModal}
        width={900}
        maskClosable={false}
        footer={null}
      >
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            const allRecipients = [...values.toRecipients, ...values.ccRecipients, ...values.bccRecipients];
            sendEmail({ subject: values.subject, body: values.body }, allRecipients);
            toast.success('Email sent successfully!');
            handleCloseModal();
          }}
        >
          {({ values, setFieldValue, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <div className="flex items-center justify-end">
                <div className="flex gap-2">
                  {!showCC && (
                    <Button
                      type="dashed"
                      size="small"
                      onClick={() => setShowCC(true)}
                      className="text-xs"
                    >
                      + CC
                    </Button>
                  )}
                  {!showBCC && (
                    <Button
                      type="dashed"
                      size="small"
                      onClick={() => setShowBCC(true)}
                      className="text-xs"
                    >
                      + BCC
                    </Button>
                  )}
                </div>
              </div>

              <div className='space-y-4'>
                <CustomSelect
                  label='To'
                  required
                  name='toRecipients'
                  mode="multiple"
                  className="w-full"
                  hideSelected
                  showSearch={{
                    optionFilterProp: "label"
                  }}
                  options={contacts.map(contact => ({
                    value: contact.hcoContactUUID,
                    label: contact.email,
                    contact,
                  }))}
                  optionRender={(option) => <ContactOptionsRender option={option} />}
                />

                {showCC && (
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <Label text='CC Recipients' />
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => setShowCC(false)}
                        className="hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      />
                    </div>
                    <CustomSelect
                      hideSelected
                      name='ccRecipients'
                      mode="multiple"
                      className="w-full"
                      optionLabelProp="label"
                      options={contacts.map(contact => ({
                        value: contact.hcoContactUUID,
                        label: contact.email,
                        contact,
                      }))}
                      optionRender={(option) => <ContactOptionsRender option={option} />}
                    />
                  </div>
                )}

                {showBCC && (
                  <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <Label text='BCC Recipients' />
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => setShowBCC(false)}
                        className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
                      />
                    </div>
                    <CustomSelect
                      hideSelected
                      name='bccRecipients'
                      mode="multiple"
                      className="w-full"
                      optionLabelProp="label"
                      options={contacts.map(contact => ({
                        value: contact.hcoContactUUID,
                        label: contact.email,
                        contact,
                      }))}
                      optionRender={(option) => <ContactOptionsRender option={option} />}
                    />
                  </div>
                )}

                <InputBox
                  name='subject'
                  label='Subject'
                  required
                  placeholder="Enter subject..."
                />

                <div>
                  <Label text='Body' required />
                  <QuillEditor
                    value={values.body}
                    onChange={(value) => setFieldValue('body', value)}
                    placeholder="Write your email content here..."
                  />
                </div>

                {AttachmentModalComponent && (
                  <Button
                    type='default'
                    icon={<PaperClipOutlined />}
                    onClick={() => setIsAttachmentModalVisible(true)}
                    className="border-dashed"
                  >
                    Add Attachments {values.attachments.length > 0 && `(${values.attachments.length})`}
                  </Button>
                )}

                {values.attachments.length > 0 && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex flex-wrap gap-2">
                      {values.attachments.map((attachment, index) => (
                        <Tag
                          key={index}
                          closable
                          color="blue"
                          className="flex items-center gap-2 px-3 py-2 text-sm"
                          closeIcon={<CloseOutlined />}
                          onClose={() => {
                            const newAttachments = values.attachments.filter((_, i) => i !== index);
                            setFieldValue('attachments', newAttachments);
                          }}
                          icon={getFileIcon(attachment)}
                        >
                          {attachment.split('/').pop()}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  className="shadow-lg"
                >
                  Send Email
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </ModalWrapper>

      {/* View Email Modal */}
      <Modal
        title="Email Details"
        open={isViewEmailModalVisible}
        onCancel={() => setIsViewEmailModalVisible(false)}
        footer={null}
        width={800}
      >
        {viewingEmail && (
          <div className="space-y-6 pt-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {viewingEmail.subject}
              </h2>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <CheckCircleOutlined className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Delivered</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ClockCircleOutlined />
                  <span>{dayjs(viewingEmail.sentAt).format('MMM D, YYYY h:mm A')}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recipients</h3>
              <div className="flex flex-wrap gap-2">
                {viewingEmail.recipients.map((recipient, idx) => (
                  <Tag key={idx} color="blue" className="m-0">
                    {recipient}
                  </Tag>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Message</h3>
              <div
                className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: viewingEmail.body }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Attachment Modal */}
      {AttachmentModalComponent && (
        <AttachmentModalComponent
          visible={isAttachmentModalVisible}
          onClose={() => setIsAttachmentModalVisible(false)}
          onSelect={(attachments) => {
            setIsAttachmentModalVisible(false)
            const existingAttachments = formikRef.current?.values.attachments || [];
            formikRef.current?.setFieldValue('attachments', [...existingAttachments, ...attachments]);
          }}
        />
      )}
    </>
  );
};

export default EmailModal;
