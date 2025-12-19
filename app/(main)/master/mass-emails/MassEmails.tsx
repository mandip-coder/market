'use client';

import { QuillEditor } from '@/components/Editor/QuillEditor';
import FileUploader from '@/components/Fileuploader/Fileuploader';
import Label from '@/components/Label/Label';
import PageHeading from '@/components/PageHeading/PageHeading';
import { Button, Col, DatePicker, Divider, Input, Modal, Radio, Row, Select, Space, Tag, Typography } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import {
  BarChart3,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  Rocket,
  Send,
  User,
  Zap
} from 'lucide-react';
import { memo, useCallback, useMemo, useReducer, useState } from 'react';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

// Type definitions
type ContactStatus = 'subscribed' | 'unsubscribed';

interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: ContactStatus;
}

interface CampaignState {
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  body: string;
  attachments?: UploadFile[];
  scheduledAt?: dayjs.Dayjs | null;
  to: string[];
  cc: string[];
  bcc: string[];
  selectedhealthcares: string[];
}

interface UIState {
  previewVisible: boolean;
  confirmVisible: boolean;
  sendSuccess: boolean;
  loading: boolean;
  showCcBcc: boolean;
}

// Action types for reducer
type CampaignAction =
  | { type: 'UPDATE_FIELD'; field: keyof CampaignState; value: any }
  | { type: 'RESET' };

type UIAction =
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'TOGGLE_CONFIRM' }
  | { type: 'SET_SEND_SUCCESS'; value: boolean }
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'TOGGLE_CC_BCC' };

// Initial states
const initialCampaignState: CampaignState = {
  subject: '',
  fromName: '',
  fromEmail: '',
  replyTo: '',
  body: '',
  attachments: [],
  scheduledAt: null,
  to: [],
  cc: [],
  bcc: [],
  selectedhealthcares: []
};

const initialUIState: UIState = {
  previewVisible: false,
  confirmVisible: false,
  sendSuccess: false,
  loading: false,
  showCcBcc: false
};

// Reducer functions
const campaignReducer = (state: CampaignState, action: CampaignAction): CampaignState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialCampaignState;
    default:
      return state;
  }
};

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'TOGGLE_PREVIEW':
      return { ...state, previewVisible: !state.previewVisible };
    case 'TOGGLE_CONFIRM':
      return { ...state, confirmVisible: !state.confirmVisible };
    case 'SET_SEND_SUCCESS':
      return { ...state, sendSuccess: action.value };
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'TOGGLE_CC_BCC':
      return { ...state, showCcBcc: !state.showCcBcc };
    default:
      return state;
  }
};

// Mock data for contacts (in a real app, this would come from an API)
const mockContacts: Contact[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', company: 'Acme Inc', status: 'subscribed' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', company: 'Tech Corp', status: 'subscribed' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', company: 'Innovate Co', status: 'unsubscribed' },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', company: 'Data Systems', status: 'subscribed' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', company: 'Cloud Services', status: 'unsubscribed' },
  { id: '6', name: 'Diana Prince', email: 'diana@example.com', company: 'Security Ltd', status: 'subscribed' },
  { id: '7', name: 'Ethan Hunt', email: 'ethan@example.com', company: 'Mission Inc', status: 'unsubscribed' },
  { id: '8', name: 'Fiona Green', email: 'fiona@example.com', company: 'Eco Solutions', status: 'subscribed' },
];

// Memoized contact components
const ContactTag = memo(({ contactId, contacts, onClose }: {
  contactId: string;
  contacts: Contact[];
  onClose: (e: any) => void;
}) => {
  const contact = contacts.find(c => c.id === contactId);
  return (
    <Tag
      color={contact?.status === 'subscribed' ? 'green' : 'default'}
      closable={true}
      onClose={onClose}
      style={{ marginRight: 3 }}
    >
      {contact?.name || ''}
    </Tag>
  );
});

ContactTag.displayName = 'ContactTag';

// Email Form Component
const EmailForm = memo(({
  campaign,
  contacts,
  showCcBcc,
  onFieldChange,
  onRecipientChange,
  onCcBccChange,
  onToggleCcBcc,
  onhealthcareChange
}: {
  campaign: CampaignState;
  contacts: Contact[];
  showCcBcc: boolean;
  onFieldChange: (field: keyof CampaignState, value: any) => void;
  onRecipientChange: (selectedIds: string[]) => void;
  onCcBccChange: (field: 'cc' | 'bcc', selectedIds: string[]) => void;
  onToggleCcBcc: () => void;
  onhealthcareChange: (healthcares: string[]) => void;
}) => {
  // Memoized derived state
  const { healthcares } = useMemo(() => {
    const uniqueOrgs = [...new Set(contacts.map(c => c.company).filter(Boolean))];

    return {
      healthcares: uniqueOrgs
    };
  }, [contacts]);

  // Filter contacts based on selected healthcares
  const filteredContacts = useMemo(() => {
    if (campaign.selectedhealthcares.length === 0) {
      return [];
    }
    return contacts.filter(contact =>
      contact.company && campaign.selectedhealthcares.includes(contact.company)
    );
  }, [contacts, campaign.selectedhealthcares]);

  // Filter subscribed contacts based on selected healthcares
  const filteredSubscribedContacts = useMemo(() => {
    if (campaign.selectedhealthcares.length === 0) {
      return [];
    }
    return contacts.filter(contact =>
      contact.company &&
      campaign.selectedhealthcares.includes(contact.company) &&
      contact.status === 'subscribed'
    );
  }, [contacts, campaign.selectedhealthcares]);

  // Check if contact selection should be disabled
  const isContactSelectionDisabled = campaign.selectedhealthcares.length === 0;

  // Memoized select options for filtered contacts
  const selectOptions = useMemo(() =>
    filteredContacts.map(contact => ({
      value: contact.id,
      label: `${contact.name} (${contact.email})`,
      title: `${contact.name} - ${contact.email} - ${contact.company || 'No company'}`,
    })), [filteredContacts]);

  // Memoized functions for getting selected contact IDs
  const getSelectedContactIds = useCallback((emails: string[]) => {
    return emails.map(email => {
      const contact = contacts.find(c => c.email === email);
      return contact ? contact.id : '';
    }).filter(id => id !== '');
  }, [contacts]);

  // Memoized tag render function
  const tagRender = useCallback((props: any) => {
    const { value, onClose } = props;
    return (
      <ContactTag
        contactId={value}
        contacts={contacts}
        onClose={onClose}
      />
    );
  }, [contacts]);

  // Quick selection handlers
  const handleSelectAll = useCallback(() => {
    const allIds = filteredContacts.map(c => c.id);
    onRecipientChange(allIds);
  }, [filteredContacts, onRecipientChange]);

  const handleSelectSubscribed = useCallback(() => {
    const subscribedIds = filteredSubscribedContacts.map(c => c.id);
    onRecipientChange(subscribedIds);
  }, [filteredSubscribedContacts, onRecipientChange]);

  const handleClearSelection = useCallback(() => {
    onRecipientChange([]);
  }, [onRecipientChange]);

  // Memoized popup render function with quick selection buttons
  const popupRender = useCallback((menu: React.ReactElement) => (
    <div>
      {menu}
      <div className='py-3 border-t border-border-header dark:border-dark-border'>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={handleSelectAll}>
            All
          </Button>
          <Button onClick={handleSelectSubscribed}>
            Subscribed
          </Button>
          <Button onClick={handleClearSelection}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  ), [handleSelectAll, handleSelectSubscribed, handleClearSelection]);

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-border-header dark:border-dark-border">
      {/* Email Header */}
      <div className="p-6 border-b border-border-header dark:border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label required text='From Name' />
            <Input
              placeholder="Your name"
              value={campaign.fromName}
              onChange={(e) => onFieldChange('fromName', e.target.value)}
              prefix={<User className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <div>
            <Label required text='From Email' />
            <Input
              placeholder="sender@company.com"
              value={campaign.fromEmail}
              onChange={(e) => onFieldChange('fromEmail', e.target.value)}
              prefix={<Mail className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        <div className="mb-4">

          <Label text='Reply-To (Optional)' />
          <Input
            placeholder="reply@company.com"
            value={campaign.replyTo}
            onChange={(e) => onFieldChange('replyTo', e.target.value)}
            prefix={<Mail className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* healthcare Filter */}
      <div className="p-6 border-b border-border-header dark:border-dark-border">
        <div className="mb-4">

          <Label required text=' Filter by healthcare' />
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select healthcares to filter contacts"
            value={campaign.selectedhealthcares}
            onChange={onhealthcareChange}
            options={healthcares.map(org => ({ value: org, label: org }))}
            allowClear
          />
          {campaign.selectedhealthcares.length > 0 ? (
            <div className="mt-2">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Showing {filteredContacts.length} contacts from {campaign.selectedhealthcares.length} healthcare(s)
              </Text>
            </div>
          ) : (
            <div className="mt-2">
              <Text type="warning" style={{ fontSize: '12px' }}>
                Please select at least one healthcare to view contacts
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Recipients Section */}
      <div className="p-6 border-b border-border-header dark:border-dark-border">
        <div className="mb-4">
          <Label required text='To' />
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder={isContactSelectionDisabled ? "Select healthcares first" : "Select recipients"}
            value={getSelectedContactIds(campaign.to)}
            onChange={onRecipientChange}
            showSearch
            optionLabelProp="label"
            options={selectOptions}
            tagRender={tagRender}
            popupRender={popupRender}
            disabled={isContactSelectionDisabled}
          />
          {isContactSelectionDisabled && (
            <div className="mt-2">
              <Text type="warning" style={{ fontSize: '12px' }}>
                Please select at least one healthcare to choose recipients
              </Text>
            </div>
          )}
        </div>

        {showCcBcc && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Cc
              </label>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder={isContactSelectionDisabled ? "Select healthcares first" : "Select Cc recipients"}
                value={getSelectedContactIds(campaign.cc)}
                onChange={(ids) => onCcBccChange('cc', ids)}
                showSearch
                optionLabelProp="label"
                options={selectOptions}
                tagRender={tagRender}
                popupRender={popupRender}
                disabled={isContactSelectionDisabled}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Bcc
              </label>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder={isContactSelectionDisabled ? "Select healthcares first" : "Select Bcc recipients"}
                value={getSelectedContactIds(campaign.bcc)}
                onChange={(ids) => onCcBccChange('bcc', ids)}
                showSearch
                optionLabelProp="label"
                options={selectOptions}
                tagRender={tagRender}
                popupRender={popupRender}
                disabled={isContactSelectionDisabled}
              />
            </div>
          </>
        )}

        {!showCcBcc && (
          <Button
            type="link"
            size="small"
            onClick={onToggleCcBcc}
            className="p-0 h-auto text-blue-600 dark:text-blue-400"
            disabled={isContactSelectionDisabled}
          >
            Cc/Bcc
          </Button>
        )}
      </div>

      {/* Subject */}
      <div className="p-6 border-b border-border-header dark:border-dark-border">
        <Input
          placeholder="Subject"
          value={campaign.subject}
          onChange={(e) => onFieldChange('subject', e.target.value)}
          size="large"
          className="text-lg font-medium"
        />
      </div>

      {/* Email Body */}
      <div className="p-6 border-b border-border-header dark:border-dark-border">
        <QuillEditor
          value={campaign.body}
          onChange={(value: string) => onFieldChange('body', value)}
          placeholder="Write your email content here..."
        />
      </div>

      {/* Attachments */}
      <div className="p-6 border-b border-border-header dark:border-dark-border">
        <FileUploader maxCount={10} />
      </div>

      {/* Sending Options */}
      <div className="p-6 border-b border-border-header dark:border-dark-border">
        <div className="mb-4">
          <Radio.Group
            value={campaign.scheduledAt ? 'scheduled' : 'immediate'}
            onChange={(e) => {
              if (e.target.value === 'immediate') {
                onFieldChange('scheduledAt', null);
              } else {
                onFieldChange('scheduledAt', dayjs());
              }
            }}
          >
            <Space orientation="vertical">
              <Radio value="immediate">
                <div>
                  <div className="font-medium">Send Immediately</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Campaign will be sent right away</div>
                </div>
              </Radio>
              <Radio value="scheduled">
                <div>
                  <div className="font-medium">Schedule for Later</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Choose a specific date and time</div>
                  {campaign.scheduledAt && (
                    <DatePicker
                      showTime
                      value={campaign.scheduledAt}
                      onChange={(date) => onFieldChange('scheduledAt', date)}
                    />
                  )}
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </div>
      </div>
    </div>
  );
});

EmailForm.displayName = 'EmailForm';

// Preview Modal Component
const PreviewModal = memo(({
  visible,
  onCancel,
  campaign
}: {
  visible: boolean;
  onCancel: () => void;
  campaign: CampaignState;
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Eye className="text-blue-500 w-5 h-5" />
          Email Preview
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>
      ]}
      width={800}
    >
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-border-header dark:border-dark-border">
        <div className="bg-white dark:bg-black p-6 rounded-lg">
          <div className="mb-4 pb-4 border-b border-border-header dark:border-dark-border">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[80px]">Subject:</span>
              <span className="font-medium text-slate-900 dark:text-white flex-1">{campaign.subject}</span>
            </div>
            <div className="flex items-start gap-2 mb-3">
              <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[80px]">From:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {campaign.fromName} &lt;{campaign.fromEmail}&gt;
              </span>
            </div>
            <div className="flex items-start gap-2 mb-3">
              <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[80px]">To:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {campaign.to.length > 0 ? campaign.to.join(', ') : 'No recipients'}
              </span>
            </div>
            {campaign.cc.length > 0 && (
              <div className="flex items-start gap-2 mb-3">
                <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[80px]">Cc:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {campaign.cc.join(', ')}
                </span>
              </div>
            )}
            {campaign.bcc.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[80px]">Bcc:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {campaign.bcc.join(', ')}
                </span>
              </div>
            )}
          </div>
          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: campaign.body }}
          />
        </div>
      </div>
    </Modal>
  );
});

PreviewModal.displayName = 'PreviewModal';

// Confirmation Modal Component
const ConfirmationModal = memo(({
  visible,
  onCancel,
  onConfirm,
  loading,
  campaign,
  finalSendCount
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
  campaign: CampaignState;
  finalSendCount: number;
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Zap className="text-amber-500 w-5 h-5" />
          Confirm Campaign Launch
        </div>
      }
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Send Now"
      cancelText="Cancel"
    >
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Once sent, this action cannot be undone. Please review the details below.
      </p>
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-border-header dark:border-dark-border">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Subject:</span>
            <span className="font-medium text-slate-900 dark:text-white">{campaign.subject}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Recipients:</span>
            <span className="font-medium text-slate-900 dark:text-white">{finalSendCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Schedule:</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {campaign.scheduledAt ? campaign.scheduledAt.format('MMM DD, YYYY HH:mm') : 'Send Immediately'}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
});

ConfirmationModal.displayName = 'ConfirmationModal';

// Success Result Component
const SuccessResult = memo(({
  onReset,
  finalSendCount
}: {
  onReset: () => void;
  finalSendCount: number;
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-3xl mx-auto overflow-hidden bg-white dark:bg-black rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <CheckCircle className="text-5xl text-white" />
          </div>
          <Title level={2} className="text-white mb-2">Campaign Sent Successfully!</Title>
          <Text className="text-green-100">
            Your email has been sent to <span className="font-semibold">{finalSendCount} recipients</span>
          </Text>
        </div>
        <div className="p-8">
          <Row gutter={16} className="mb-8">
            <Col span={8}>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Send className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{finalSendCount}</div>
                <Text className="text-sm text-slate-600 dark:text-slate-400">Emails Sent</Text>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">~{Math.ceil(finalSendCount / 100)}m</div>
                <Text className="text-sm text-slate-600 dark:text-slate-400">Processing Time</Text>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">100%</div>
                <Text className="text-sm text-slate-600 dark:text-slate-400">Delivery Rate</Text>
              </div>
            </Col>
          </Row>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="primary"
              icon={<BarChart3 />}
            >
              View Analytics
            </Button>
            <Button
              icon={<Rocket />}
              onClick={onReset}
            >
              Create New Campaign
            </Button>
          </div>
          <Divider />
          <div className="text-center">
            <Text className="text-sm text-slate-600 dark:text-slate-400">
              You can track opens, clicks, and deal in the Campaign Analytics dashboard
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
});

SuccessResult.displayName = 'SuccessResult';

// Main Component
const MassEmailSendingPage = () => {
  // Use reducers for state management
  const [campaign, dispatchCampaign] = useReducer(campaignReducer, initialCampaignState);
  const [ui, dispatchUI] = useReducer(uiReducer, initialUIState);

  // Mock data for contacts (in a real app, this would come from an API)
  const [contacts] = useState<Contact[]>(mockContacts);

  // Memoized final send count
  const finalSendCount = useMemo(() => campaign.to.length, [campaign.to.length]);

  // Memoized handlers
  const handleFieldChange = useCallback((field: keyof CampaignState, value: any) => {
    dispatchCampaign({ type: 'UPDATE_FIELD', field, value });
  }, []);

  const handleRecipientChange = useCallback((selectedIds: string[]) => {
    const selectedEmails = selectedIds.map(id => {
      const contact = contacts.find(c => c.id === id);
      return contact ? contact.email : '';
    });
    dispatchCampaign({ type: 'UPDATE_FIELD', field: 'to', value: selectedEmails });
  }, [contacts]);

  const handleCcBccChange = useCallback((field: 'cc' | 'bcc', selectedIds: string[]) => {
    const selectedEmails = selectedIds.map(id => {
      const contact = contacts.find(c => c.id === id);
      return contact ? contact.email : '';
    });
    dispatchCampaign({ type: 'UPDATE_FIELD', field, value: selectedEmails });
  }, [contacts]);

  const handlehealthcareChange = useCallback((healthcares: string[]) => {
    dispatchCampaign({ type: 'UPDATE_FIELD', field: 'selectedhealthcares', value: healthcares });
    // Clear selected recipients when healthcare filter changes
    dispatchCampaign({ type: 'UPDATE_FIELD', field: 'to', value: [] });
    dispatchCampaign({ type: 'UPDATE_FIELD', field: 'cc', value: [] });
    dispatchCampaign({ type: 'UPDATE_FIELD', field: 'bcc', value: [] });
  }, []);

  const handleToggleCcBcc = useCallback(() => {
    dispatchUI({ type: 'TOGGLE_CC_BCC' });
  }, []);

  const handleTogglePreview = useCallback(() => {
    dispatchUI({ type: 'TOGGLE_PREVIEW' });
  }, []);

  const handleToggleConfirm = useCallback(() => {
    dispatchUI({ type: 'TOGGLE_CONFIRM' });
  }, []);

  // Handle sending
  const handleSend = useCallback(async () => {
    dispatchUI({ type: 'SET_LOADING', value: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      dispatchUI({ type: 'SET_SEND_SUCCESS', value: true });
      dispatchUI({ type: 'TOGGLE_CONFIRM' });
      toast.success('Email campaign sent successfully!');
    } catch (error) {
      toast.error('Failed to send email campaign');
    } finally {
      dispatchUI({ type: 'SET_LOADING', value: false });
    }
  }, []);

  // Reset form
  const handleReset = useCallback(() => {
    dispatchUI({ type: 'SET_SEND_SUCCESS', value: false });
    dispatchCampaign({ type: 'RESET' });
  }, []);

  if (ui.sendSuccess) {
    return <SuccessResult onReset={handleReset} finalSendCount={finalSendCount} />;
  }

  return (
    <>
      {/* Email Form */}
      <EmailForm
        campaign={campaign}
        contacts={contacts}
        showCcBcc={ui.showCcBcc}
        onFieldChange={handleFieldChange}
        onRecipientChange={handleRecipientChange}
        onCcBccChange={handleCcBccChange}
        onToggleCcBcc={handleToggleCcBcc}
        onhealthcareChange={handlehealthcareChange}
      />

      {/* Actions */}
      <div className="p-6 flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            icon={<Eye />}
            onClick={handleTogglePreview}
            disabled={campaign.selectedhealthcares.length === 0}
          >
            Preview
          </Button>
          <Button
            icon={<Send />}
            disabled={campaign.selectedhealthcares.length === 0}
          >
            Send Test Email
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset}>
            Discard
          </Button>
          <Button
            type="primary"
            icon={<Zap />}
            onClick={handleToggleConfirm}
            disabled={finalSendCount === 0 || campaign.selectedhealthcares.length === 0}
          >
            Send Campaign
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        visible={ui.previewVisible}
        onCancel={handleTogglePreview}
        campaign={campaign}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={ui.confirmVisible}
        onCancel={handleToggleConfirm}
        onConfirm={handleSend}
        loading={ui.loading}
        campaign={campaign}
        finalSendCount={finalSendCount}
      />
    </>
  );
};

export default MassEmailSendingPage;
