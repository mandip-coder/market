"use client";

import { Card, Tag, Avatar, Tooltip } from 'antd';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { HealthcareWithDeals } from '../types/coverage.types';
import { useDropdownDealStages } from '@/services/dropdowns/dropdowns.hooks';

dayjs.extend(relativeTime);

interface HealthcareEngagementCardProps {
  healthcare: HealthcareWithDeals;
  onClick: () => void;
}

export const HealthcareEngagementCard = ({
  healthcare,
  onClick,
}: HealthcareEngagementCardProps) => {
  // Fetch dynamic deal stages
  const { data: dealStages = [] } = useDropdownDealStages();

  // Helper to get stage color by name
  const getStageColorByName = (stageName: string): string => {
    const name = stageName.toLowerCase();
    if (name.includes('discussion')) return 'blue';
    if (name.includes('negotiation')) return 'orange';
    if (name.includes('won')) return 'green';
    if (name.includes('lost')) return 'red';
    return 'default';
  };

  // Get unique people initials for avatars
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate colors for avatars based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
      '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const displayPeople = healthcare.involvedPeople.slice(0, 3);
  const remainingCount = healthcare.involvedPeople.length - 3;

  // Get stage info dynamically
  const latestStage = dealStages.find(s => s.dealStageUUID === healthcare.latestDealStage);
  const stageName = latestStage?.dealStageName || 'Unknown';
  const stageColor = getStageColorByName(stageName);

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer hover:!border-blue-400 dark:hover:!border-blue-600 !border-gray-200 dark:!border-gray-700"
    >
      <div className="flex flex-col gap-3">
        {/* Header with Icon and Name */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 group-hover:scale-110 transition-transform duration-300">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-1">
              {healthcare.hcoName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {healthcare.healthcareCode}
            </p>
          </div>
        </div>

        {/* Deal Stage and Count */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Tag
            color={stageColor}
            className="text-xs font-medium m-0"
          >
            {stageName}
          </Tag>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="font-medium">{healthcare.deals.length} {healthcare.deals.length === 1 ? 'deal' : 'deals'}</span>
          </div>
        </div>

        {/* People Involved */}
        <div className="flex items-center gap-2 pt-1">
          <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <Avatar.Group
            max={{
              count: 3,
              style: {
                color: '#fff',
                backgroundColor: '#1890ff',
                fontSize: '10px',
              },
            }}
            size="small"
          >
            {displayPeople.map((person, index) => (
              <Tooltip key={index} title={person}>
                <Avatar
                  size="small"
                  style={{
                    backgroundColor: getAvatarColor(person),
                    fontSize: '10px',
                  }}
                >
                  {getInitials(person)}
                </Avatar>
              </Tooltip>
            ))}
            {remainingCount > 0 && (
              <Tooltip title={`${remainingCount} more`}>
                <Avatar
                  size="small"
                  style={{
                    backgroundColor: '#1890ff',
                    fontSize: '10px',
                  }}
                >
                  +{remainingCount}
                </Avatar>
              </Tooltip>
            )}
          </Avatar.Group>
        </div>

        {/* Last Activity - Footer */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-2 mt-1 border-t border-gray-100 dark:border-gray-700">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Updated {dayjs(healthcare.lastActivityDate).fromNow()}</span>
        </div>
      </div>
    </Card>
  );
};
