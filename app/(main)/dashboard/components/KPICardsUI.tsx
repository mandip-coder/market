"use client";
import { Card, Col, Row } from "antd";
import {
  Activity,
  ArrowUpRight,
  Handshake,
  HeartHandshake,
  Trophy,
} from "lucide-react";
import { use } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: {
    isPositive: boolean;
    value: number;
  };
  size?: "small" | "default";
}

export const KpiCard = ({
  title,
  value,
  icon,
  color = "#1890ff",
  trend,
  size,
}: KPICardProps) => {
  const fontsize = size === "small" ? "text-md" : "text-2xl";

  return (
    <Card
      variant="borderless"
      styles={{
        body: {
          padding: "20px",
          height: "100%",
        },
      }}
      className="h-full"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-gray-500 text-sm font-medium mb-1">{title}</div>
          <div className={`${fontsize} font-bold`} style={{ color }}>
            {value}
          </div>
          {trend && (
            <div
              className={`flex items-center mt-2 text-xs ${
                trend.isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight size={15} />
              ) : (
                <ArrowUpRight size={15} className="rotate-90" />
              )}
              <span className="ml-1">{Math.abs(trend.value)}%</span>
              <span className="ml-1 text-gray-400">from last month</span>
            </div>
          )}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}10`, color }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

interface KPIStats {
  data:{
    activeOpenDealsAll: number;
    wonDealsAll: number;
    totalDealsAll: number;
    activeMonth: number;
  }
}

interface KPICardsUIProps {
  response: Promise<KPIStats>;
}

export default function KPICardsUI({ response }: KPICardsUIProps) {
  const responseData = use(response);
  const stats=responseData.data
  return (
    <Row gutter={[24, 24]}>
      {/* KPI Cards */}
      <Col md={12} xl={6}>
        <KpiCard
          title="Total Deals"
          value={stats.totalDealsAll} 
          icon={<Handshake className="text-2xl" />}
          color="#4f46e5"
        />
      </Col>

      <Col md={12} xl={6}>
        <KpiCard
          title="Closed Won Deals"
          value={stats.wonDealsAll}
          icon={<Trophy className="text-2xl" />}
          color="#10b981"
          // trend={{ isPositive: false, value: 2 }}
        />
      </Col>

      <Col md={12} xl={6}>
        <KpiCard
          title="Active Deals"
          value={stats.activeOpenDealsAll}
          icon={<HeartHandshake className="text-2xl" />}
          color="#f59e0b"
          // trend={{ isPositive: true, value: 10 }}
        />
      </Col>

      <Col md={12} xl={6}>
        <KpiCard
          title="This Month"
          value={stats.activeMonth}
          icon={<Activity className="text-2xl" />}
          color="#10b981"
          // trend={{ isPositive: true, value: 50 }}
        />
      </Col>
    </Row>
  );
}
