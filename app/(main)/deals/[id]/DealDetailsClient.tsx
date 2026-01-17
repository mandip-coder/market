'use client'

import FullPageSkeleton from '@/components/Skeletons/FullpageSkeleton';
import AppErrorUI from '@/components/AppErrorUI/AppErrorUI';
import { ApiError } from '@/lib/apiClient/ApiError';
import { useDeal } from '../services/deals.hooks';
import DealDetailsHeader from './DealDetailsHeader';
import DealTabs from './DealTabs';
import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry';

interface DealDetailsClient {
  id: string;
}

export default function DealDetailsClient({ id }: DealDetailsClient) {
  const { data: deal, isLoading, error } = useDeal(id);

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
        buttonName="Back to Leads"
      />
    );
  }

  if (!deal) {
    return (
      <AppErrorUI
        code={404}
        message="Deal not found"
        backLink="/leads"
        buttonName="Back to Leads"
      />
    );
  }

  return (
    <SuspenseWithBoundary>
      <DealDetailsHeader dealData={deal} />
      <DealTabs deal={deal} />
    </SuspenseWithBoundary>
  );
}