"use client";

import {
  UserOutlined
} from "@ant-design/icons";
import ProTable, { ProColumns } from "@ant-design/pro-table";
import { Avatar, Card, Tag, Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useMemo, useState } from "react";
import { useUserPerformance } from "../services/admin.hooks";
import { UserPerformance } from "../services/types";
import GlobalFilter from "./GlobalFilter";
import { RefreshCw } from "lucide-react";

interface UserPerformanceTableProps {}

const UserPerformanceTable: React.FC<UserPerformanceTableProps> = () => {
  // State - Initialize with current month by default
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const analyticsParams = useMemo(() => {
    if (dateRange[0] && dateRange[1]) {
      return {
        startDate: dateRange[0]?.toISOString(),
        endDate: dateRange[1]?.toISOString(),
      };
    }
    return { period: "month" as const }; // Default to month if no date range selected
  }, [dateRange]);

  // Fetch user performance data
  const { data: userData, isLoading: userLoading, error, refetch,isRefetching } = useUserPerformance(analyticsParams);

  // Handlers
  const handleUserClick = (user: UserPerformance) => {
    setSelectedUser(user.userUUID);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  // Helper to format numbers with commas for better readability
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Helper to get win rate status
  const getWinRateStatus = (winRate: number) => {
    if (winRate >= 70) return { color: "success", text: "Excellent" };
    if (winRate >= 50) return { color: "processing", text: "Good" };
    if (winRate >= 30) return { color: "warning", text: "Average" };
    return { color: "error", text: "Low" };
  };

  const columns: ProColumns<UserPerformance>[] = [
    {
      title: "User Details",
      key: "user",
      fixed: "left",
      width: 250,
      render: (_, record) => {
        const winRateStatus = getWinRateStatus(record.winRate);
        const initials=record.fullName.split(" ").map((name) => name.charAt(0)).join("").toUpperCase();
        return (
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-blue-50/50 p-2.5 rounded-lg transition-all group dark:hover:bg-gray-700/50"
            onClick={() => handleUserClick(record)}
          >
            <Avatar
              size={44}
              src={record.userProfileImage}
              className="flex-shrink-0"
            >
              {initials}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 truncate">
                {record.initial}.{record.fullName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {record.role}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Win Rate: {record.winRate}%
                </span>
                <Tag color={winRateStatus.color} className="text-xs px-1.5 py-0 m-0">
                  {winRateStatus.text}
                </Tag>
              </div>
            </div>
          </div>
        );
      },
    },

    {
      title: "Mass Emails",
      dataIndex: "massEmails",
      key: "massEmails",
      width: 10,
      align: "right",
      sorter: (a, b) => a.massEmails - b.massEmails,
      render: (_, record) => (
        <Tooltip title="Total Mass Emails Sent">
          <span className="font-medium text-gray-800 dark:text-gray-200 tabular-nums">
            {formatNumber(record.massEmails)}
          </span>
        </Tooltip>
      ),
    },

    // Leads Grouped Column
    {
      title: "Lead Analysis",
      key: "leads",
      children: [
        {
          title: "Total",
          dataIndex: ["leads", "total"],
          key: "leadsTotal",
          width: 60,
          align: "right",
          sorter: (a, b) => a.leads.total - b.leads.total,
          render: (_, record) => (
            <Tooltip title="Total Leads">
              <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                {formatNumber(record.leads.total)}
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Calls",
          dataIndex: ["leads", "callsMade"],
          key: "leadsCallsMade",
          width: 60,
          align: "right",
          sorter: (a, b) => a.leads.callsMade - b.leads.callsMade,
          render: (_, record) => (
            <Tooltip title="Calls Made for Leads">
              <span className="text-gray-700 dark:text-gray-300 tabular-nums">
                {formatNumber(record.leads.callsMade)}
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Meetings",
          dataIndex: ["leads", "meetingsHeld"],
          key: "leadsMeetingsHeld",
          width: 60,
          align: "right",
          sorter: (a, b) => a.leads.meetingsHeld - b.leads.meetingsHeld,
          render: (_, record) => (
            <Tooltip title="Meetings Held for Leads">
              <span className="text-gray-700 dark:text-gray-300 tabular-nums">
                {formatNumber(record.leads.meetingsHeld)}
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Follow Ups",
          dataIndex: ["leads", "followUps"],
          key: "leadsFollowUps",
          width: 120,
          align: "right",
          sorter: (a, b) => a.leads.followUps - b.leads.followUps,
          render: (_, record) => (
            <Tooltip title="Follow-ups Completed for Leads">
              <span className="text-gray-700 dark:text-gray-300 tabular-nums">
                {formatNumber(record.leads.followUps)}
              </span>
            </Tooltip>
          ),
        },
      ],
    },

    // Deals Grouped Column
    {
      title: "Deal Analysis",
      key: "deals",
      children: [
        {
          title: "Total",
          dataIndex: ["deals", "total"],
          key: "dealsTotal",
          width: 60,
          align: "right",
          sorter: (a, b) => a.deals.total - b.deals.total,
          render: (_, record) => (
            <Tooltip title="Total Deals">
              <span className="font-semibold text-purple-600 dark:text-purple-400 tabular-nums">
                {formatNumber(record.deals.total)}
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Products",
          dataIndex: ["deals", "productsPromoted"],
          key: "dealsProductsPromoted",
          width: 60,
          align: "right",
          sorter: (a, b) => a.deals.productsPromoted - b.deals.productsPromoted,
          render: (_, record) => (
            <Tooltip title="Products Promoted">
              <span className="text-gray-700 dark:text-gray-300 tabular-nums">
                {formatNumber(record.deals.productsPromoted)}
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Follow Ups",
          dataIndex: ["deals", "followUps"],
          key: "dealsFollowUps",
          width: 120,
          align: "right",
          sorter: (a, b) => a.deals.followUps - b.deals.followUps,
          render: (_, record) => (
            <Tooltip title="Follow-ups for Deals">
              <span className="text-gray-700 dark:text-gray-300 tabular-nums">
                {formatNumber(record.deals.followUps)}
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Calls",
          dataIndex: ["deals", "callsMade"],
          key: "dealsCallsMade",
          width: 60,
          align: "right",
          sorter: (a, b) => a.deals.callsMade - b.deals.callsMade,
          render: (_, record) => (
            <Tooltip title="Calls Made for Deals">
              <span className="text-gray-700 dark:text-gray-300 tabular-nums">
                {formatNumber(record.deals.callsMade)}
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Meetings",
          dataIndex: ["deals", "meetingsHeld"],
          key: "dealsMeetingsHeld",
          width: 60,
          align: "right",
          sorter: (a, b) => a.deals.meetingsHeld - b.deals.meetingsHeld,
          render: (_, record) => (
            <Tooltip title="Meetings Held for Deals">
              <span className="text-gray-700 dark:text-gray-300 tabular-nums">
                {formatNumber(record.deals.meetingsHeld)}
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Won",
          dataIndex: ["deals", "wonDeals"],
          key: "dealsWonDeals",
          width: 60,
          align: "right",
          sorter: (a, b) => a.deals.wonDeals - b.deals.wonDeals,
          render: (_, record) => {
            const val = record.deals.wonDeals;
            const winRate = record.deals.total > 0 
              ? Math.round((val / record.deals.total) * 100) 
              : 0;
            return (
              <Tooltip title={`Won Deals (${winRate}% of total)`}>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="font-semibold text-green-600 dark:text-green-400 tabular-nums">
                    {formatNumber(val)}
                  </span>
                  {winRate > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({winRate}%)
                    </span>
                  )}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: "Lost",
          dataIndex: ["deals", "lostDeals"],
          key: "dealsLostDeals",
          width: 60,
          align: "right",
          sorter: (a, b) => a.deals.lostDeals - b.deals.lostDeals,
          render: (_, record) => {
            const val = record.deals.lostDeals;
            const lossRate = record.deals.total > 0 
              ? Math.round((val / record.deals.total) * 100) 
              : 0;
            return (
              <Tooltip title={`Lost Deals (${lossRate}% of total)`}>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                    {formatNumber(val)}
                  </span>
                  {lossRate > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({lossRate}%)
                    </span>
                  )}
                </div>
              </Tooltip>
            );
          },
        },
      ],
    },

    {
      title: "Healthcare",
      dataIndex: "healthcare",
      key: "healthcare",
      width: 60,
      align: "right",
      sorter: (a, b) => a.healthcare - b.healthcare,
      render: (_, record) => (
        <Tooltip title="Healthcare Interactions">
          <span className="font-medium text-gray-800 dark:text-gray-200 tabular-nums">
            {formatNumber(record.healthcare)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "ICBs",
      dataIndex: "icbs",
      key: "icbs",
      width: 60,
      align: "right",
      sorter: (a, b) => a.icbs - b.icbs,
      render: (_, record) => (
        <Tooltip title="ICB Interactions">
          <span className="font-medium text-gray-800 dark:text-gray-200 tabular-nums">
            {formatNumber(record.icbs)}
          </span>
        </Tooltip>
      ),
    },

    {
      title: "Total Approached",
      dataIndex: "totalPersonsApproached",
      key: "totalPersonsApproached",
      width: 60,
      align: "right",
      sorter: (a, b) => a.totalPersonsApproached - b.totalPersonsApproached,
      render: (_, record) => (
        <Tooltip title="Total Persons Approached">
          <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
            {formatNumber(record.totalPersonsApproached)}
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card title="User Performance" variant="outlined">
      {/* Global Filter */}

      <ProTable<UserPerformance>
        columns={columns}
        dataSource={userData || []}
        loading={userLoading}
        rowKey="userUUID"
        search={false}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
        }}
        options={{
          density: true,
          fullScreen: true,
          reload: ()=>refetch(),
          setting: true,
          reloadIcon:<RefreshCw size={18} className={ isRefetching ? "animate-spin" : ""}/>
        }}
        bordered
        headerTitle={
          <GlobalFilter
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onDateRangeChange={(dates) => setDateRange(dates || [null, null])}
          />
        }
        scroll={{ x: "max-content" }}
        cardProps={{ 
          bordered: false, 
          bodyStyle: { padding: 0 },
        }}
        rowClassName="hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
      />

      {/* User Detail Drawer */}
      {/* <UserDetailDrawer
        userId={selectedUser}
        open={drawerOpen}
        onClose={handleDrawerClose}
      /> */}
    </Card>
  );
};

export default UserPerformanceTable;
