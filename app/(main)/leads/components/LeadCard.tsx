import { Badge, Card, Tooltip, Typography } from "antd";
import { GlobalDate } from "@/Utils/helpers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Building,
  Calendar,
  ChevronRight,
  Clock,
  User,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Lead } from "./LeadsListing";
import { LoadingOutlined } from "@ant-design/icons";
import { formatUserDisplay } from "@/Utils/helpers";
import { useLoginUser } from "@/hooks/useToken";

dayjs.extend(relativeTime);

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 20 }
  },
  exit: { opacity: 0, y: 10, transition: { duration: 0.15 } }
};



export default function LeadCard({
  lead,
  page = 1
}: {
  lead: Lead;
  page?: number;
}) {
  const user = useLoginUser()
  const leadKey = `${lead.leadUUID}-${page}`;
  const primaryContact = lead.contactPersons?.[0];
  const extraContacts =
    lead.contactPersons && lead.contactPersons.length > 1
      ? lead.contactPersons.length - 1
      : 0;
  const STATUSMAP = {
    new: {
      text: <span className="text-blue-900">New</span>,
      color: "#8bb5f0",
    },
    inProgress: {
      text: <div className="flex items-center gap-1">
        <LoadingOutlined className="h-3.5 w-3.5 " spin />
        <span className="text-green-900">In Progress</span>
      </div>,
      color: "#8bd268",
    },
    cancelled: {
      text: <Tooltip title={lead.closeReason}>
        <span className="text-red-900">Cancelled</span></Tooltip>,
      color: "#ea757c",
    },
  }

  return (
    <motion.div
      //@ts-ignore
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      key={leadKey}
      className="h-full"
    >
      <Badge.Ribbon text={STATUSMAP[lead.leadStatus]?.text || "Unknown"} color={STATUSMAP[lead.leadStatus]?.color || "#8bb5f0"} style={{
        fontSize: "11px",

      }}
        styles={{
          root: {
            height: "100%",
          }
        }}
      >
        <Link href={`/leads/${lead.leadUUID}`} className="!h-full !block">
          <Card
            hoverable
            size="small"
            title={
              <div className="flex items-start gap-2 mb-2 pt-4">
                <div className="flex-1 min-w-0">
                  {/* Lead name */}
                  <Typography.Paragraph
                    ellipsis={{ rows: 1, tooltip: true }}
                    className="!mb-1 !text-[16px] !font-medium"
                  >
                    {lead.leadName}
                  </Typography.Paragraph>

                  {/* HCO / Organization with tooltip */}
                  <Tooltip title="Organization / HCO">
                    <p className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                      <Building className="h-3 w-3 flex-shrink-0 text" />
                      <span>{lead.hcoName}</span>
                    </p>
                  </Tooltip>
                </div>


              </div>
            }
            className="!h-full relative group"
          >

            <div className="p-2">
              {/* Header */}


              {/* Summary */}
              <div className="mb-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded p-2 border border-slate-200 dark:border-slate-700">
                {lead.summary ? (
                  <Typography.Paragraph
                    ellipsis={{ rows: 2, tooltip: true }}
                    className="!mb-0"
                  >
                    {lead.summary}
                  </Typography.Paragraph>
                ) : (
                  <span className="italic text-slate-400">No summary</span>
                )}
              </div>

              {/* Footer Grid */}
              <div className="grid grid-cols-2 gap-1.5 text-[12px] border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                {/* Created By */}
                <Tooltip title="Lead created by (Owner)">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="h-3 w-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      {formatUserDisplay(lead.createdBy, lead.createdUUID, user?.userUUID)}
                    </span>
                  </div>
                </Tooltip>

                {/* Created Date */}
                <Tooltip title="Lead created on this date">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="h-3 w-3 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      {lead.leadDate
                        ? GlobalDate(lead.leadDate)
                        : "—"}
                    </span>
                  </div>
                </Tooltip>

                {/* Contacts */}
                <Tooltip title="Contact person(s) for this lead">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Users className="h-3 w-3 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    {primaryContact ? (
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-slate-600 dark:text-slate-400 truncate">
                          {primaryContact.fullName}
                        </span>

                        {extraContacts > 0 && (
                          <Tooltip
                            placement="top"
                            mouseEnterDelay={0.5}
                            trigger={["hover", "click"]}
                            title={
                              <div className="space-y-1 text-sm">
                                {lead.contactPersons.slice(1).map((c) => (
                                  <div key={c.hcoContactUUID}>{c.fullName}</div>
                                ))}
                              </div>
                            }
                          >
                            <Badge
                              size="small"
                              count={"+" + extraContacts}
                              color="blue"
                            />
                          </Tooltip>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">No contact person</span>
                    )}
                  </div>
                </Tooltip>

                {/* Updated */}
                <Tooltip title="Last updated time for this lead">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Clock className="h-3 w-3 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      {lead.updatedAt ? dayjs(lead.updatedAt).fromNow() : "Never"}
                    </span>
                  </div>
                </Tooltip>
              </div>

            </div>
          </Card>
        </Link>
      </Badge.Ribbon>
    </motion.div>
  );
}
