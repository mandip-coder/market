import { Badge, Card, Tooltip, Typography } from "antd";
import { formatUserDisplay, GlobalDate } from "@/Utils/helpers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Building, Calendar, Clock, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Deal, Stage, STAGE_LABELS } from "../../../../lib/types";

dayjs.extend(relativeTime);

export const cardVariants = {
  hidden: {
    opacity: 0,
    y: 80,
    scale: 0.95,
    transition: {
      duration: 0.5
    }
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
};



export const DealCard = ({ deal, page }: { deal: Deal; page: number }) => {
  const dealKey = `${deal.dealUUID}-${page}`;
  const stage = deal.dealStage;
  /* Ribbon Colors for valid AntD Badge colors */
  const ribbonColors: Record<Deal["dealStage"], string> = {
    [Stage.CLOSED_LOST]: "red",
    [Stage.CLOSED_WON]: "green",
    [Stage.DISCUSSION]: "blue",
    [Stage.NEGOTIATION]: "gold",
  };

  return (
    <motion.div
      className="h-full"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={cardVariants}
    >
      <Badge.Ribbon
        text={STAGE_LABELS[stage]}
        color={ribbonColors[stage] || "blue"}
        style={{
          fontSize: "11px",
        }}
      >
        <Link href={`/deals/${deal.dealUUID}`}>
          <Card
            hoverable
            size="small"
            title={
              <div className="flex items-start gap-2 mb-2 pt-4">
                <div className="flex-1 min-w-0">
                  {/* Deal name */}
                  <Typography.Paragraph
                    ellipsis={{ rows: 1, tooltip: true }}
                    className="!mb-1 !text-[16px] !font-medium"
                  >
                    {deal.dealName || "Untitled Deal"}
                  </Typography.Paragraph>

                  {/* HCO / Organization with tooltip */}
                  <Tooltip title="Organization / HCO">
                    <p className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                      <Building className="h-3 w-3 flex-shrink-0 text" />
                      <span>{deal.hcoName || "Unknown healthcare"}</span>
                    </p>
                  </Tooltip>
                </div>
              </div>
            }
            className="!h-full relative group"
          >
            <div className="p-2">
              {/* Summary */}
              <div className="mb-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded p-2 border border-slate-200 dark:border-slate-700">
                {deal.summary ? (
                  <Typography.Paragraph
                    ellipsis={{ rows: 2, tooltip: true }}
                    className="!mb-0"
                  >
                    {deal.summary}
                  </Typography.Paragraph>
                ) : (
                  <span className="italic text-slate-400">No summary</span>
                )}
              </div>

              {/* Footer Grid */}
              <div className="grid grid-cols-2 gap-1.5 text-[12px] border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                {/* Deal Date */}
                <Tooltip title="Expected closing date">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="h-3 w-3 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      {deal.dealDate
                        ? GlobalDate(deal.dealDate)
                        : "—"}
                    </span>
                  </div>
                </Tooltip>

                {/* Owner */}
                <Tooltip title="Deal owner">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="h-3 w-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      {formatUserDisplay(deal.createdBy, deal.userUUID, deal.createdByUUID)}
                    </span>
                  </div>
                </Tooltip>

                {/* Updated */}
                <Tooltip title="Last updated time for this deal">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Clock className="h-3 w-3 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      {deal.updatedAt
                        ? dayjs(deal.updatedAt).fromNow()
                        : "Never"}
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
};
