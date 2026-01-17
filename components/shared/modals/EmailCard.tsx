'use client';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  MailOutlined,
  PaperClipOutlined
} from '@ant-design/icons';
import { Badge, Button, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { Email } from '@/lib/types';

interface EmailCardProps {
  email: Email;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({
  email,
  isSelected,
  onSelect,
  onView
}) => {
  const hasAttachments = email.attachments && email.attachments.length > 0;

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-lg border transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'border-blue-500 shadow-lg shadow-blue-100 dark:shadow-blue-900/20 scale-[1.02]'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
      }`}
    >
      {/* Gradient accent bar */}
      <div className={`h-1 bg-gradient-to-r ${
        isSelected 
          ? 'from-blue-500 via-blue-400 to-blue-500' 
          : 'from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700'
      } transition-all duration-300`} />

      <div
        className="p-4 cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <MailOutlined className="text-white text-lg" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with subject and actions */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1">
                  {email.subject}
                </h4>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <Badge
                    status="success"
                    text={<span className="text-xs font-medium text-green-600 dark:text-green-400">Sent</span>}
                  />
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <ClockCircleOutlined className="text-xs" />
                    <span>{dayjs(email.sentAt).format('D MMM, YYYY h:mm A')}</span>
                  </div>
                  {hasAttachments && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <PaperClipOutlined className="text-xs" />
                        <span>{email.attachments.length}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <Tooltip title="View full email">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                />
              </Tooltip>
            </div>

            {/* Recipients */}
            <div className="mb-2 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0">To:</span>
                <div className="flex-1 flex flex-wrap gap-1">
                  {email.recipients.slice(0, 3).map((recipient: string, idx: number) => (
                    <Tag
                      key={idx}
                      variant='outlined'
                      className="m-0 text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    >
                      {recipient}
                    </Tag>
                  ))}
                  {email.recipients.length > 3 && (
                    <Tag className="m-0 text-xs bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400">
                      +{email.recipients.length - 3} more
                    </Tag>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div
              className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 pl-2.5 border-l-2 border-gray-200 dark:border-gray-700"
              dangerouslySetInnerHTML={{
                __html: email.body.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
              }}
            />

            {/* Status badge */}
            <div className="mt-2.5 flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                <CheckCircleOutlined className="text-green-600 dark:text-green-400 text-xs" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  Delivered
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCard;
