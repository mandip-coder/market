'use client'

import { useLead } from '@/app/(main)/leads/services';
import FullPageSkeleton from '@/components/Skeletons/FullpageSkeleton';
import AppErrorUI from '@/components/AppErrorUI/AppErrorUI';
import LeadDetailsHeader from './LeadDetailsHeader';
import LeadDetails from './LeadTabs';

interface LeadDetailsClientProps {
  id: string;
}

export default function LeadDetailsClient({ id }: LeadDetailsClientProps) {
  const { data: lead, isLoading, error } = useLead(id);

  if (isLoading) {
    return <FullPageSkeleton />;
  }

  if (error) {
    return (
      <AppErrorUI
        code={500}
        message="Failed to load lead details"
        backLink="/leads"
        buttonName="Back to Leads"
      />
    );
  }

  if (!lead) {
    return (
      <AppErrorUI
        code={404}
        message="Lead not found"
        backLink="/leads"
        buttonName="Back to Leads"
      />
    );
  }

  return (
    <>
      <LeadDetailsHeader headerDetails={{ data: lead }} />
      <LeadDetails lead={{ data: lead }} />
    </>
  );
}
