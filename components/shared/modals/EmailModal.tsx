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
  SearchOutlined
} from '@ant-design/icons';
import {
  App,
  Avatar, Badge,
  Button,
  Input,
  Modal,
  Rate,
  Tag
} from 'antd';
import dayjs from 'dayjs';
import { Form, Formik, FormikProps } from 'formik';
import { File, Mail, Plus } from 'lucide-react';
import { cloneElement, memo, ReactElement, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { Email } from '../../../lib/types';
import { EmptyState } from './EmptyState';
import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';
import ContactOptionsRender from '../ContactOptionsRender';

// FILE_ICON_MAP - you'll need to import this from AttachmentModal or define it
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

// Helper function to safely get file icon
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
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const { message } = App.useApp();

  interface EmailFormValues {
    leadUUID: number;
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
    leadUUID: 1,
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

  return (<>
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-0">Email history</h3>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsEmailModalVisible(true)}
          className="flex items-center gap-1"
        >
          Compose Email
        </Button>
      </div>

      {emails.length > 0 && (
        <div className="mb-6">
          <Input
            placeholder="Search emails..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            className="w-full max-w-md"
          />
        </div>
      )}

      {filteredEmails.length ? filteredEmails.map(email => (
        <div
          key={email.id}
          className={`border rounded-lg p-4 transition-all cursor-pointer ${selectedEmailId === email.id
            ? 'border-blue-400 bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:shadow-md'
            }`}
          onClick={() => setSelectedEmailId(email.id === selectedEmailId ? null : email.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3 flex-1">
              <Avatar size={40} icon={<MailOutlined />} className="bg-blue-500" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{email.subject}</h4>
                  <Badge status="success" text="Sent" />
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  To: {email.recipients.join(', ')}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <CheckCircleOutlined />
                  <span>Delivered</span>
                  <span>•</span>
                  <ClockCircleOutlined />
                  <span>{dayjs(email.sentAt).format('MMM D, YYYY h:mm A')}</span>
                </div>
                <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: email.body.substring(0, 150) + '...' }} />
              </div>
            </div>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setViewingEmail(email);
                setIsViewEmailModalVisible(true);
              }}
            >
              View
            </Button>
          </div>
        </div>
      )) : (
        <EmptyState 
          searchQuery={searchTerm} 
          onClearSearch={() => setSearchTerm('')} 
          onAction={() => setIsEmailModalVisible(true)}
          icon={Mail}
          emptyTitle="No Emails"
          emptyDescription="No emails have been sent yet."
          actionLabel="Send First Email"
        />
      )}

      <ModalWrapper
        title={<div className="text-xl font-semibold">Compose Email</div>}
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
            message.success('Email sent successfully!');
            handleCloseModal();
          }}
        >
          {({ values, setFieldValue, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <div className="flex items-center justify-end">
                <div className="text-xs text-gray-500 space-x-2">
                  {!showCC && <Button type="default" size="small" onClick={() => setShowCC(true)}>CC</Button>}
                  {!showBCC && <Button type="default" size="small" onClick={() => setShowBCC(true)}>BCC</Button>}
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
                  optionLabelProp="label"
                  options={contacts.map(contact => ({
                    value: contact.hcoUUID,
                    label: contact.fullName,
                    title: contact.fullName,
                    contact,
                  }))}
                  optionRender={(option) => <ContactOptionsRender option={option} />}
                />

                {showCC && (
                  <div>
                    <div className="flex items-center justify-between">
                      <Label text='CC Recipients' />
                      <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setShowCC(false)} />
                    </div>
                    <CustomSelect
                      hideSelected
                      name='ccRecipients'
                      mode="multiple"
                      className="w-full"
                      optionLabelProp="label"
                      options={contacts.map(contact => ({
                        value: contact.hcoUUID,
                        label: contact.fullName,
                        title: contact.fullName,
                        contact,
                      }))}
                      optionRender={(option) => {
                        const contact = option.data.contact;
                        return (
                          <div className="flex items-center justify-between py-1">
                            <div>
                              <div className="font-medium">{contact.fullName}</div>
                              <div className="text-xs text-gray-500">{contact.fullName}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Rate disabled defaultValue={contact.rating} style={{ fontSize: 12 }} />
                              <span className="text-xs text-gray-500">{contact.rating}/5</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </div>
                )}

                {showBCC && (
                  <div>
                    <div className="flex items-center justify-between">
                      <Label text='BCC Recipients' />
                      <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setShowBCC(false)} />
                    </div>
                    <CustomSelect
                      hideSelected
                      name='bccRecipients'
                      mode="multiple"
                      className="w-full"
                      optionLabelProp="label"
                      options={contacts.map(contact => ({
                        value: contact.email,
                        label: contact.email,
                        title: contact.fullName,
                        contact,
                      }))}
                      optionRender={(option) => {
                        const contact = option.data.contact;
                        return (
                          <div className="flex items-center justify-between py-1">
                            <div>
                              <div className="font-medium">{contact.fullName}</div>
                              <div className="text-xs text-gray-500">{contact.fullName}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Rate disabled defaultValue={contact.rating} style={{ fontSize: 12 }} />
                              <span className="text-xs text-gray-500">{contact.rating}/5</span>
                            </div>
                          </div>
                        );
                      }}
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

                <div className="flex items-center justify-between">
                  {AttachmentModalComponent && (
                    <Button
                      type='primary'
                      variant='solid'
                      icon={<PaperClipOutlined />}
                      onClick={() => setIsAttachmentModalVisible(true)}
                    >
                      Attachments
                    </Button>
                  )}
                </div>

                {values.attachments.length > 0 && (
                  <div className="border rounded-lg p-2 max-h-24 overflow-y-auto">
                    <div className="flex flex-wrap gap-1">
                      {values.attachments.map((attachment, index) => (
                        <Tag
                          key={index}
                          closable
                          variant='outlined'
                          style={{ padding:"10px" }}
                          closeIcon={<CloseOutlined className='!text-sm'/>}
                          onClose={() => {
                            const newAttachments = values.attachments.filter((_, i) => i !== index);
                            setFieldValue('attachments', newAttachments);
                          }}
                          icon={getFileIcon(attachment, 'text-lg')}
                        >
                          {attachment.split('/').pop()}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={handleCloseModal}>Cancel</Button>
                <Button type="primary" htmlType="submit" icon={<MailOutlined />}>
                  Send Email
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </ModalWrapper>

      <Modal
        title={<div className="flex items-center gap-2"><MailOutlined />Email Details</div>}
        open={isViewEmailModalVisible}
        onCancel={() => setIsViewEmailModalVisible(false)}
        footer={null}
        width={700}
      >
        {viewingEmail && (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-2">{viewingEmail.subject}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircleOutlined /> Delivered
                </span>
                <span className="flex items-center gap-1">
                  <ClockCircleOutlined /> {dayjs(viewingEmail.sentAt).format('MMM D, YYYY h:mm A')}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-1">To:</h3>
              <p>{viewingEmail.recipients.join(', ')}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Message:</h3>
              <div className="p-4 bg-gray-50 rounded-lg" dangerouslySetInnerHTML={{ __html: viewingEmail.body }} />
            </div>
          </div>
        )}
      </Modal>

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
    </div>
  </>
  );
};

export default EmailModal;
