import { Button, Checkbox, Drawer, Typography } from 'antd';
import { Form, Formik } from 'formik';
import { Paperclip, Send } from 'lucide-react';
import React, { useState } from 'react';
import * as Yup from 'yup';

import CustomSelect from '@/components/CustomSelect/CustomSelect';
import { QuillEditor } from '@/components/Editor/QuillEditor';
import Input from '@/components/Input/Input';
import Label from '@/components/Label/Label';

import AttachmentModal from '../../deals/components/modals/AttachmentModal';
import AttachmentsList from './AttachmentsList';
import RecipientSelectionDrawer from './CampaignsFilters';
import SelectedRecipientsPreview from './SelectedRecipientsPreview';

import { CampaignFilters } from '../types';
import CcBccSection from './CcBccSection';

const { Title, Text } = Typography;

// Validation Schema
const validationSchema = Yup.object().shape({
    title: Yup.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters')
        .required('Campaign title is required'),
    fromEmail: Yup.string().required('From email is required'),
    products: Yup.array().min(1, 'Select at least one product').required('Products are required'),
    subject: Yup.string()
        .min(3, 'Subject must be at least 3 characters')
        .max(200, 'Subject cannot exceed 200 characters')
        .required('Subject is required'),
    body: Yup.string()
        .min(3, 'Body must be at least 3 characters')
        .required('Body is required'),
});

interface CreateCampaignDrawerProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any, formikHelpers: any, filters: CampaignFilters) => Promise<void>;
    initialValues: any;
    productOptions: { label: string; value: string }[];
    isLoadingProducts: boolean;
    fromEmails: { label: string; value: string }[];

}

const CreateCampaignDrawer: React.FC<CreateCampaignDrawerProps> = ({
    open,
    onClose,
    onSubmit,
    initialValues,
    productOptions,
    isLoadingProducts,
    fromEmails,

}) => {
    const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<CampaignFilters>({
        regionsUUID: [],
        ICBsUUID: [],
        HCOsUUID: []
    });



    return (
        <Drawer
            title={<Title level={4} className="m-0">Create New Campaign</Title>}
            open={open}
            onClose={onClose}
            size={1500}
            styles={{ body: { padding: 0, height: 'calc(100vh - 55px)' } }}
            destroyOnHidden
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, helpers) => onSubmit(values, helpers, currentFilters)}
            >
                {({ values, setFieldValue, errors, touched, isSubmitting }) => (
                    <Form className="h-full flex">
                        {/* LEFT COLUMN - Campaign Setup */}
                        <div className="w-1/2 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
                            <div className="p-6 space-y-6">
                                <div>
                                   
                                    {/* Internal Title */}
                                    <div className="mb-6">
                                        <Input
                                            label="Campaign Title"
                                            name="title"
                                            placeholder="e.g., Q1 Product Launch - Region A"
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    {/* From Email & Products */}
                                    <div className="space-y-6 mb-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-1 h-[24px]">
                                                <Label required text="From Email" />
                                            </div>
                                            <CustomSelect
                                                name="fromEmail"
                                                placeholder="Select sender email address"
                                                options={fromEmails}
                                                allowClear
                                                showSearch
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1 h-[24px]">
                                                <Label info={"Select product which you are targeting in this campaign."} required text="Targeting Products" />
                                                <Checkbox
                                                    indeterminate={values.products.length > 0 && values.products.length < productOptions.length}
                                                    checked={values.products.length === productOptions.length && productOptions.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFieldValue('products', productOptions.map((p) => p.value));
                                                        } else {
                                                            setFieldValue('products', []);
                                                        }
                                                    }}
                                                    className="text-xs"
                                                >
                                                    All
                                                </Checkbox>
                                            </div>
                                            <CustomSelect
                                                name="products"
                                                mode="multiple"
                                                placeholder="Select relevant products"
                                                options={productOptions}
                                                allowClear
                                                maxResponsive
                                                loading={isLoadingProducts}
                                            />
                                        </div>
                                    </div>

                                    {/* CC/BCC Section */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mb-6">
                                        <CcBccSection setFieldValue={setFieldValue} />
                                    </div>

                                    {/* Recipient Selection */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mb-6">
                                        <SelectedRecipientsPreview
                                            count={values.contacts.length}
                                            onClear={() => setFieldValue('contacts', [])}
                                            onOpenFilters={() => setIsFilterDrawerVisible(true)}
                                        />
                                    </div>

                                    {/* Document Upload Section */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <Label text="Attachments" />
                                                <Text type="secondary" className="text-xs">Select or upload files to attach to this email</Text>
                                            </div>
                                            <Button
                                                type="default"
                                                icon={<Paperclip size={16} />}
                                                onClick={() => setIsAttachmentModalOpen(true)}
                                                className="flex items-center gap-2"
                                            >
                                                Add Attachments
                                            </Button>
                                        </div>

                                        <AttachmentsList
                                            attachments={values.attachments}
                                            onRemove={(index) => {
                                                const newAttachments = values.attachments.filter((_: any, i: number) => i !== index);
                                                setFieldValue('attachments', newAttachments);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - Email Composition */}
                        <div className="w-1/2 flex flex-col">
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div>
                                    {/* Subject Field */}
                                    <div className="mb-6">
                                        <Input
                                            label="Email Subject"
                                            name="subject"
                                            placeholder="Enter email subject"
                                            maxLength={200}
                                            size="middle"
                                            required
                                        />
                                    </div>

                                    {/* Email Body Field */}
                                    <div className="mb-6">
                                        <Label required text="Email Body" />
                                        <QuillEditor
                                            value={values.body}
                                            onChange={(val: string) => setFieldValue('body', val)}
                                            placeholder="Compose your email message here..."
                                            className='h-[500px]'
                                        />
                                        {touched.body && errors.body && (
                                            <div className="text-red-500 text-xs mt-1">{errors.body as string}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Summary & Send Section - Fixed at bottom */}
                            <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex justify-between items-center gap-6 p-4 bg-blue-50/40 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex gap-6">
                                        <div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Recipients</div>
                                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{values.contacts.length}</div>
                                        </div>
                                        <div className="border-l border-slate-200 dark:border-slate-800 pl-6">
                                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Products</div>
                                            <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{values.products.length}</div>
                                        </div>
                                    </div>

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-500/20"
                                        loading={isSubmitting}
                                        icon={<Send size={16} />}
                                    >
                                        Send Campaign
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <AttachmentModal
                            visible={isAttachmentModalOpen}
                            onClose={() => setIsAttachmentModalOpen(false)}
                            onSelect={(selected) => {
                                // Filter out duplicates based on url/filePath
                                const uniqueNew = selected.filter(s =>
                                    !values.attachments.some((a: any) => a.url === s.url)
                                );
                                setFieldValue('attachments', [...values.attachments, ...uniqueNew]);
                            }}
                        />

                        <RecipientSelectionDrawer
                            visible={isFilterDrawerVisible}
                            onClose={() => setIsFilterDrawerVisible(false)}
                            onConfirm={(selected, filters) => {
                                setFieldValue('contacts', selected);
                                setCurrentFilters(filters);
                            }}
                            initialSelectedContacts={values.contacts}
                        />
                    </Form>
                )}
            </Formik>
        </Drawer>
    );
};

export default CreateCampaignDrawer;
