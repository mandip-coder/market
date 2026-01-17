'use client'

import { useHealthcare } from '../services/healthcares.hooks';
import HealthCareDetailsHeader from './HealthCareDetailsHeader';
import HealthCareTabs from './HelathCareTabs';
import FullPageSkeleton from '@/components/Skeletons/FullpageSkeleton';
import AppErrorUI from '@/components/AppErrorUI/AppErrorUI';
import { ApiError } from '@/lib/apiClient/ApiError';
import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry';

export default function HealthCareDetailsClient({ id }: { id: string }) {
  const { data: healthcare, isLoading, error } = useHealthcare(id);

  if (isLoading) {
    return (
      <FullPageSkeleton/>
    );
  }
 if (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    return (
      <AppErrorUI
        code={statusCode}
        message={error.message}
        backLink="/healthcares"
        buttonName="Back to Healthcares"
      />
    );
  }

  if (!healthcare) {
    return (
      <AppErrorUI
        code={404}
        message="Healthcare not found"
        backLink="/healthcares"
        buttonName="Back to Healthcares"
      />
    );
  }

  return (
    <SuspenseWithBoundary>
      <HealthCareDetailsHeader headerDetails={healthcare} />
      <HealthCareTabs healthcare={healthcare} />
    </SuspenseWithBoundary>
  );
}
