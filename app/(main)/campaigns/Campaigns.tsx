'use client';

import { useProducts } from '@/services/dropdowns/dropdowns.hooks';
import { Button, Card, Col, Row, Skeleton, Typography } from 'antd';
import { UserPlus } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/AppToaster/AppToaster';
import { useCampaigns, usePostMassEmail } from './services/campaigns.hooks';
import { Campaign, CampaignFilters, CreateCampaignsPayload } from './types';

// Internal Components
import AppErrorUI from '@/components/AppErrorUI/AppErrorUI';
import PageHeading from '@/components/PageHeading/PageHeading';
import CampaignCard from './components/CampaignCard';
import CampaignEmptyState from './components/CampaignEmptyState';
import MassEmailReportModal from './components/CampaignReportModal';
import CreateCampaignDrawer from './components/CreateCampaignDrawer';

const { Title, Text } = Typography;

// Mock Data
const MOCK_FROM_EMAILS = [
  { label: 'Marketing Team <marketing@intelligence.com>', value: 'marketing@intelligence.com' },
  { label: 'Sales Support <sales@intelligence.com>', value: 'sales@intelligence.com' },
  { label: 'Pharma Intelligence <info@intelligence.com>', value: 'info@intelligence.com' },
];



const MassEmailSendingPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedCampaignForReport, setSelectedCampaignForReport] = useState<Campaign | null>(null);

  const { data: recentCampaigns, isLoading: isLoadingCampaigns, error: campaignError, refetch: refetchCampaigns } = useCampaigns();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { mutateAsync: postMassEmail, isPending: isSubmittingCampaign } = usePostMassEmail();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();



  const productOptions = useMemo(() =>
    (productsData || []).map((p: any) => ({ label: p.productName, value: p.productUUID })),
    [productsData]);

  useEffect(() => {
    if (recentCampaigns) {
      setCampaigns(recentCampaigns);
    }
  }, [recentCampaigns]);

  const initialValues = {
    title: '',
    fromEmail: '',
    products: productOptions.map((p: any) => p.value), // All selected by default
    contacts: [], // This will hold the actual contact objects
    cc: [],
    bcc: [],
    subject: '',
    body: '',
    attachments: [] as any[],
  };

  const handleCreateCampaign = async (values: typeof initialValues, { resetForm, setSubmitting }: any, filters: CampaignFilters) => {
    if (!values.contacts.length) {
      toast.error('Please add at least one recipient');
      setSubmitting(false);
      return;
    }

    try {
      const payload: CreateCampaignsPayload = {
        title: values.title,
        fromMail: values.fromEmail,
        subject: values.subject,
        contactPersonIds: values.contacts.map((c: any) => c.hcoContactUUID),
        cc: values.cc,
        bcc: values.bcc,
        body: values.body,
        isSend: true,
        followupReason: values.title,
        parentUUID: null,
        filters: filters,
        document: values.attachments,
        productsUUID: values.products,
      };

      console.log('payload', payload);

      await postMassEmail(payload);

      // Add to mock campaigns for demo/local state feedback
      const newCampaign: any = {
        massmailUUID: `camp_${Date.now()}`,
        title: values.title,
        subject: values.subject,
        status: 'Sent',
        createdOn: new Date().toISOString(),
        contactPersons: values.contacts,
        products: values.products.map((p: any) => ({
          productId: p,
          productName: productOptions.find((mp: any) => mp.value === p)?.label || p
        })),
        fromMail: values.fromEmail
      };

      setCampaigns([newCampaign, ...campaigns]);
      setIsDrawerOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating campaign:', error);
      // Error handled by hook toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-12">
      <div className="flex justify-between items-center mb-0">
        <PageHeading
          title="Campaigns"
          descriptionLine="Manage and track your campaigns"
        />
        {!campaignError && (
          <Button
            type="primary"
            size="middle"
            icon={<UserPlus size={18} />}
            onClick={() => setIsDrawerOpen(true)}
            className="shadow-md mb-8"
          >
            New Campaign
          </Button>
        )}
      </div>

      {isLoadingCampaigns ? (
        <Row gutter={[24, 24]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} md={12} lg={12} key={i}>
              <Card className="rounded-xl border-slate-200 dark:border-slate-800 h-full py-4">
                <Skeleton active avatar paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : campaignError ? (
        <AppErrorUI
          message={(campaignError as any)?.message || "Failed to load campaigns"}
          onRetry={() => refetchCampaigns()}
          code={(campaignError as any)?.statusCode}
        />
      ) : campaigns.length === 0 ? (
        <CampaignEmptyState onCreateNew={() => setIsDrawerOpen(true)} />
      ) : (
        <Row gutter={[24, 24]}>
          {campaigns.map((camp) => (
            <Col xs={24} md={12} lg={12} key={camp.massmailUUID}>
              <CampaignCard
                campaign={camp}
                onViewReport={(campaign) => {
                  setSelectedCampaignForReport(campaign);
                  setIsReportModalOpen(true);
                }}
              />
            </Col>
          ))}
          <Col xs={24} md={12} lg={12}>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-full h-full min-h-[220px] flex flex-col items-center justify-center border-2 border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
            >
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full group-hover:bg-blue-100 transition-colors mb-3">
                <UserPlus size={24} className="Xtext-slate-400 group-hover:text-blue-500" />
              </div>
              <span className="text-sm font-semibold text-slate-500 group-hover:text-blue-600">Launch New Campaign</span>
            </button>
          </Col>
        </Row>
      )}

      <CreateCampaignDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreateCampaign}
        initialValues={initialValues}
        productOptions={productOptions}
        isLoadingProducts={isLoadingProducts}
        fromEmails={MOCK_FROM_EMAILS}
      />

      <MassEmailReportModal
        visible={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedCampaignForReport(null);
        }}
        campaign={selectedCampaignForReport}
      />
    </div>
  );
};

export default memo(MassEmailSendingPage);
