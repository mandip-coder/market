"use client";
import { Skeleton, Tabs } from "antd";
import { CheckCircle, FileText, Mail, Phone } from "lucide-react";
import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { TabsProps } from "antd/lib";
import { Lead } from "../../components/LeadsListing";
import CallModal from "../../components/modals/CallModal";
import EmailModal from "../../components/modals/EmailModal";
import FollowUpModal from "../../components/modals/FollowUpModal";
import { useLeadFollowUps, useLeadCalls, useLeadEmails } from "../../services";

interface LeadDetails {
  lead: {
    data: Lead;
  };
}

const LeadDetails: React.FC<LeadDetails> = ({ lead }) => {
  const leadDetails = lead.data;
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeOverviewTab, setActiveOverviewTab] = useState<string>("followup");

  // Fetch tab data with lazy loading - only fetch when tab is active
  const { data: followUps = [], isLoading: followUpsLoading } = useLeadFollowUps(
    leadDetails.leadUUID,
    activeTab === "overview" && activeOverviewTab === "followup"
  );

  const { data: calls = [], isLoading: callsLoading } = useLeadCalls(
    leadDetails.leadUUID,
    activeTab === "overview" && activeOverviewTab === "logCall"
  );

  const { data: emails = [], isLoading: emailsLoading } = useLeadEmails(
    leadDetails.leadUUID,
    activeTab === "overview" && activeOverviewTab === "email"
  );

  const overViewTabItems: TabsProps["items"] = [
    {
      key: "followup",
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
      children: (<>
        {followUpsLoading ? (
          <Skeleton
            active
            className="h-[200px]"
          />
        ) : (
          <FollowUpModal lead={leadDetails} followUps={followUps} />
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
          {calls.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
              {calls.length}
            </span>
          )}
        </span>
      ),
      children: (
        <CallModal />
      ),
    },
    {
      key: "email",
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
      children: (
        <EmailModal />
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
              <Tabs
                activeKey={activeOverviewTab}
                onChange={setActiveOverviewTab}
                items={overViewTabItems}
              />
            </div>
          </div>
        ),
      },
    ],
    [activeOverviewTab, followUps, calls, emails, leadDetails]
  );

  const isCancelled = leadDetails?.leadStatus === 'cancelled';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={isCancelled ? "[&_.ant-btn]:!hidden" : ""}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </motion.div>
  );
};

export default LeadDetails;
