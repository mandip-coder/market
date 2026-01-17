'use client'

import FullPageSkeleton from '@/components/Skeletons/FullpageSkeleton';
import AppErrorUI from '@/components/AppErrorUI/AppErrorUI';
import LeadDetailsHeader from './LeadDetailsHeader';
import LeadTabs from './LeadTabs';
import { ApiError } from '@/lib/apiClient/ApiError';
import { useLead } from '../../services/leads.hooks';
import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry';

interface LeadDetailsClientProps {
  id: string;
}

export default function LeadDetailsClient({ id }: LeadDetailsClientProps) {
  const { data: lead, isLoading, error } = useLead(id);

  if (isLoading) {
    return <FullPageSkeleton />;
  }

  if (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    return (
      <AppErrorUI
        code={statusCode}
        message={error.message}
        backLink="/leads"
        buttonName="Back to prospects"
      />
    );
  }

  if (!lead) {
    return (
      <AppErrorUI
        code={404}
        message="Prospect not found"
        backLink="/leads"
        buttonName="Back to prospects"
      />
    );
  }

  return (
    <SuspenseWithBoundary>
      <LeadDetailsHeader headerDetails={{ data: lead }} />
      <LeadTabs lead={{ data: lead }} />
    </SuspenseWithBoundary>
  );
}
