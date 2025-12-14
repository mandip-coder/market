'use client';
import { Tabs } from 'antd';
import { CheckCircle, FileText, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { use, useEffect, useMemo, useState } from 'react';

import { useLeadStore } from '@/context/store/leadsStore';
import { useLeadDetailsTabs } from '@/context/store/optimizedSelectors';
import { TabsProps } from 'antd/lib';
import { Lead } from '../../components/LeadsListing';
import CallModal from '../../components/modals/CallModal';
import EmailModal from '../../components/modals/EmailModal';
import FollowUpModal from '../../components/modals/FollowUpModal';


interface LeadDetails {
  lead: Promise<{
    data: Lead
  }>
}


const LeadDetails: React.FC<LeadDetails> = ({ lead }) => {
  const response = use(lead);
  const leadDetails = response.data;
  console.log("leadDetails", leadDetails);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeOverviewTab, setActiveOverviewTab] = useState<string>('followup');
  const setContactPersons = useLeadStore((state) => state.setContactPersons);
  const { followUps, calls, emails, attachments } = useLeadDetailsTabs();

  useEffect(() => {
    if (leadDetails) {
      setContactPersons(leadDetails.contactPersons);
    }
  }, [leadDetails]);

  const overViewTabItems: TabsProps["items"] = [
    //   {
    //   key: 'products',
    //   label: (
    //     <span className="flex items-center gap-1.5">
    //       <ShoppingCart className="w-4 h-4" />
    //       <span>Products</span>
    //       {selectedProducts.length > 0 && (
    //         <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
    //           {selectedProducts.length}
    //         </span>
    //       )}
    //     </span>
    //   ),
    //   children: <SuspenseWithBoundary>
    //     <ProductModal />
    //   </SuspenseWithBoundary>
    // }, {
    //   key: 'attachments',
    //   label: (
    //     <span className="flex items-center gap-1.5">
    //       <Paperclip className="w-4 h-4" />
    //       <span>Attachments</span>
    //       {attachments.length > 0 && (
    //         <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
    //           {attachments.length}
    //         </span>
    //       )}
    //     </span>
    //   ),
    //   children: <UploadModal />
    // },
    {
      key: 'followup',
      label: (
        <span className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          <span>Follow Up</span>
          {followUps.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
              {followUps.length}
            </span>
          )}
        </span>
      ),
      children: <FollowUpModal />
    }, {
      key: 'logCall',
      label: (
        <span className="flex items-center gap-1.5">
          <Phone className="w-4 h-4" />
          <span>Call Log</span>
          {calls.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
              {calls.length}
            </span>
          )}
        </span>
      ),
      children: <CallModal />
    }, {
      key: 'email',
      label: (
        <span className="flex items-center gap-1.5">
          <Mail className="w-4 h-4" />
          <span>Email</span>
          {emails.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
              {emails.length}
            </span>
          )}
        </span>
      ),
      children: <EmailModal />
    },]

  // Memoize tab items to prevent recreation on every render
  const tabItems = useMemo(() => [
    {
      key: 'overview',
      label: (
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span className="font-medium">Overview</span>
        </span>
      ),
      children: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md px-3">
            <Tabs
              activeKey={activeOverviewTab}
              onChange={setActiveOverviewTab}
              items={overViewTabItems}
            />
          </div>
        </div>
      )
    },
    // {
    //   key: 'timeline',
    //   label: (
    //     <span className="flex items-center gap-1.5">
    //       <Clock className="w-3.5 h-3.5" />
    //       <span className="font-medium">Timeline</span>
    //     </span>
    //   ),
    //   children: <TimelineComponent timelineEvents={timelineEvents} excludeEventTypes={['Note', 'Stage Change', 'Reminder',"Meeting",]} />
    // }
  ], [
    activeOverviewTab,
  ]);


  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}

      />
    </>
  );
};

export default LeadDetails
