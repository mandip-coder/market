"use client";

import { GlobalDate } from "@/Utils/helpers";
import { Input, Modal, Tabs, Tag, Typography } from "antd";
import {
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  Package,
  Search,
  User,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Campaign } from "../types";

const { Text } = Typography;

interface MassEmailReportModalProps {
  visible: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

const MassEmailReportModal: React.FC<MassEmailReportModalProps> = ({
  visible,
  onClose,
  campaign,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  if (!campaign) return null;

  const recipientsCount = campaign.contactPersons.length;
  const productsCount = campaign.products.length;
  const ccCount = campaign.ccUsers.length;
  const bccCount = campaign.bccUsers.length;

  // Filter recipients based on search query
  const filteredRecipients = useMemo(() => {
    if (!searchQuery.trim()) {
      return campaign.contactPersons || [];
    }

    const query = searchQuery.toLowerCase();
    return (
      campaign.contactPersons?.filter((recipient) => {
        const name = recipient.contactPersonName?.toLowerCase() || "";
        const email = recipient.email?.toLowerCase() || "";
        return name.includes(query) || email.includes(query);
      }) || []
    );
  }, [campaign.contactPersons, searchQuery]);

  const tabItems = [
    {
      key: "overview",
      label: (
        <div className="flex items-center gap-1.5 px-1">
          <FileText size={14} />
          <span className="text-xs">Overview</span>
        </div>
      ),
      children: (
        <div className="h-[620px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 p-2.5 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 p-1.5 rounded-md text-white">
                  <Users size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    Recipients
                  </div>
                  <div className="text-xl font-black text-blue-900 dark:text-blue-100">
                    {recipientsCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20 p-2.5 rounded-lg border border-purple-200/50 dark:border-purple-800/30">
              <div className="flex items-center gap-2">
                <div className="bg-purple-500 p-1.5 rounded-md text-white">
                  <Package size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                    Products
                  </div>
                  <div className="text-xl font-black text-purple-900 dark:text-purple-100">
                    {productsCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/20 p-2.5 rounded-lg border border-green-200/50 dark:border-green-800/30">
              <div className="flex items-center gap-2">
                <div className="bg-green-500 p-1.5 rounded-md text-white">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-green-600 dark:text-green-400 font-semibold">
                    Status
                  </div>
                  <div className="text-xs font-bold text-green-900 dark:text-green-100 uppercase">
                    {campaign.isSend ? "Sent" : "Not Sent"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Details Card */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <Mail
                  size={14}
                  className="text-slate-500 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-500 font-semibold mb-0.5">
                    From
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Text className="text-slate-800 dark:text-slate-200 text-xs font-medium truncate">
                      {campaign.fromMail}
                    </Text>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText
                  size={14}
                  className="text-slate-500 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-500 font-semibold mb-0.5">
                    Subject
                  </div>
                  <Text className="text-slate-900 dark:text-slate-100 text-xs font-semibold line-clamp-2">
                    {campaign.subject}
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock
                  size={14}
                  className="text-slate-500 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-[10px] text-slate-500 font-semibold mb-0.5">
                    Sent On
                  </div>
                  <Text className="text-slate-800 dark:text-slate-200 text-xs">
                    {GlobalDate(campaign.createdOn)}
                  </Text>
                </div>
              </div>

              {ccCount > 0 && (
                <div className="flex items-start gap-2">
                  <Users
                    size={14}
                    className="text-slate-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-500 font-semibold mb-1">
                      CC ({ccCount})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {campaign.ccUsers?.map((user) => (
                        <Tag
                          color="blue"
                          key={user.userUUID}
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-md px-2 py-0 text-[10px] font-medium m-0"
                        >
                          {user.userName}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {bccCount > 0 && (
                <div className="flex items-start gap-2">
                  <Users
                    size={14}
                    className="text-slate-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-500 font-semibold mb-1">
                      BCC ({bccCount})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {campaign.bccUsers.map((user) => (
                        <Tag
                          color="blue"
                          key={user.userUUID}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 rounded-md px-2 py-0 text-[10px] font-medium m-0"
                        >
                          {user.userName || "BCC User"}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg p-3 border border-indigo-200/50 dark:border-indigo-800/30">
            <div className="flex items-center gap-1.5 mb-2">
              <Package
                size={14}
                className="text-indigo-600 dark:text-indigo-400"
              />
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-100">
                Targeted Products ({productsCount})
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {campaign.products.map((product) => (
                <div
                  key={product.productUUID}
                  className="bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/50 shadow-sm"
                >
                  <span className="font-semibold text-[11px] text-indigo-700 dark:text-indigo-300">
                    {product.productName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "recipients",
      label: (
        <div className="flex items-center gap-1.5 px-1">
          <Users size={14} />
          <span className="text-xs">Recipients</span>
        </div>
      ),
      children: (
        <div className="h-[620px] flex flex-col">
          {recipientsCount > 0 ? (
            <>
              {/* Search and Header Section */}
              <div className="flex-shrink-0 space-y-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                {/* Search Input */}
                <div className="relative">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    prefix={<Search size={14} className="text-slate-400" />}
                    allowClear
                    className="rounded-lg"
                    size="middle"
                  />
                </div>

                {/* Total Count Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-2.5 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500 p-1.5 rounded-md text-white">
                      <Users size={14} />
                    </div>
                    <div className="text-xs font-bold text-blue-900 dark:text-blue-100">
                      {searchQuery.trim()
                        ? "Filtered Recipients"
                        : "Total Recipients"}
                    </div>
                  </div>
                  <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {searchQuery.trim()
                      ? `${filteredRecipients.length} / ${recipientsCount}`
                      : recipientsCount}
                  </div>
                </div>
              </div>

              {/* Recipients List */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 mt-3 custom-scrollbar">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((recipient) => (
                    <div
                      key={recipient.contactPersonUUID}
                      className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 rounded-lg p-3 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                          {recipient.contactPersonName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                {recipient.contactPersonName}
                              </div>
                            </div>
                            <Tag
                              color="blue"
                              className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-md px-2 py-0.5 text-[10px] font-semibold m-0"
                            >
                              #
                              {campaign.contactPersons?.findIndex(
                                (r) =>
                                  r.contactPersonUUID ===
                                  recipient.contactPersonUUID
                              ) + 1}
                            </Tag>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Mail
                                size={11}
                                className="text-slate-400 flex-shrink-0"
                              />
                              <Text className="text-xs text-slate-700 dark:text-slate-300 truncate">
                                {recipient.email}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Search size={32} className="text-slate-400" />
                      </div>
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        No recipients found
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Try adjusting your search query
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Users size={32} className="text-slate-400" />
                </div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  No recipients found
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  This campaign has no recipients
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "content",
      label: (
        <div className="flex items-center gap-1.5 px-1">
          <Mail size={14} />
          <span className="text-xs">Email Content</span>
        </div>
      ),
      children: (
        <div className="h-[420px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 overflow-y-auto custom-scrollbar">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: campaign.body }}
          />
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-2.5">
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              {campaign.title}
            </div>
          </div>
          <Tag color={campaign.isSend ? "green" : "red"}>
            {campaign.isSend ? "Sent" : "Not Sent"}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={
        <div className="flex justify-between items-center px-1 py-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <User size={11} />
            <span>
              Created by:{" "}
              <span className="font-semibold">
                {campaign.createdBy || "System Admin"}
              </span>
            </span>
          </div>
        </div>
      }
      centered
      styles={{
        body: {
          maxHeight: "800px",
        },
      }}
      className="campaign-report-modal"
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="campaign-tabs"
      />
    </Modal>
  );
};

export default MassEmailReportModal;
