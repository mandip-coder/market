import { Button, Card, Tag, Timeline } from 'antd';
import { formatUserDisplay, GlobalDate } from '@/Utils/helpers';
import dayjs from 'dayjs';
import {
  Calendar,
  CheckCircle,
  CircleCheck,
  CircleSlash,
  FilterX,
  History,
  Mail,
  Notebook,
  Paperclip,
  Phone,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { STAGE_LABELS } from '@/lib/types';

// Base timeline event type
export interface TimelineEvent {
  id: number;
  type: 'Product' | 'Attachment' | 'Meeting' | 'Follow Up' | 'Call' | 'Email' | 'Note' | 'Stage Change' | 'Reminder';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  userUUID?: string;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'gray';
  details?: any;
}

interface TimelineComponentProps {
  timelineEvents: TimelineEvent[];
  currentUserUUID?: string | null;
}

// Color mapping for timeline dots
const colorMap = {
  blue: '#1890ff',
  green: '#52c41a',
  red: '#f5222d',
  purple: '#722ed1',
  orange: '#fa8c16',
  gray: '#8c8c8c'
} as const;

// Event type configuration for filters
const eventTypes = [
  { type: 'Product', icon: ShoppingCart, color: 'orange' },
  { type: 'Attachment', icon: Paperclip, color: 'red' },
  { type: 'Meeting', icon: Calendar, color: 'purple' },
  { type: 'Follow Up', icon: CheckCircle, color: 'orange' },
  { type: 'Call', icon: Phone, color: 'blue' },
  { type: 'Email', icon: Mail, color: 'green' },
  { type: 'Note', icon: Notebook, color: 'gray' },
  { type: 'Stage Change', icon: TrendingUp, color: 'blue' },
  { type: 'Reminder', icon: Calendar, color: 'red' }
];

// Custom timeline dot component
const CustomDot = ({ color, type }: { color: keyof typeof colorMap; type: string }) => (
  <div
    className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-sm -ml-2.5"
    style={{ backgroundColor: colorMap[color] }}
  >
    {type === 'Product' && <ShoppingCart size={14} className="text-white" />}
    {type === 'Attachment' && <Paperclip size={14} className="text-white" />}
    {type === 'Meeting' && <Calendar size={14} className="text-white" />}
    {type === 'Follow Up' && <CheckCircle size={14} className="text-white" />}
    {type === 'Call' && <Phone size={14} className="text-white" />}
    {type === 'Email' && <Mail size={14} className="text-white" />}
    {type === 'Note' && <Notebook size={14} className="text-white" />}
    {type === 'Stage Change' && <TrendingUp size={14} className="text-white" />}
    {type === 'Reminder' && <Calendar size={14} className="text-white" />}
  </div>
);


const TimelineComponent: React.FC<TimelineComponentProps> = ({ timelineEvents, currentUserUUID }) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(eventTypes.map(et => et.type));

  // Calculate event counts for each type
  const eventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    timelineEvents.forEach(event => {
      counts[event.type] = (counts[event.type] || 0) + 1;
    });
    return counts;
  }, [timelineEvents]);

  const toggleFilter = (type: string) => {
    if (selectedFilters.includes(type)) {
      setSelectedFilters(selectedFilters.filter(t => t !== type));
    } else {
      setSelectedFilters([...selectedFilters, type]);
    }
  };

  const selectAllFilters = () => {
    if (selectedFilters.length === eventTypes.length) {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(eventTypes.map(et => et.type));
    }
  };

  const filteredEvents = timelineEvents.filter(event =>
    selectedFilters.includes(event.type)
  );

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
            <Button
              size="small"
              onClick={selectAllFilters}
              className="text-xs"
            >
              {selectedFilters.length === eventTypes.length ? 'Clear All' : 'All'}
            </Button>

          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {eventTypes.map((eventType) => {
            const Icon = eventType.icon;
            const isSelected = selectedFilters.includes(eventType.type);
            const count = eventCounts[eventType.type] || 0;

            return (
              <Button
                key={eventType.type}
                size="middle"
                icon={<Icon size={14} />}
                onClick={() => toggleFilter(eventType.type)}
                type={isSelected ? 'primary' : 'default'}
                variant='solid'
              >
                <div className="flex items-center">
                  <span className='mr-2'>{eventType.type}</span>
                  {count > 0 && <span className="ml-1 text-xs bg-purple-500 text-white rounded-full h-4.5 w-4.5 flex place-content-center  leading-4">{count > 9 ? '9+' : count}</span>}
                </div>
              </Button>
            );
          })}
        </div>

        <div className="mt-3">
          {selectedFilters.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 dark:border-gray-700 dark:bg-gray-800">
              <FilterX className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                No filters selected
              </span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 dark:border-gray-700 dark:bg-gray-800">
              <CircleSlash className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                No events match your filters
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-900/20">
              <div className="flex items-center">
                <CircleCheck className="mr-3 h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {filteredEvents.length} events found
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
      <Timeline
        mode="start"
        items={filteredEvents.map((event: TimelineEvent) => ({
          icon: <CustomDot color={event.color} type={event.type} />,
          content: (
            <Card key={event.id}>
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
                  {formatUserDisplay(event.user, event.userUUID, currentUserUUID).charAt(0)}
                </div>
                <span>{formatUserDisplay(event.user, event.userUUID, currentUserUUID)}</span>
                <span className="mx-2">•</span>
                <span>{dayjs(event.timestamp).format('MMM D, YYYY h:mm A')}</span>
              </div>

              {/* Event Details - Type-specific rendering */}
              {event.type === 'Stage Change' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-800 dark:text-blue-300">Stage Progress</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">Previous Stage</div>
                      <div className="font-medium">{STAGE_LABELS[event.details.previousStage as keyof typeof STAGE_LABELS]}</div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">New Stage</div>
                      <div className="font-medium">{STAGE_LABELS[event.details.newStage as keyof typeof STAGE_LABELS]}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">Reason</div>
                      <div className="font-medium">{event.details.reason}</div>
                    </div>
                  </div>
                </div>
              )}

              {event.type === 'Product' && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-orange-800 dark:text-orange-300">Product Details</span>
                  </div>
                  <div>
                    <div className="font-medium text-lg">{event.details.product.name}</div>
                    {event.details.product.description && (
                      <div className="text-gray-600 dark:text-gray-400 mt-2">
                        {event.details.product.description}
                      </div>
                    )}
                    {event.details.product.price && (
                      <div className="mt-3 font-bold text-orange-700 dark:text-orange-400 text-lg">
                        ${event.details.product.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {event.type === 'Attachment' && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-800 dark:text-red-300">File Details</span>
                  </div>
                  <div>
                    <Link className='max-w-max block' href={event.details.attachment.url} target="_blank" rel="noopener noreferrer">
                      <div className="font-medium max-w-max">{event.details.attachment.name}.{event.details.attachment.type}</div>
                    </Link>
                    <div className="text-gray-600 dark:text-gray-400 mt-2">
                      Uploaded on {GlobalDate(event.details.attachment.uploadedAt)}
                    </div>
                  </div>
                </div>
              )}

              {event.type === 'Meeting' && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-purple-800 dark:text-purple-300">Meeting Details</span>
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-400 mb-1">Meeting Points</div>
                  <div className="font-medium">{event.details.meetingPoints}</div>

                </div>
              )}

              {event.type === 'Follow Up' && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-orange-800 dark:text-orange-300">Task Details</span>
                  </div>
                  <div>
                    <div className="font-medium">{event.details.followUp.subject}</div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Tag color={event.details.followUp.status === 'Closed' ? 'green' : 'blue'}>
                        {event.details.followUp.status}
                      </Tag>
                      <Tag color={event.details.followUp.priority === 'High' || event.details.followUp.priority === 'Urgent' ? 'red' : 'orange'}>
                        {event.details.followUp.priority}
                      </Tag>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        Due: {GlobalDate(event.details.followUp.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {event.type === 'Call' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-800 dark:text-blue-300">Call Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">Outcome</div>
                      {/* <Tag color={event.details.call.outcome === 'Approved Switch' ? 'green' : 'default'}>
                        {event.details.call.outcome}
                      </Tag> */}
                    </div>
                    <div>
                      <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">Duration</div>
                      {/* <div className="font-medium">{event.details.call.duration}</div> */}
                    </div>
                  </div>
                </div>
              )}

              {event.type === 'Email' && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-800 dark:text-green-300">Email Details</span>
                  </div>
                  <div>
                    <div className="text-xs text-green-700 dark:text-green-400 mb-1">Recipients</div>
                    {/* <div className="font-medium">{event.details.email.recipients.join(', ')}</div> */}
                  </div>
                </div>
              )}
              {
                event.type === "Reminder" && (
                  <div className="bg-gray-50 dark:bg-gray-700/20 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-800 dark:text-gray-300">Reminder Details</span>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mt-2">
                        {event.description}
                      </div>

                    </div>
                  </div>
                )
              }

              {event.type === 'Note' && (
                <div className="bg-gray-50 dark:bg-gray-700/20 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-3">
                    <Notebook className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-800 dark:text-gray-300">Note Details</span>
                  </div>
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-gray-600 dark:text-gray-400 mt-2">
                      {event.description.substring(0, 100)}
                      {event.description.length > 100 && '...'}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )
        }))}
      />
    </div>
  );
};

export default TimelineComponent;
