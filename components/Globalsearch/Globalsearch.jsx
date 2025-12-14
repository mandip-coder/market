'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Input, Spin, Tooltip, Empty, Button } from 'antd';
import { DashboardFilled, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { useHotkeys } from 'react-hotkeys-hook';
import debounce from 'lodash.debounce';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContextProvider';

const sampleData = [
  {
    title: 'Dashboard',
    description: 'View analytics and stats',
    icon: <DashboardFilled />,
    url: '/dashboard'
  },
  {
    title: 'Settings',
    description: 'Update profile, preferences',
    icon: <SettingOutlined />,
    url: '/settings'
  },
  {
    title: 'Reports',
    description: 'Generate and view reports',
    icon: <SearchOutlined />,
    url: '/reports'
  },
  {
    title: 'Users',
    description: 'Manage user accounts and roles',
    icon: <SettingOutlined />,
    url: '/users'
  },
  {
    title: 'Notifications',
    description: 'View alerts and system notifications',
    icon: <DashboardFilled />,
    url: '/notifications'
  },
  {
    title: 'Billing',
    description: 'Manage invoices and payment details',
    icon: <SearchOutlined />,
    url: '/billing'
  },
  {
    title: 'Integrations',
    description: 'Connect third-party apps and APIs',
    icon: <SettingOutlined />,
    url: '/integrations'
  },
  {
    title: 'Activity Logs',
    description: 'View user activities and system logs',
    icon: <DashboardFilled />,
    url: '/activity'
  },
  {
    title: 'Support',
    description: 'Get help and contact support',
    icon: <SearchOutlined />,
    url: '/support'
  },
  {
    title: 'Feedback',
    description: 'Send suggestions and feedback',
    icon: <DashboardFilled />,
    url: '/feedback'
  },
  {
    title: 'API Keys',
    description: 'Generate and manage API tokens',
    icon: <SettingOutlined />,
    url: '/api-keys'
  },
  {
    title: 'Themes',
    description: 'Switch between light and dark modes',
    icon: <DashboardFilled />,
    url: '/themes'
  },
  {
    title: 'Team',
    description: 'Collaborate with your healthcare',
    icon: <SearchOutlined />,
    url: '/team'
  },
  {
    title: 'Security',
    description: 'Update password and enable 2FA',
    icon: <SettingOutlined />,
    url: '/security'
  },
  {
    title: 'Audit',
    description: 'Review system audits and compliance',
    icon: <DashboardFilled />,
    url: '/audit'
  },
  {
    title: 'Projects',
    description: 'Organize and track ongoing projects',
    icon: <SearchOutlined />,
    url: '/projects'
  },
  {
    title: 'Tasks',
    description: 'Manage daily and upcoming tasks',
    icon: <DashboardFilled />,
    url: '/tasks'
  },
  {
    title: 'Announcements',
    description: 'View company-wide announcements',
    icon: <SearchOutlined />,
    url: '/announcements'
  }
];

const mockFetchResults = async (query) => {
  return new Promise((resolve) => {
    resolve(sampleData.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    ));
  });
};

const highlightText = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? <strong key={index}>{part}</strong> : part
  );
};

// Memoized search result item component
const SearchResultItem = React.memo(({
  item,
  index,
  isActive,
  query,
  onMouseEnter,
  onMouseDown
}) => (
  <motion.div
    id={`search-option-${index}`}
    role="option"
    variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, y: 0 },
    }}
    initial="hidden"
    animate="visible"
    layout
    transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
    exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
    tabIndex={-1}
    onMouseEnter={() => onMouseEnter(index)}
    onMouseDown={(e) => {
      e.preventDefault();
      onMouseDown(item);
    }}
    className={`flex items-start gap-3 px-4 py-2 cursor-pointer transition-colors duration-200 rounded-md ${isActive
        ? 'bg-gray-100 dark:bg-gray-700'
        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
  >
    <div className="pt-1 text-lg text-gray-500 dark:text-gray-300">
      {item.icon}
    </div>
    <div>
      <div className="text-sm font-medium text-gray-900 dark:text-white">
        {highlightText(item.title, query)}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {highlightText(item.description, query)}
      </div>
    </div>
  </motion.div>
));

// Memoized shortcut hint component
const ShortcutHint = React.memo(({ isMac }) => (
  <Tooltip title={`Shortcut: ${isMac ? '⌘ K' : 'Ctrl K'}`}>
    <span className="px-1.5 py-0.5 text-xs font-mono border rounded text-gray-500 border-gray-300 dark:text-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
      {isMac ? '⌘ K' : 'Ctrl + K'}
    </span>
  </Tooltip>
));

const GlobalSearchBar = () => {
  const { collapsed } = useSidebar();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef(null);
  const resultRefs = useRef([]);
  const containerRef = useRef(null);
  const router = useRouter();

  const isMac = useMemo(() =>
    typeof window !== 'undefined' && /mac/i.test(navigator.userAgent),
    []);

  // Memoized list variants
  const listVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  }), []);

  useEffect(() => {
    if (!showInput) {
      setQuery('')
      setOpenDropdown(false)
    }
  }, [showInput])

  // Memoized focus function
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Memoized search handler
  const handleSearch = useCallback(
    debounce(async (value) => {
      if (!value) {
        setResults([]);
        setOpenDropdown(false);
        return;
      }

      setLoading(true);
      const res = await mockFetchResults(value);
      setResults(res);
      setOpenDropdown(true);
      setActiveIndex(-1);
      setLoading(false);
    }, 300),
    []
  );

  // Memoized change handler
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  }, [handleSearch]);

  // Memoized select handler
  const handleSelect = useCallback((item) => {
    setQuery('');
    setOpenDropdown(false);
    router.push(item.url);
  }, [router]);

  // Memoized keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setShowInput(false);
    }
    if (!openDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev - 1 < 0 ? results.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }
  }, [openDropdown, results.length, activeIndex, handleSelect]);

  // Memoized show input handler
  const handleShowInput = useCallback(() => {
    setShowInput(true);
    setTimeout(focusInput, 0);
  }, [focusInput]);

  
  useEffect(() => {
    if (
      activeIndex >= 0 &&
      resultRefs.current[activeIndex] &&
      resultRefs.current[activeIndex].scrollIntoView
    ) {
      resultRefs.current[activeIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(false);
        setShowInput(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut
  useHotkeys('ctrl+k', (e) => {
    e.preventDefault();
    if (!showInput) {
      setShowInput(true);
    }
    setTimeout(focusInput, 0);
  }, [showInput, focusInput]);

  // Memoized input props
  const inputProps = useMemo(() => ({
    ref: inputRef,
    placeholder: "Search ...",
    value: query,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onFocus: () => query && setOpenDropdown(true),
    prefix: <SearchOutlined className="text-gray-400 dark:text-gray-300" />,
    suffix: (
      <div className="flex items-center gap-2">
        {loading && <Spin size="small" />}
        <ShortcutHint isMac={isMac} />
      </div>
    ),
  }), [query, handleChange, handleKeyDown, loading, isMac]);

  return (
    <div ref={containerRef} className="relative w-full flex items-center justify-center">
      <AnimatePresence mode='wait'>
        {collapsed && showInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute z-50 top-0 left-1 w-60 h-full'
          >
            <Input
              {...inputProps}
              className='!shadow-lg'
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!collapsed ? (
        <Input
          {...inputProps}
          className='!bg-transparent'
        />
      ) : (
        <Tooltip placement="right" title={`Search (${isMac ? '⌘ K' : 'Ctrl + K'})`}>
          <Button
            variant='outlined'
            shape={showInput ? 'default' : 'default'}
            icon={<SearchOutlined className="text-gray-400 dark:text-gray-300" />}
            onClick={handleShowInput}
          />
        </Tooltip>
      )}

      <AnimatePresence mode="wait">
        {openDropdown && (
          <motion.div
            id="global-search-listbox"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={listVariants}
            className={`absolute max-h-[40vh] overflow-auto scroll-hide min-w-[300px] max-w-[20vw] left-0 right-0 z-50 bg-sidebar-bg dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${collapsed ? "top-[110%]" : "top-[100%]"
              }`}
            style={{ transformOrigin: 'top center', perspective: 800 }}
          >
            <AnimatePresence mode="wait">
              {results.length > 0 ? (
                results.map((item, index) => (
                  <SearchResultItem
                    key={item.title}
                    item={item}
                    index={index}
                    isActive={activeIndex === index}
                    query={query}
                    onMouseEnter={setActiveIndex}
                    onMouseDown={handleSelect}
                    ref={(el) => (resultRefs.current[index] = el)}
                  />
                ))
              ) : (
                <div className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No results found"
                  />
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearchBar;