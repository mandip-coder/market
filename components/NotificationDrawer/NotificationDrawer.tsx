import { Drawer, Button, Typography, Avatar, Tag, Badge, Segmented, Flex, Popconfirm } from 'antd';
import { dataSource } from '@/shared/constants/datasource';
import AppScrollbar from '../AppScrollBar';
import { Bell, CheckCircle, XCircle, Info, AlertTriangle, Mail, Settings, Star, Check, Trash, Loader2 } from 'lucide-react';
import React, { useState, useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence, useMotionValue, useAnimation, useTransform } from 'motion/react';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system' | 'message' | 'update';
type NotificationAction = {
  label: string;
  type: "primary" | "default" | "dashed" | "text" | "link";
  danger?: boolean;
  icon?: LucideIcon;
  onClick: () => void;
};
type NotificationItem = {
  id: number;
  type: NotificationType;
  icon?: LucideIcon;
  title: string;
  message: string;
  date: string;
  isRead?: boolean;
  isPriority?: boolean;
  actions?: NotificationAction[];
  category?: string;
  avatar?: string;
};
type segments = 'all' | 'unread' | 'system' | 'case' | 'regulatory' | 'signal';

// Helper functions
const getNotificationIcon = (type: NotificationType, icon?: LucideIcon): LucideIcon => {
  if (icon) return icon;
  switch (type) {
    case 'success': return CheckCircle;
    case 'error': return XCircle;
    case 'warning': return AlertTriangle;
    case 'system': return Settings;
    case 'message': return Mail;
    case 'update': return Star;
    default: return Info;
  }
};

const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'success': return 'bg-green-500';
    case 'error': return 'bg-red-500';
    case 'warning': return 'bg-yellow-500';
    case 'system': return 'bg-purple-500';
    case 'message': return 'bg-blue-500';
    case 'update': return 'bg-indigo-500';
    default: return 'bg-cyan-500';
  }
};

const getTagColor = (type: NotificationType): string => {
  switch (type) {
    case 'success': return 'green';
    case 'error': return 'red';
    case 'warning': return 'orange';
    case 'system': return 'purple';
    case 'message': return 'blue';
    case 'update': return 'indigo';
    default: return 'cyan';
  }
};

const groupNotificationsByDate = (items: NotificationItem[]) => {
  const groups: Record<string, NotificationItem[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  items.forEach(notification => {
    const date = new Date(notification.date);
    let groupKey = '';
    if (date.toDateString() === today.toDateString()) groupKey = 'Today';
    else if (date.toDateString() === yesterday.toDateString()) groupKey = 'Yesterday';
    else groupKey = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });

    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(notification);
  });
  return groups;
};

const DraggableNotificationItem = React.memo(({
  item,
  isDeleting,
  onDelete,
  handleActionClick,
}: {
  item: NotificationItem;
  isDeleting: boolean;
  onDelete: (id: number) => void;
  handleActionClick: (action: NotificationAction, id: number) => void;
}) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const deleteBackgroundOpacity = useTransform(x, [0, 100], [0, 1]);
  const trashIconScale = useTransform(x, [0, 100], [0.5, 1]);

  const handleDragEnd = () => {
    if (isDeleting) return;
    controls.start({ x: x.get() > 80 ? 100 : 0 });
  };

  const Icon = getNotificationIcon(item.type, item.icon);
  const iconBg = getNotificationColor(item.type);
  const tagColor = getTagColor(item.type);

  return (
    <motion.div layout transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }} className="relative overflow-hidden">
      <motion.div className="absolute inset-0 rounded-lg z-0 flex items-center justify-start px-10 from-red-500 to-gray-800 bg-gradient-to-r" style={{ opacity: deleteBackgroundOpacity }}>
        <div className="flex flex-col items-center justify-start">
          <motion.div style={{ scale: trashIconScale }} className="flex items-center justify-center">
            {isDeleting ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 size={24} className="text-white" />
              </motion.div>
            ) : (
              <div onClick={() => onDelete(item.id)} className='cursor-pointer'>
                <Trash size={24} className="text-white" />
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        drag={!isDeleting ? "x" : false}
        dragConstraints={{ left: 0, right: 100 }}
        dragElastic={0.1}
        dragDirectionLock
        dragPropagation={false}
        style={{ x }}
        animate={controls}
        whileTap={{ cursor: "grabbing" }}
        onDragEnd={handleDragEnd}
        className={`relative z-10 rounded-lg border bg-white dark:bg-black border-border-header dark:border-dark-border ${!item.isRead ? 'border-l-2 border-l-blue-500 dark:border-l-gray-500' : ''}`}
      >
        <div className="p-2.5">
          <div className="flex gap-2.5">
            <div className="flex-shrink-0">
              {item.avatar ? (
                <Avatar size={32} src={item.avatar} />
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBg} shadow-sm`}>
                  <Icon size={14} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Typography.Text strong className={`text-xs ${!item.isRead ? 'font-bold' : ''}`}>
                      {item.title}
                    </Typography.Text>
                  </div>
                  <Typography.Paragraph type="secondary" className="block text-xs mb-1 w-full" ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                    {item.message}
                  </Typography.Paragraph>
                  {!item.isRead && <div className="w-2 h-2 rounded-full absolute bottom-2 left-2 bg-blue-500"></div>}
                </div>
                {item.category && <Tag color={tagColor} className="text-xs">{item.category}</Tag>}
              </div>
              {(item.actions?.length || item.date) && (
                <div className="mt-1.5 flex justify-between items-center">
                  <Typography.Text type="secondary" className="text-xs">
                    {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography.Text>
                  {item.actions?.length ? (
                    <div className="flex gap-1.5">
                      {item.actions.map((action, key) => (
                        <Button
                          key={key}
                          size="small"
                          type={action.type}
                          danger={action.danger}
                          icon={action.icon ? <action.icon size={12} /> : undefined}
                          onClick={(e) => { e.stopPropagation(); handleActionClick(action, item.id); }}
                          className="text-xs h-6 px-2"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  ) : <div />}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

const NotificationDrawer = ({ open, close }: { open: boolean, close: () => void }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(dataSource as NotificationItem[]);
  const [activeTab, setActiveTab] = useState<segments>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') return notifications.filter(n => !n.isRead);
    if (activeTab !== 'all') return notifications.filter(n => n.category === activeTab);
    return notifications;
  }, [activeTab, notifications]);

  const notificationGroups = useMemo(() => groupNotificationsByDate(filteredNotifications), [filteredNotifications]);

  const counts = useMemo(() => ({
    unread: notifications.filter(n => !n.isRead).length,
    system: notifications.filter(n => n.category === 'system' && !n.isRead).length,
    case: notifications.filter(n => n.category === 'case' && !n.isRead).length,
    regulatory: notifications.filter(n => n.category === 'regulatory' && !n.isRead).length,
    signal: notifications.filter(n => n.category === 'signal' && !n.isRead).length,
  }), [notifications]);

  const handleActionClick = useCallback((action: NotificationAction, id: number) => {
    try {
      if (typeof action.onClick === 'function') {
        action.onClick();
        if (!notifications.find(n => n.id === id)?.isRead) {
          onMarkAsRead(id);
        }
      }
    } catch (error) {
      console.error('Action click error:', error);
    }
  }, [notifications]);

  const onClearAll = useCallback(() => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
      pending: 'Clearing notifications...',
      success: 'Notifications cleared successfully!',
    }).then(() => {
      if (activeTab === 'all') setNotifications([]);
      else if (activeTab === 'unread') setNotifications(prev => prev.filter(n => n.isRead));
      else setNotifications(prev => prev.filter(n => n.category !== activeTab));
    });
  }, [activeTab]);

  const onMarkAsRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const onMarkAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const handleDeleteNotification = useCallback((id: number) => {
    if (deletingId === id) return;
    setDeletingId(id);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setDeletingId(null);
    }, 2000);
  }, [deletingId]);

  // Segment options
  const segmentOptions = useMemo(() => [
    { label: <div className="flex items-center justify-center gap-1.5"><span>All</span></div>, value: 'all' },
    {
      label: <div className="flex items-center justify-center gap-1.5">
        <span>Unread</span>
        {counts.unread > 0 && <Badge count={counts.unread} size="small" />}
      </div>,
      value: 'unread'
    },
    {
      label: <div className="flex items-center justify-center gap-1.5">
        <span>System</span>
        {counts.system > 0 && <Badge count={counts.system} size="small" />}
      </div>,
      value: 'system'
    },
    {
      label: <div className="flex items-center justify-center gap-1.5">
        <span>Case</span>
        {counts.case > 0 && <Badge count={counts.case} size="small" />}
      </div>,
      value: 'case'
    },
    {
      label: <div className="flex items-center justify-center gap-1.5">
        <span>Regulatory</span>
        {counts.regulatory > 0 && <Badge count={counts.regulatory} size="small" />}
      </div>,
      value: 'regulatory'
    },
    {
      label: <div className="flex items-center justify-center gap-1.5">
        <span>Signal</span>
        {counts.signal > 0 && <Badge count={counts.signal} size="small" />}
      </div>,
      value: 'signal'
    },
  ], [counts]);

  return (<>
    <Flex align="center" justify="space-between">
      Notifications
      <Badge
        count={counts.unread}
      />
    </Flex>
    <Drawer
      title={
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 flex items-center justify-center rounded-sm border border-border-header dark:border-dark-border">
                <Bell size={16} className="text-secondary" />
              </div>
            </div>
            <Typography.Text className="text-gray-800 text-lg font-semibold">
              Notifications
            </Typography.Text>
          </div>
          {notifications.length > 0 && (
            <Popconfirm
              title="Confirm!"
              placement="topLeft"
              description={<div>
                Are you sure to clear{" "}
                <strong>
                  {activeTab === "all" ? "All" : "only " + activeTab.toUpperCase()}
                </strong>{" "}
                notifications?
              </div>
              }
              okText="Yes"
              cancelText="No"
              onConfirm={onClearAll}
            >
              <Button  htmlType="button" variant="filled" color="red" icon={<Trash size={14} />} />
            </Popconfirm>
          )}
        </div>
      }
      placement="right"
      open={open}
      keyboard
      closeIcon={false}
      onClose={close}
      footer={
        <div className="flex justify-between items-center p-4">
          <Button
            icon={<Check size={14} />}
            onClick={onMarkAllAsRead}
            disabled={counts.unread === 0}
            className="flex items-center gap-1 text-sm"
          >
            Mark all as read
          </Button>
          <Button type="primary" onClick={close}>Close</Button>
        </div>
      }
      size={"large"}
      styles={{ header: { padding: 0 }, footer: { padding: 0 }, body: { padding: 0 } }}
    >
      {notifications.length > 0 && (
        <div className='p-2 flex items-center justify-center'>
          <Segmented
            size='small'
            value={activeTab}
            onChange={(value) => setActiveTab(value as segments)}
            options={segmentOptions}
          />
        </div>
      )}
      <AppScrollbar className='h-[calc(100vh-170px)]'>
        {Object.keys(notificationGroups).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 mx-4 rounded-lg my-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Bell size={24} className="text-gray-400" />
            </div>
            <Typography.Text className="text-base font-medium text-gray-700">No notifications</Typography.Text>
            <Typography.Text type="secondary" className="text-center max-w-xs text-sm">
              You're all caught up! We'll notify you when something new arrives.
            </Typography.Text>
          </div>
        ) : (
          <div>
            {Object.entries(notificationGroups).map(([date, items]) => (
              <div key={date}>
                <div className="sticky top-0 z-[100]">
                  <div className="flex items-center justify-center px-3 bg-white dark:bg-black py-2 border-b border-border-header dark:border-dark-border">
                    <Typography.Text className="font-bold text-sm">{date}</Typography.Text>
                  </div>
                </div>
                <div className="space-y-2 px-3 py-2">
                  <AnimatePresence mode='popLayout'>
                    {items.map((item) => (
                      <DraggableNotificationItem
                        key={item.id}
                        item={item}
                        isDeleting={deletingId === item.id}
                        onDelete={handleDeleteNotification}
                        handleActionClick={handleActionClick}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppScrollbar>
    </Drawer>
  </>
  );
};

export default NotificationDrawer;