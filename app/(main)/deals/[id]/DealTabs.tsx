"use client";
import Skeleton from "@/components/Skeletons/FormSkeleton";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import { Tabs } from "antd";
import {
  Calendar,
  CheckCircle,
  FileText,
  History,
  Mail,
  Notebook,
  Paperclip,
  Phone,
  ShoppingCart,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import TimelineComponent from "../../../../components/shared/TimelineComponent";
import CallModal from "../components/modals/CallModal";
import EmailModal from "../components/modals/EmailModal";
import TaskModal from "../components/modals/FollowUpModal";
import MeetingModal from "../components/modals/MeetingModal";
import NoteModal from "../components/modals/NoteModal";
import ProductModal from "../components/modals/ProductModal";
import StageChangeModal from "../components/modals/StageChangeModal";
import UploadModal from "../components/modals/UploadModal";
import {
  useDealAttachments,
  useDealCalls,
  useDealEmails,
  useDealFollowUps,
  useDealMeetings,
  useDealNotes,
  useDealProducts,
  useDealTimelineCounts,
} from "../services/deals.hooks";
import { Deal } from "../services/deals.types";
import { useDropdownDealStages } from "@/services/dropdowns/dropdowns.hooks";

interface DealDetailesProps {
  deal: Deal;
}

export type DealTabsOptions =
  | "products"
  | "meetings"
  | "followUps"
  | "calls"
  | "emails"
  | "notes"
  | "attachments";

const DealTabs: React.FC<DealDetailesProps> = ({ deal }) => {
   const { data: dealStages = [] } = useDropdownDealStages();
    const currentStageUUID = deal.dealStage;
     const isClosedWon = (stageUUID: string | null) => {
    if (!stageUUID) return false;
    const stage = dealStages.find((s) => s.dealStageUUID === stageUUID);
    return stage?.dealStageName === "Closed Won";
  };

  const isClosedLost = (stageUUID: string | null) => {
    if (!stageUUID) return false;
    const stage = dealStages.find((s) => s.dealStageUUID === stageUUID);
    return stage?.dealStageName === "Closed Lost";
  };
     const isCurrentStageClosed = useMemo(() => {
    return isClosedWon(currentStageUUID) || isClosedLost(currentStageUUID);
  }, [currentStageUUID, dealStages]);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline">(
    "overview"
  );
  const [activeOverviewTab, setActiveOverviewTab] =
    useState<DealTabsOptions>("followUps");
  const {
    data: timelineCounts = {
      product: 0,
      attachment: 0,
      meeting: 0,
      followUp: 0,
      call: 0,
      email: 0,
      note: 0,
      stageChange: 0,
    },
    isLoading: timelineCountsLoading,
  } = useDealTimelineCounts(deal.dealUUID, activeTab === "timeline");

  const { data: followUps = [], isLoading: followUpsLoading, refetch: refetchFollowUps, isRefetching: refetchingFollowUps } =
    useDealFollowUps(
      deal.dealUUID,
      activeTab === "overview" && activeOverviewTab === "followUps"
    );

  const { data: selectedProducts = [], isLoading: selectedProductsLoading,refetch: refetchProducts, isRefetching: refetchingProducts } =
    useDealProducts(deal.dealUUID);
  const { data: calls = [], isLoading: callsLoading,refetch: refetchCalls, isRefetching: refetchingCalls } = useDealCalls(
    deal.dealUUID,
    activeTab === "overview" && activeOverviewTab === "calls"
  );

  const { data: emails = [], isLoading: emailsLoading,refetch: refetchEmails, isRefetching: refetchingEmails } = useDealEmails(
    deal.dealUUID,
    activeTab === "overview" && activeOverviewTab === "emails"
  );

  const { data: notes = [], isLoading: notesLoading,refetch: refetchNotes, isRefetching: refetchingNotes } = useDealNotes(
    deal.dealUUID,
    activeTab === "overview" && activeOverviewTab === "notes"
  );

  const { data: meetings = [], isLoading: meetingsLoading,refetch: refetchMeetings, isRefetching: refetchingMeetings } = useDealMeetings(
    deal.dealUUID,
    activeTab === "overview" && activeOverviewTab === "meetings"
  );

  const { data: attachments = [], isLoading: attachmentsLoading,refetch: refetchAttachments, isRefetching: refetchingAttachments } =
    useDealAttachments(
      deal.dealUUID,
      activeTab === "overview" && activeOverviewTab === "attachments"
    );

  // Memoize tab items to prevent recreation on every render
  const tabItems = useMemo(
    () => [
      {
        key: "overview",
        label: (
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-medium">Overview</span>
          </span>
        ),
        children: (
          <div className="space-y-6">
            <SuspenseWithBoundary>
              <StageChangeModal dealDetails={deal} />
            </SuspenseWithBoundary>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md px-3">
              
              <SuspenseWithBoundary>
                 <div className={isCurrentStageClosed ? "[&_.ant-btn]:!hidden" : ""}>
                <Tabs
                  activeKey={activeOverviewTab}
                  onChange={(key) =>
                    setActiveOverviewTab(key as DealTabsOptions)
                  }
                  items={[
                    {
                      key: "followUps",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Follow Up</span>
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            {deal.counts.followUps || 0}
                          </span>
                        </span>
                      ),
                      children: (
                        <>
                          {followUpsLoading ? (
                            <Skeleton />
                          ) : (
                            <SuspenseWithBoundary
                              errorFallback={(error) => <span>{error}</span>}
                            >
                              <TaskModal deal={deal} followUps={followUps} refetching={refetchingFollowUps||followUpsLoading} refetch={refetchFollowUps} />
                            </SuspenseWithBoundary>
                          )}
                        </>
                      ),
                    },
                    {
                      key: "products",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <ShoppingCart className="w-4 h-4" />
                          <span>Products</span>
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            {deal.counts.products || 0}
                          </span>
                        </span>
                      ),
                      children: selectedProductsLoading ? (
                        <Skeleton />
                      ) : (
                        <SuspenseWithBoundary>
                          <ProductModal
                            deal={deal}
                            selectedProducts={selectedProducts}
                            refetching={refetchingProducts||selectedProductsLoading}
                            refetch={refetchProducts}
                          />
                        </SuspenseWithBoundary>
                      ),
                    },
                    {
                      key: "attachments",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <Paperclip className="w-4 h-4" />
                          <span>Attachments</span>
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            {deal.counts.attachments || 0}
                          </span>
                        </span>
                      ),
                      children: attachmentsLoading ? (
                        <Skeleton />
                      ) : (
                        <SuspenseWithBoundary>
                          <UploadModal deal={deal} attachments={attachments}
                          refetching={refetchingAttachments||attachmentsLoading}
                          refetch={refetchAttachments} />
                        </SuspenseWithBoundary>
                      ),
                    },
                    {
                      key: "meetings",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>Schedule Meeting</span>
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            {deal.counts.meetings || 0}
                          </span>
                        </span>
                      ),
                      children: (
                        <>
                          {meetingsLoading ? (
                            <Skeleton />
                          ) : (
                            <SuspenseWithBoundary
                              errorFallback={(error) => <span>{error}</span>}
                            >
                              <MeetingModal deal={deal} meetings={meetings}
                                refetching={refetchingMeetings||meetingsLoading}
                                refetch={refetchMeetings}
                               />
                            </SuspenseWithBoundary>
                          )}
                        </>
                      ),
                    },

                    {
                      key: "calls",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          <span>Communications Log</span>
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            {deal.counts.calls || 0}
                          </span>
                        </span>
                      ),
                      children: (
                        <>
                          {callsLoading ? (
                            <Skeleton />
                          ) : (
                            <SuspenseWithBoundary
                              errorFallback={(error) => <span>{error}</span>}
                            >
                              <CallModal calls={calls} deal={deal} refetching={refetchingCalls||callsLoading} refetch={refetchCalls}/>
                            </SuspenseWithBoundary>
                          )}
                        </>
                      ),
                    },
                    {
                      key: "emails",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          <span>Email</span>
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            {deal.counts.emails || 0}
                          </span>
                        </span>
                      ),
                      children: (
                        <>
                          {emailsLoading ? (
                            <Skeleton />
                          ) : (
                            <SuspenseWithBoundary
                              errorFallback={(error) => <span>{error}</span>}
                            >
                              <EmailModal deal={deal} emails={emails} refetching={refetchingEmails||emailsLoading} refetch={refetchEmails}/>
                            </SuspenseWithBoundary>
                          )}
                        </>
                      ),
                    },
                    {
                      key: "notes",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <Notebook className="w-4 h-4" />
                          <span>Notes</span>
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            {deal.counts.notes || 0}
                          </span>
                        </span>
                      ),
                      children: (
                        <>
                          {notesLoading ? (
                            <Skeleton />
                          ) : (
                            <NoteModal deal={deal} notes={notes} refetching={refetchingNotes||notesLoading} refetch={refetchNotes}/>
                          )}
                        </>
                      ),
                    },
                  ]}
                />
                </div>
              </SuspenseWithBoundary>
            </div>
          </div>
        ),
      },
      {
        key: "timeline",
        label: (
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4" />
            <span>Timeline</span>
          </span>
        ),
        children: (
          <SuspenseWithBoundary>
            <TimelineComponent
              entityType="deal"
              entityUUID={deal.dealUUID}
              timelineCounts={timelineCounts}
            />
          </SuspenseWithBoundary>
        ),
      },
    ],
    [
      activeOverviewTab,
      deal,
      selectedProducts,
      attachments,
      meetings,
      meetingsLoading,
      followUps,
      followUpsLoading,
      calls,
      callsLoading,
      emails,
      emailsLoading,
      notes,
      notesLoading,
      notes,
      notesLoading,
      timelineCountsLoading,
      refetchProducts,
      refetchCalls,
      refetchEmails,
      refetchNotes,
      refetchMeetings,
      refetchAttachments,
      refetchFollowUps,
      refetchingFollowUps,
      refetchingProducts,
      refetchingCalls,
      refetchingEmails,
      refetchingNotes,
      refetchingMeetings,
      refetchingAttachments,
      refetchingFollowUps,
    ]
  );

  return (
    <Tabs
      activeKey={activeTab}
      onChange={(key) => setActiveTab(key as "overview" | "timeline")}
      items={tabItems}
      destroyOnHidden
    />
  );
};

export default DealTabs;
