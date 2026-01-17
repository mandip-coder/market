"use client";
import { Tabs } from "antd";
import { CheckCircle, FileText, History, Mail, Phone } from "lucide-react";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { TabsProps } from "antd/lib";
import CallModal from "../../components/modals/CallModal";
import EmailModal from "../../components/modals/EmailModal";
import FollowUpModal from "../../components/modals/FollowUpModal";
import {
  useLeadCalls,
  useLeadEmails,
  useLeadFollowUps,
  useLeadTimelineCounts,
} from "../../services/leads.hooks";
import { Lead } from "../../services/leads.types";
import Skeleton from "@/components/Skeletons/FormSkeleton";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import TimelineComponent from "@/components/shared/TimelineComponent";

interface LeadDetails {
  lead: {
    data: Lead;
  };
}

const LeadTabs: React.FC<LeadDetails> = ({ lead }) => {
  const leadDetails = lead.data;
  const isCancelled = leadDetails?.leadStatus === "cancelled";



  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeOverviewTab, setActiveOverviewTab] =
    useState<string>("followup");




  // Fetch tab data with lazy loading - only fetch when tab is active
  const { data: followUps = [], isLoading: followUpsLoading,refetch:refetchFollowUps,isRefetching:isRefetchingFollowUps } =
    useLeadFollowUps(
      leadDetails.leadUUID,
      activeTab === "overview" && activeOverviewTab === "followup"
    );

  const { data: calls = [], isLoading: callsLoading,refetch:refetchCalls,isRefetching:isRefetchingCalls } = useLeadCalls(
    leadDetails.leadUUID,
    activeTab === "overview" && activeOverviewTab === "logCall"
  );

  const { data: emails = [], isLoading: emailsLoading,refetch:refetchEmails,isRefetching:isRefetchingEmails } = useLeadEmails(
    leadDetails.leadUUID,
    activeTab === "overview" && activeOverviewTab === "email"
  );
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
  } = useLeadTimelineCounts(leadDetails.leadUUID, activeTab === "timeline");

  const overViewTabItems: TabsProps["items"] = [
    {
      key: "followup",
      label: (
        <span className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          <span>Follow Up</span>
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            {leadDetails.followUpCount}
          </span>
        </span>
      ),
      children: (
        <>
          {followUpsLoading ? (
            <Skeleton />
          ) : (
            <FollowUpModal lead={leadDetails} followUps={followUps} refetching={isRefetchingFollowUps} refetch={refetchFollowUps} />
          )}
        </>
      ),
    },
    {
      key: "logCall",
      label: (
        <span className="flex items-center gap-1.5">
          <Phone className="w-4 h-4" />
          <span>Communication Log</span>
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            {leadDetails.callLogCount}
          </span>
        </span>
      ),
      children: (
        <>
          {callsLoading ? (
            <Skeleton />
          ) : (
            <CallModal lead={leadDetails} calls={calls} refetching={isRefetchingCalls} refetch={refetchCalls} />
          )}
        </>
      ),
    },
    {
      key: "email",
      label: (
        <span className="flex items-center gap-1.5">
          <Mail className="w-4 h-4" />
          <span>Email</span>
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            {leadDetails.emailCount}
          </span>
        </span>
      ),
      children: (
        <>
          {emailsLoading ? (
            <Skeleton />
          ) : (
            <EmailModal lead={leadDetails} emails={emails} refetching={isRefetchingEmails} refetch={refetchEmails} />
          )}
        </>
      ),
    },
  ];

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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md px-3">
              <div className={isCancelled ? "[&_.ant-btn]:!hidden" : ""}>
                <Tabs
                  activeKey={activeOverviewTab}
                  onChange={setActiveOverviewTab}
                  items={overViewTabItems}
                />
              </div>
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
              entityType="lead"
              entityUUID={leadDetails.leadUUID}
              timelineCounts={timelineCounts}
              excludeTabs={[
                "Product",
                "Attachment",
                "Meeting",
                "Note",
                "Stage Change",
              ]}
            />
          </SuspenseWithBoundary>
        ),
      },
    ],
    [
      activeOverviewTab,
      followUps,
      calls,
      emails,
      leadDetails,
      timelineCounts,
      timelineCountsLoading,
      followUpsLoading,
      callsLoading,
      emailsLoading,
      refetchFollowUps,
      refetchCalls,
      refetchEmails,
      isRefetchingFollowUps,
      isRefetchingCalls,
      isRefetchingEmails,
    ]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} destroyOnHidden />
    </motion.div>
  );
};

export default LeadTabs;
