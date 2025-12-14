'use client';
import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry';
import { Tabs } from 'antd';
import { Calendar, CheckCircle, Clock, FileText, Mail, Notebook, Paperclip, Phone, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDealStore } from '../../../../context/store/dealsStore';
import { Deal } from '../../../../lib/types';
import CallModal from '../components/modals/CallModal';
import EmailModal from '../components/modals/EmailModal';
import MeetingModal from '../components/modals/MeetingModal';
import NoteModal from '../components/modals/NoteModal';
import ProductModal from '../components/modals/ProductModal';
import StageChangeModal from '../components/modals/StageChangeModal';
import TaskModal from '../components/modals/FollowUpModal';
import UploadModal from '../components/modals/UploadModal';
import TimelineComponent, { TimelineEvent } from '@/components/shared/TimelineComponent';
import { mockContacts } from '../mockdata';

interface DealDetailesProps {
  dealDetailsPromise: Promise<Deal>;
}

const DealDetails: React.FC<DealDetailesProps> = ({ dealDetailsPromise }) => {
  const dealDetails = React.use(dealDetailsPromise);
  const {
    selectedProducts,
    attachments,
    timelineEvents: events,
    meetings,
    followUps,
    calls,
    emails,
    notes,
    dealStage,
    setHcoDetails,
    hcoDetails
  } = useDealStore();



  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeOverviewTab, setActiveOverviewTab] = useState<string>('products');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const deal: Deal = dealDetails
  useEffect(() => {
    setTimelineEvents(events);
  }, [events]);

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
          <div>
            <StageChangeModal />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md px-3">
            <Tabs
              activeKey={activeOverviewTab}
              onChange={setActiveOverviewTab}
              items={[
                {
                  key: 'products',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Products</span>
                      {selectedProducts.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                          {selectedProducts.length}
                        </span>
                      )}
                    </span>
                  ),
                  children: <SuspenseWithBoundary>
                    <ProductModal />
                  </SuspenseWithBoundary>
                },
                {
                  key: 'attachments',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4" />
                      <span>Attachments</span>
                      {attachments.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                          {attachments.length}
                        </span>
                      )}
                    </span>
                  ),
                  children: <UploadModal />
                },
                {
                  key: 'meetings',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>Meetings</span>
                      {meetings.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                          {meetings.length}
                        </span>
                      )}
                    </span>
                  ),
                  children: <SuspenseWithBoundary errorFallback={(error) =>
                    <span>{error}</span>
                  }> <MeetingModal /></SuspenseWithBoundary>
                },
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
                  children: <TaskModal />
                },
                {
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
                },
                {
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
                  children: <EmailModal contacts={mockContacts} />
                },
                {
                  key: 'notes',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Notebook className="w-4 h-4" />
                      <span>Notes</span>
                      {notes.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                          {notes.length}
                        </span>
                      )}
                    </span>
                  ),
                  children: <NoteModal />
                },
                // {
                //   key: 'reminder',
                //   label: (
                //     <span className="flex items-center gap-1.5">
                //       <Bell className="w-4 h-4" />
                //       <span>Reminder</span>
                //       {reminders.length > 0 && (
                //         <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                //           {reminders.length}
                //         </span>
                //       )}
                //     </span>
                //   ),
                //   children: <ReminderModal />
                // },
              ]}
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
    //   children: <TimelineComponent timelineEvents={timelineEvents} currentUserUUID={useDealStore.getState().user?.userUUID} />
    // }
  ], [
    activeOverviewTab,
    deal,
    selectedProducts,
    attachments,
    meetings,
    followUps,
    calls,
    emails,
    notes,
    timelineEvents,
  ]);


  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        destroyOnHidden
      />
    </>
  );
};

export default DealDetails
