"use client";
import { Tabs } from "antd";
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
  const { data: followUps = [] } = useLeadFollowUps(
    leadDetails.leadUUID,
    activeTab === "overview" && activeOverviewTab === "followup"
  );

  const { data: calls = [] } = useLeadCalls(
    leadDetails.leadUUID,
    activeTab === "overview" && activeOverviewTab === "logCall"
  );

  const { data: emails = [] } = useLeadEmails(
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
      children: (
        <FollowUpModal
          leadUUID={leadDetails.leadUUID}
          hcoUUID={leadDetails.hcoUUID}
          hcoName={leadDetails.hcoName}
          contactPersons={leadDetails.contactPersons}
        />
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
        <CallModal
          leadUUID={leadDetails.leadUUID}
        />
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
        <EmailModal
          leadUUID={leadDetails.leadUUID}
          contactPersons={leadDetails.contactPersons}
        />
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
    [activeOverviewTab, followUps.length, calls.length, emails.length, leadDetails]
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
