import { APIPATH } from "@/shared/constants/url";
import { SERVERAPI } from "@/Utils/apiFunctions";
import { Col, Row } from "antd";
import {
  Activity,
  Handshake,
  HeartHandshake,
  Trophy,
} from "lucide-react";
import { KpiCard } from "./KpiCard";

interface KPIStats {
    activeOpenDealsAll: number;
    wonDealsAll: number;
    totalDealsAll: number;
    activeMonth: number;
}


export default async function KPICardsUI() {
    const kpiStatsData = await SERVERAPI(APIPATH.DASHBOARD.KPIDATA)
    const stats = kpiStatsData.data as KPIStats
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
