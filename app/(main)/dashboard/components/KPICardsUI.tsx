'use client'

import { useKPIStatsQuery } from '@/app/(main)/dashboard/services/dashboard.hooks'
import { Col, Row, Skeleton } from 'antd'
import {
  Activity,
  Handshake,
  HeartHandshake,
  Trophy,
} from 'lucide-react'
import { KpiCard } from '@/app/(main)/dashboard/components/KpiCard'

export default function KPICardsUI() {
  const { data: stats, isLoading, isError, error } = useKPIStatsQuery()

  if (isLoading) {
    return (
      <Row gutter={[24, 24]}>
        {[1, 2, 3, 4].map((i) => (
          <Col md={12} xl={6} key={i}>
            <Skeleton.Button active block style={{ height: 120 }} />
          </Col>
        ))}
      </Row>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to load KPI stats: {error?.message}
      </div>
    )
  }

  if (!stats) return null

  return (
    <Row gutter={[24, 24]}>
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
        />
      </Col>

      <Col md={12} xl={6}>
        <KpiCard
          title="Active Deals"
          value={stats.activeOpenDealsAll}
          icon={<HeartHandshake className="text-2xl" />}
          color="#f59e0b"
        />
      </Col>

      <Col md={12} xl={6}>
        <KpiCard
          title="This Month"
          value={stats.activeMonth}
          icon={<Activity className="text-2xl" />}
          color="#10b981"
        />
      </Col>
    </Row>
  )
}
