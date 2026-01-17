"use client";

import { PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Drawer, Empty, Row, Segmented, Spin, Statistic, Tag, Timeline } from "antd";
import ReactECharts from "echarts-for-react";
import React, { useState } from "react";
import { useUserDetails } from "../services/admin.hooks";

interface UserDetailDrawerProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}

const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  userId,
  open,
  onClose,
}) => {
  const [mode, setMode] = useState<"Overview" | "Work" | "Insights">("Overview");
  const { data: user, isLoading } = useUserDetails(userId);

  const renderOverview = () => {
    if (!user) return null;
    return (
      <div className="space-y-6 animate-fade-in">
        {/* KPI Grid */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card variant="outlined" className="bg-gray-50">
              <Statistic title="Leads Handled" value={user.leadsHandled} />
            </Card>
          </Col>
          <Col span={12}>
            <Card variant="outlined" className="bg-gray-50">
              <Statistic title="Deals Closed" value={user.dealsClosed} />
            </Card>
          </Col>
          <Col span={12}>
            <Card variant="outlined" className="bg-gray-50">
              <Statistic title="Win Rate" value={user.winRate} suffix="%" precision={1} />
            </Card>
          </Col>
          <Col span={12}>
            <Card variant="outlined" className="bg-gray-50">
               <Statistic title="Avg Close Time" value={user.avgCloseTime} suffix="days" />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderWork = () => {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500">
         <Empty description="Work Logs Integration Pending" />
         <p className="text-xs mt-2">Will separate Leads/Deals/Logs context here.</p>
      </div>
    );
  };

  const renderInsights = () => {
     if (!user) return null;
     
    const chartOption = {
        title: { text: "Deals by Category", left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'item' },
        series: [
            {
                name: 'Category',
                type: 'pie',
                radius: ['40%', '70%'],
                data: user.dealsByCategory.map(d => ({ value: d.count, name: d.category })),
                 itemStyle: {
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 1
                },
            }
        ]
    };

    return (
      <div className="space-y-6">
         <Card variant="outlined">
            <ReactECharts option={chartOption} style={{ height: 300 }} opts={{ renderer: 'svg' }} />
         </Card>
      </div>
    );
  };

  return (
    <Drawer
      title={
        user ? (
          <div className="flex items-center gap-3">
            <Avatar size="large" src={user.avatar} icon={<UserOutlined />} className="bg-blue-500">
              {user.name.charAt(0)}
            </Avatar>
            <div>
              <div className="font-bold text-lg">{user.name}</div>
              <div className="text-xs font-normal text-gray-500 flex items-center gap-2">
                 <span>{user.role}</span>
                 {user.phone && <span className="flex items-center gap-1"><PhoneOutlined /> {user.phone}</span>}
              </div>
            </div>
          </div>
        ) : "Loading..."
      }
      placement="top"
      size={"large"}
      onClose={onClose}
      open={open}
      loading={isLoading}
      className="user-detail-drawer"
      destroyOnHidden
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
            <Spin size="large" />
        </div>
      ) : user ? (
        <>
            <div className="mb-6">
                <Segmented<string>
                    block
                    options={["Overview", "Work", "Insights"]}
                    value={mode}
                    onChange={(val) => setMode(val as any)}
                />
            </div>

            {mode === "Overview" && renderOverview()}
            {mode === "Work" && renderWork()}
            {mode === "Insights" && renderInsights()}
        </>
      ) : (
        <Empty description="User not found" />
      )}
    </Drawer>
  );
};

export default UserDetailDrawer;
