'use client';
import AttachmentModal from '@/components/shared/modals/AttachmentModal';
import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import { QuillEditor } from '@/components/Editor/QuillEditor';
import InputBox from '@/components/Input/Input';
import Label from '@/components/Label/Label';
import ModalWrapper from '@/components/Modal/Modal';
import EmailCard from '@/components/shared/modals/EmailCard';
import RecipientField from '@/components/shared/modals/RecipientField';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EyeOutlined,
  MailOutlined,
  PaperClipOutlined,
  SendOutlined
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Input,
  Modal,
  Tag,
  Tooltip
} from 'antd';
import dayjs from 'dayjs';
import { Form, Formik, FormikProps } from 'formik';
import { File, Mail, Plus, Search, FileText, FileSpreadsheet, Image, Archive } from 'lucide-react';
import { cloneElement, ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { Email } from '../../../lib/types';
import ContactOptionsRender from '../ContactOptionsRender';
import { EmptyState } from './EmptyState';
import { EmailFormValues } from '@/context/store/leadsStore';
import { SendEmailPayload } from '@/app/(main)/leads/services';
import { UseMutationResult } from '@tanstack/react-query';

export const FILE_ICON_MAP: Record<string, ReactElement> = {
  pdf: <FileText className="text-red-500" />,
  doc: <FileText className="text-blue-500" />,
  docx: <FileText className="text-blue-500" />,
  xls: <FileSpreadsheet className="text-green-500" />,
  xlsx: <FileSpreadsheet className="text-green-500" />,
  jpg: <Image className="text-purple-500" />,
  jpeg: <Image className="text-purple-500" />,
  png: <Image className="text-purple-500" />,
  gif: <Image className="text-purple-500" />,
  svg: <Image className="text-purple-500" />,
  zip: <Archive className="text-orange-500" />,
  rar: <Archive className="text-orange-500" />,
  default: <File className="text-gray-500" />
};

const getFileIcon = (filename: string, className?: string): ReactElement => {
  const extension = filename?.split('.')?.pop()?.toLowerCase() || '';
  const icon = FILE_ICON_MAP[extension] || FILE_ICON_MAP.default;
  return className ? cloneElement(icon, { className } as any) : icon;
};

interface EmailModalProps {
  emails: Email[];
  sendEmail: UseMutationResult<Email, Error, SendEmailPayload, unknown>;
  dealUUID?: string;
  leadUUID?: string;
  contactPersons: HCOContactPerson[];
}

export const EmailModal: React.FC<EmailModalProps> = ({
  emails,
  sendEmail,
  dealUUID,
  leadUUID,
  contactPersons
}) => {
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [isAttachmentModalVisible, setIsAttachmentModalVisible] = useState(false);
  const [isViewEmailModalVisible, setIsViewEmailModalVisible] = useState(false);
  const [viewingEmail, setViewingEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);

  const formikRef = useRef<FormikProps<typeof initialValues>>(null);

  const validationSchema = Yup.object({
    leadUUID: leadUUID ? Yup.string().required('Lead UUID is required') : Yup.string(),
    dealUUID: dealUUID ? Yup.string().required('Deal UUID is required') : Yup.string(),
    recipients: Yup.array().min(1, 'At least one recipient is required'),
    ccRecipients: Yup.array(),
    bccRecipients: Yup.array(),
    subject: Yup.string().required('Subject is required'),
    body: Yup.string()
      .required('Body is required')
      .test('not-empty-html', 'Body is required', (value) => {
        if (!value) return false;
        const textContent = value.replace(/<[^>]*>/g, '').trim();
        return textContent.length > 0;
      }),
    attachments: Yup.array()
  });

  const initialValues: EmailFormValues = {
    leadUUID: leadUUID || "",
    dealUUID: dealUUID || "",
    recipients: [],
    ccRecipients: [],
    bccRecipients: [],
    subject: '',
    body: '',
    attachments: []
  };

  // Memoize contact options to avoid recreating on every render
  const contactOptions = useMemo(() =>
    contactPersons
      .filter(contact => contact.email)
      .map(contact => ({
        value: contact.hcoContactUUID,
        label: contact.email,
        contact,
      })),
    [contactPersons]
  );

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
        <div className="space-y-3">
          {filteredEmails.length ? filteredEmails.map(email => (
            <EmailCard
              key={email.emailUUID}
              email={email}
              isSelected={selectedEmailId === email.emailUUID}
              onSelect={() => setSelectedEmailId(email.emailUUID === selectedEmailId ? null : email.emailUUID)}
              onView={() => {
                setViewingEmail(email);
                setIsViewEmailModalVisible(true);
              }}
            />
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
            const formattedValues = {
              ...values,
              ...(leadUUID && { leadUUID }),
              ...(dealUUID && { dealUUID }),
            };

            sendEmail.mutate(formattedValues, {
              onSuccess: () => {
                handleCloseModal();
              },
            });
          }}
        >
          {({ values, setFieldValue, handleSubmit, isSubmitting, errors, touched, setFieldTouched }) => {
            return (
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
                    name='recipients'
                    mode="multiple"
                    className="w-full"
                    hideSelected
                    showSearch={{
                      optionFilterProp: "label"
                    }}
                    options={contactOptions}
                    optionRender={(option) => <ContactOptionsRender option={option} />}
                  />

                  <RecipientField
                    show={showCC}
                    onClose={() => setShowCC(false)}
                    name="ccRecipients"
                    label="CC Recipients"
                    contactPersons={contactPersons}
                    colorScheme="blue"
                  />

                  <RecipientField
                    show={showBCC}
                    onClose={() => setShowBCC(false)}
                    name="bccRecipients"
                    label="BCC Recipients"
                    contactPersons={contactPersons}
                    colorScheme="purple"
                  />

                  <InputBox
                    name='subject'
                    label='Subject'
                    required
                    placeholder="Enter subject..."
                  />

                  <div className='relative'>
                    <Label text='Body' required />
                    <QuillEditor
                      value={values.body}
                      onBlur={() => setFieldTouched('body', true)}
                      onChange={(value) => setFieldValue('body', value)}
                      placeholder="Write your email content here..."
                      status={errors.body && touched.body ? 'error' : undefined}
                    />
                    {errors.body && touched.body && <span className="field-error">{errors.body}</span>}
                  </div>

                  <Button
                    type='default'
                    icon={<PaperClipOutlined />}
                    onClick={() => setIsAttachmentModalVisible(true)}
                    className="border-dashed"
                  >
                    Add Attachments {values.attachments.length > 0 && `(${values.attachments.length})`}
                  </Button>

                  {values.attachments.length > 0 && (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50 mb-4">
                      <div className="flex flex-wrap gap-2">
                        {values.attachments.map((attachment, index) => (
                          <Tag
                            key={index}
                            closable
                            color="blue"
                            className="!flex !items-center !gap-2 !px-3 !py-2 !text-sm"
                            closeIcon={<CloseOutlined />}
                            onClose={() => {
                              const newAttachments = values.attachments.filter((_, i) => i !== index);
                              setFieldValue('attachments', newAttachments);
                            }}
                            icon={getFileIcon(attachment.filename)}
                          >
                            {attachment.filename}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 ">
                  <Button onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={sendEmail.isPending}
                    disabled={sendEmail.isPending || isSubmitting}
                    icon={<SendOutlined />}
                    className="shadow-lg"
                  >
                    Send Email
                  </Button>
                </div>
              </Form>
            )
          }}
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
                  <span>{dayjs(viewingEmail.sentAt).format('D MMM, YYYY h:mm A')}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recipients</h3>
              <div className="flex flex-wrap gap-2">
                {viewingEmail.recipients.map((recipient: string, idx: number) => (
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

      <AttachmentModal
        visible={isAttachmentModalVisible}
        onClose={() => setIsAttachmentModalVisible(false)}
        onSelect={(attachments) => {
          setIsAttachmentModalVisible(false)
          const existingAttachments = formikRef.current?.values.attachments || [];
          formikRef.current?.setFieldValue('attachments', [...existingAttachments, ...attachments]);
        }}

      />
    </>
  );
};

export default EmailModal;
