"use client";

import { Card } from 'antd';
import { Activity, Building2, Calendar, CheckCircle2, Hospital, Mail, MessageSquare, Network, PhoneCall, TrendingUp } from 'lucide-react';
import { CoverageSnapshot } from '../types/coverage.types';

interface ExecutiveSnapshotProps {
  snapshot: CoverageSnapshot;
}
export const ExecutiveSnapshot = ({ snapshot }: ExecutiveSnapshotProps) => {
  const stats = [
    {
      title: 'Total Deals',
      value: snapshot.totalDeals,
      icon: <TrendingUp className="h-6 w-6 text-orange-500" />,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      description: 'All deals for this product',
    },
    {
      title: 'Active Deals',
      value: snapshot.activeDeals,
      icon: <Activity className="h-6 w-6 text-emerald-500" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      description: 'Deals in progress',
    },
    {
      title: 'Closed Won',
      value: snapshot.closedWon,
      icon: <CheckCircle2 className="h-6 w-6 text-teal-500" />,
      color: 'text-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      description: 'Successfully closed deals',
    },
    {
      title: 'Closed Lost',
      value: snapshot.closedLost,
      icon: <Activity className="h-6 w-6 text-red-500" />,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      description: 'Lost deals',
    },
    {
      title: 'Follow Ups',
      value: snapshot.followups,
      icon: <PhoneCall className="h-6 w-6 text-purple-500" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Follow-up activities scheduled',
    },
    {
      title: 'Communication Logs',
      value: snapshot.callLogs,
      icon: <MessageSquare className="h-6 w-6 text-amber-500" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      description: 'All communication activities logged',
    },
    {
      title: 'Meetings',
      value: snapshot.meetings,
      icon: <Calendar className="h-6 w-6 text-indigo-500" />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'Meetings conducted',
    },
    {
      title: 'Emails',
      value: snapshot.emails,
      icon: <Mail className="h-6 w-6 text-blue-500" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Email communications sent',
    },
    {
      title: 'Healthcares',
      value: snapshot.hcos,
      icon: <Hospital className="h-6 w-6 text-cyan-500" />,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      description: 'Healthcare organizations engaged',
    },
    {
      title: 'ICBs',
      value: snapshot.icbs,
      icon: <Network className="h-6 w-6 text-pink-500" />,
      color: 'text-pink-600',
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      description: 'Integrated Care Boards covered',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="group hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700"
          size="small"
        >
          <div className="flex flex-col space-y-3">
            {/* Icon and Value */}
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>

            {/* Title and Description */}
            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {stat.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stat.description}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
