"use client";

import { Spin, Tag, Popover, Button, Divider, Typography, Space } from "antd";
import dayjs from "dayjs";
import { CheckCircle2, Info, Mail, Phone, User, Building } from "lucide-react";
import Link from "next/link";
import { DashboardFollowUp } from "../services/dashboard.types";
import { DashboardFollowUpActions } from "./DashboardFollowUpActions";
import { FollowUpStatusBadge } from "./FollowUpStatusBadge";
import { ReactNode } from "react";
import { formatMeetingDate } from "@/Utils/helpers";
import { FollowUpModesEnum } from "@/components/shared/modals/FollowUpModal";

const { Text, Title } = Typography;

interface GenericFollowupsWidgetProps {
  title: string | ReactNode;
  followups: DashboardFollowUp[];
  isLoading: boolean;
  variant: "lead" | "deal";
  onComplete: (uuid: string, data: any) => void;
  onCancel: (uuid: string, data: any) => void;
  onReschedule: (uuid: string, data: any) => void;
  isCompleting: boolean;
  isCanceling: boolean;
  isRescheduling: boolean;
  error?: any;
}

export function GenericFollowupsWidget({
  title,
  followups,
  isLoading,
  variant,
  onComplete,
  onCancel,
  onReschedule,
  isCompleting,
  isCanceling,
  isRescheduling,
  error,
}: GenericFollowupsWidgetProps) {

  const renderPopoverContent = (item: DashboardFollowUp) => (
    <div className="max-w-md">
      <Space orientation="vertical" className="w-full">
        <div>
          <Title level={5} className="!mb-1 !text-sm">Description</Title>
          <Text className="text-sm dark:text-gray-300 whitespace-pre-wrap">{item.description || "No description provided."}</Text>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {item.hcoName && (
             <div className="flex flex-col">
               <Text type="secondary" className="text-xs">Healthcare Organization</Text>
               <Text className="font-medium">{item.hcoName}</Text>
             </div>
          )}
          {item.followUpMode && (
             <div className="flex flex-col">
               <Text type="secondary" className="text-xs">Mode</Text>
               <Tag variant="filled" color="magenta" className="w-fit m-0 mt-0.5">{FollowUpModesEnum[item.followUpMode]}</Tag>
             </div>
          )}
           <div className="flex flex-col">
               <Text type="secondary" className="text-xs">Scheduled Date</Text>
               <Text className="font-medium">{dayjs(item.scheduledDate).format("DD MMM YYYY, hh:mm A")}</Text>
           </div>
        </div>

        {/* Status Specific Details */}
        {item.status === 'Cancelled' && item.cancellationReason && (
           <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800">
             <Text type="danger" strong className="block text-xs mb-0.5">Cancellation Reason:</Text>
             <Text className="text-sm dark:text-red-200">{item.cancellationReason}</Text>
           </div>
        )}
        {item.status === 'Completed' && item.outcome && (
           <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800">
             <Text type="success" strong className="block text-xs mb-0.5">Outcome:</Text>
             <Text className="text-sm dark:text-green-200">{item.outcome}</Text>
           </div>
        )}

        {item.contactPersons && item.contactPersons.length > 0 && (
          <>
            <Divider className="my-2" />
            <div>
              <Title level={5} className="!mb-2 !text-sm flex items-center gap-2">
                 <User size={14} /> Contact Persons
              </Title>
              <div className="space-y-3">
                {item.contactPersons.map((contact, index) => (
                  <div key={contact.hcoContactUUID || index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex items-center justify-between mb-1">
                        <Text strong>{contact.fullName}</Text>
                        <Tag className="mr-0">{contact.role}</Tag>
                     </div>
                     <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-400">
                        {contact.email && (
                            <div className="flex items-center gap-2">
                                <Mail size={12} />
                                <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                            </div>
                        )}
                        {contact.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={12} />
                                <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                            </div>
                        )}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Space>
    </div>
  );

  return (
    <div className="border-0 shadow-lg bg-white dark:bg-black rounded-xl p-5 h-full flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        {typeof title === "string" ? (
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {title}
          </h2>
        ) : (
          title
        )}
      </div>

      <div className="flex-1 overflow-auto -mx-2 px-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spin />
          </div>
        ) : error ? (
           <div className="flex justify-center items-center h-40 text-red-500">
             <p>Error loading follow-ups</p>
           </div>
        ) : followups.length > 0 ? (
          <div className="space-y-3">
            {followups.map((item) => (
              <div
                key={item.followUpUUID}
                className={`group flex flex-col gap-2 p-3 rounded-lg border border-gray-100 dark:border-gray-800 transition-all duration-200 hover:border-blue-100 dark:hover:border-blue-900 hover:bg-blue-50/30 dark:hover:bg-blue-900/10`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30`}
                      >
                        {formatMeetingDate(item.scheduledDate)}
                      </span>
                      <FollowUpStatusBadge
                        status={item.status}
                        followUp={item}
                      />
                       <Popover 
                        content={renderPopoverContent(item)} 
                        title="Follow-up Details" 
                        trigger={["click","hover"]}
                        placement="rightTop"
                        mouseEnterDelay={0.7}
                        
                      >
                        <Button 
                            type="text"
                            size="small" 
                            variant="filled"
                            className="bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 p-1 h-auto flex items-center gap-1 text-[10px]"
                            onClick={(e) => e.stopPropagation()} // Prevent triggering other click handlers if any
                        >
                            <Info size={12} />
                        </Button>
                      </Popover>
                    </div>

                    <h3
                      className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate pr-2"
                      title={item.subject}
                    >
                      {item.subject}
                    </h3>

                    <div className="flex w-max items-center gap-0.5 mt-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {variant === "lead" ? "Lead" : "Deal"} Name:
                      </span>
                      <Link href={variant === "lead" ? `/leads/${item.leadUUID}` : `/deals/${item.dealUUID}`}>
                          <span className="text-xs hover:underline font-medium text-gray-700 dark:text-gray-300">
                            {item.leadName||item.dealName}
                          </span>
                      </Link>
                    </div>

                    {/* <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 mt-0.5">
                      {item.description}
                    </p> */}
                    {/* {item.contactPersons && item.contactPersons.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {item.contactPersons.map((contactPerson) => (
                          <Tag
                            key={contactPerson.hcoContactUUID}
                            variant="outlined"
                            className="mr-0"
                          >
                            {contactPerson.fullName}
                          </Tag>
                        ))}
                      </div>
                    )} */}

                    {/* Rescheduled Reason */}
                    {item.status === "Rescheduled" &&
                      item.nextFollowUpNotes && (
                        <div className="mt-2 bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-xs text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                          <span className="font-semibold">
                            Reschedule Reason:
                          </span>{" "}
                          {item.nextFollowUpNotes}
                        </div>
                      )}
                  </div>

                    <DashboardFollowUpActions
                      followUp={item}
                      onComplete={onComplete}
                      onCancel={onCancel}
                      onReschedule={onReschedule}
                      isCompleting={isCompleting}
                      isCanceling={isCanceling}
                      isRescheduling={isRescheduling}
                    />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 text-gray-400">
            <CheckCircle2 size={40} className="mb-2 opacity-20" />
            <p className="text-sm">No upcoming follow-ups</p>
          </div>
        )}
      </div>
    </div>
  );
}
