import { useLoginUser } from "@/hooks/useToken";
import { formatUserDisplay, GlobalDate } from "@/Utils/helpers";
import { Avatar, Button, Card, Empty, Skeleton, Tag, Timeline } from "antd";
import {
  Calendar,
  CheckCircle,
  CircleCheck,
  FilterX,
  History,
  Mail,
  Notebook,
  Paperclip,
  Phone,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteTimeline as useInfiniteDealTimeline } from "../../app/(main)/deals/services/deals.hooks";
import { useInfiniteTimeline as useInfiniteLeadTimeline } from "../../app/(main)/leads/services/leads.hooks";
import {
  DealTimelineCounts,
  TimelineEvents,
} from "../../app/(main)/deals/services/deals.types";
import { LeadTimelineCounts } from "../../app/(main)/leads/services/leads.types";
import { dealsKeys } from "../../app/(main)/deals/services/deals.queryKeys";
import { leadsKeys } from "../../app/(main)/leads/services/leads.queryKeys";
import InfiniteScrollTrigger from "./InfiniteScrollTrigger";
import AppErrorUI from "../AppErrorUI/AppErrorUI";
import { ApiError } from "@/lib/apiClient/ApiError";
import AppScrollbar from "../AppScrollBar";

// Color mapping for timeline dots
const colorMap = {
  blue: "#1890ff",
  green: "#52c41a",
  red: "#f5222d",
  purple: "#722ed1",
  orange: "#fa8c16",
  gray: "#8c8c8c",
} as const;

// Event type configuration for filters
export const eventTypes = [
  { type: "Product", icon: ShoppingCart, color: "orange" },
  { type: "Attachment", icon: Paperclip, color: "red" },
  { type: "Meeting", icon: Calendar, color: "purple" },
  { type: "Follow Up", icon: CheckCircle, color: "orange" },
  { type: "Call", icon: Phone, color: "blue" },
  { type: "Email", icon: Mail, color: "green" },
  { type: "Note", icon: Notebook, color: "gray" },
  { type: "Stage Change", icon: TrendingUp, color: "blue" },
] as const;

// Extract valid event type names for type safety
export type EventTypeName = (typeof eventTypes)[number]["type"];

// Generic timeline counts type
type TimelineCounts = DealTimelineCounts | LeadTimelineCounts;

interface TimelineComponentProps {
  entityType: "deal" | "lead";
  entityUUID: string;
  excludeTabs?: EventTypeName[];
  timelineCounts?: TimelineCounts;
}

// Custom timeline dot component
const CustomDot = ({
  color,
  type,
}: {
  color: keyof typeof colorMap;
  type: string;
}) => (
  <div
    className="p-2 rounded-full shadow-sm"
    style={{ backgroundColor: colorMap[color] }}
  >
    {type === "Product" && <ShoppingCart size={14} className="text-white" />}
    {type === "Attachment" && <Paperclip size={14} className="text-white" />}
    {type === "Meeting" && <Calendar size={14} className="text-white" />}
    {type === "Follow Up" && <CheckCircle size={14} className="text-white" />}
    {type === "Call" && <Phone size={14} className="text-white" />}
    {type === "Email" && <Mail size={14} className="text-white" />}
    {type === "Note" && <Notebook size={14} className="text-white" />}
    {type === "Stage Change" && <TrendingUp size={14} className="text-white" />}
  </div>
);

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, x: 150 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};
const eventTypeToCountKey: Record<string, keyof DealTimelineCounts> = {
  Product: "product",
  Attachment: "attachment",
  Meeting: "meeting",
  "Follow Up": "followUp",
  Call: "call",
  Email: "email",
  Note: "note",
  "Stage Change": "stageChange",
};

const TimelineComponent: React.FC<TimelineComponentProps> = ({
  entityType,
  entityUUID,
  excludeTabs,
  timelineCounts,
}) => {
  const user = useLoginUser();
  const queryClient = useQueryClient();

  const availableEventTypes = useMemo(() => {
    if (excludeTabs) {
      return eventTypes.filter((et) => !excludeTabs.includes(et.type));
    }
    return eventTypes;
  }, [excludeTabs]);

  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    availableEventTypes.map((et) => et.type)
  );

  const eventCounts = useMemo(() => {
    if (timelineCounts) {
      const counts: Record<string, number> = {};
      Object.entries(eventTypeToCountKey).forEach(([eventType, countKey]) => {
        counts[eventType] = timelineCounts[countKey] || 0;
      });
      return counts;
    }
    // Fallback if counts not passed (though infinite loading makes client-side counting hard for total)
    return {};
  }, [timelineCounts]);

  const toggleFilter = (type: string) => {
    if (selectedFilters.includes(type)) {
      setSelectedFilters(selectedFilters.filter((t) => t !== type));
    } else {
      setSelectedFilters([...selectedFilters, type]);
    }
  };

  const selectAllFilters = () => {
    if (selectedFilters.length === availableEventTypes.length) {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(availableEventTypes.map((et) => et.type));
    }
  };

  // Fetch infinite timeline data - use appropriate hook based on entity type
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isFetching,
  } =
    entityType === "deal"
      ? useInfiniteDealTimeline(entityUUID, { tabs: selectedFilters })
      : useInfiniteLeadTimeline(entityUUID, { tabs: selectedFilters });

  // Handle reload - invalidate counts and refetch timeline
  const handleReload = async () => {
    // Invalidate timeline counts based on entity type
    if (entityType === "deal") {
      await queryClient.invalidateQueries({
        queryKey: dealsKeys.timelineCounts(entityUUID),
      });
    } else {
      await queryClient.invalidateQueries({
        queryKey: leadsKeys.timelineCounts(entityUUID),
      });
    }
    // Refetch timeline data
    await refetch();
  };

  const timelineEvents = useMemo(() => {
    return data?.pages.flatMap((page) => page.list) || [];
  }, [data]);

  if (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    return (
      <AppErrorUI
        code={statusCode}
        message={error.message}
        backLink={entityType === "deal" ? "/deals" : "/leads"}
        buttonName={`Back to ${entityType === "deal" ? "Deals" : "Leads"}`}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-black rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      {/* Filter Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <History className="mr-2" size={18} />
            History Tracker
          </h3>
          <div className="flex space-x-2">
            <Button size="small" onClick={selectAllFilters} className="text-xs">
              {selectedFilters.length === availableEventTypes.length
                ? "Clear All"
                : "All"}
            </Button>
            <Button
              size="small"
              onClick={handleReload}
              className="text-xs"
              icon={
                <RefreshCw
                  className={`${isFetching ? "animate-spin" : ""}`}
                  size={14}
                />
              }
            >
              Reload
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableEventTypes.map((eventType) => {
            const Icon = eventType.icon;
            const isSelected = selectedFilters.includes(eventType.type);
            const count = eventCounts[eventType.type] || 0;

            return (
              <Button
                key={eventType.type}
                size="middle"
                icon={<Icon size={14} />}
                onClick={() => toggleFilter(eventType.type)}
                type={isSelected ? "primary" : "default"}
                variant="solid"
              >
                <div className="flex items-center">
                  <span className="mr-2">{eventType.type}</span>
                  <span className="ml-1 text-xs bg-purple-500 text-white rounded-full h-4.5 w-4.5 flex place-content-center  leading-4">
                    {count > 9 ? "9+" : count}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="mt-3">
          {timelineEvents.length === 0 && !isLoading ? (
            selectedFilters.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 dark:border-gray-700 dark:bg-gray-800">
                <FilterX className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  No filters selected
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 dark:border-gray-700 dark:bg-gray-800">
                <Empty description="No History Found" />
              </div>
            )
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-900/20">
              <div className="flex items-center">
                <CircleCheck className="mr-3 h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {/* Using flattened count */}
                  {timelineEvents.length} events Founded
                </span>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400">
                Active filters: {selectedFilters.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      {/* Timeline */}
      {isLoading ? (
        <div className="py-8">
          <Skeleton active avatar paragraph={{ rows: 4 }} />
          <div className="mt-8">
            <Skeleton active avatar paragraph={{ rows: 4 }} />
          </div>
        </div>
      ) : (
        <AppScrollbar className="max-h-[calc(100vh-480px)] overflow-x-hidden p-4">
          <Timeline
            mode="start"
            items={
              [
                ...timelineEvents.map((event: TimelineEvents) => ({
                  icon: <CustomDot color={event.color} type={event.type} />,
                  content: (
                    <motion.div
                      key={event.historyUUID}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={itemVariants}
                    >
                      <Card>
                        {/* Event Header */}
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800 dark:text-white text-lg">
                            {event.title}
                          </h4>
                          <Tag color={event.color} className="ml-2">
                            {event.type}
                          </Tag>
                        </div>

                        {/* Event Description */}
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {event.description}
                        </p>

                        {/* Event Meta */}
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-2">
                            {event.profileImageUrl ? (
                              <Avatar src={event.profileImageUrl} size={24} />
                            ) : (
                              <Avatar size={24}>{event.user.charAt(0)}</Avatar>
                            )}
                          </div>
                          <span>
                            {formatUserDisplay(
                              event.user,
                              event.userUUID,
                              user?.userUUID
                            )}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{GlobalDate(event.createdAt)}</span>
                        </div>

                        {/* Event Details - Type-specific rendering */}
                        {/* {event.type === "Stage Change" && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium text-blue-800 dark:text-blue-300">
                                Stage Progress
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3"></div>
                          </div>
                        )} */}

                        {/* {event.type === "Product" && (
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800">
                            <div className="flex items-center gap-2 mb-3">
                              <ShoppingCart className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              <span className="font-medium text-orange-800 dark:text-orange-300">
                                Product Details
                              </span>
                            </div>
                          </div>
                        )} */}

                        {/* {event.type === "Attachment" && (
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800">
                            <div className="flex items-center gap-2 mb-3">
                              <Paperclip className="w-4 h-4 text-red-600 dark:text-red-400" />
                              <span className="font-medium text-red-800 dark:text-red-300">
                                File Details
                              </span>
                            </div>
                          </div>
                        )} */}

                        {/* {event.type === "Meeting" && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <span className="font-medium text-purple-800 dark:text-purple-300">
                                Meeting Details
                              </span>
                            </div>
                            <div className="text-xs text-purple-700 dark:text-purple-400 mb-1">
                              Meeting Points
                            </div>
                          </div>
                        )} */}

                        {/* {event.type === "Follow Up" && (
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              <span className="font-medium text-orange-800 dark:text-orange-300">
                                Task Details
                              </span>
                            </div>
                          </div>
                        )} */}

                        {/* {event.type === "Call" && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-3">
                              <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium text-blue-800 dark:text-blue-300">
                                Call Details
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">
                                  Outcome
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">
                                  Duration
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {event.type === "Email" && (
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-3">
                              <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="font-medium text-green-800 dark:text-green-300">
                                Email Details
                              </span>
                            </div>
                            <div>
                              <div className="text-xs text-green-700 dark:text-green-400 mb-1">
                                Recipients
                              </div>
                            </div>
                          </div>
                        )}

                        {event.type === "Note" && (
                          <div className="bg-gray-50 dark:bg-gray-700/20 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2 mb-3">
                              <Notebook className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <span className="font-medium text-gray-800 dark:text-gray-300">
                                Note Details
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{event.title}</div>
                              <div className="text-gray-600 dark:text-gray-400 mt-2">
                                {event.description.substring(0, 100)}
                                {event.description.length > 100 && "..."}
                              </div>
                            </div>
                          </div>
                        )} */}
                      </Card>
                    </motion.div>
                  ),
                })),
                // Add loading trigger at the end
                hasNextPage
                  ? {
                      icon: <div className="w-2 h-2" />, // Empty icon for loader
                      content: (
                        <InfiniteScrollTrigger
                          onIntersect={() => fetchNextPage()}
                          isLoading={isFetchingNextPage}
                          hasMore={!!hasNextPage}
                        />
                      ),
                    }
                  : null,
              ].filter(Boolean) as any
            }
          />
        </AppScrollbar>
      )}
    </div>
  );
};

export default TimelineComponent;
