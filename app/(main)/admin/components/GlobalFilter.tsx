"use client";

import React from "react";
import { DatePicker, Tag } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

dayjs.extend(quarterOfYear);

const { RangePicker } = DatePicker;

interface GlobalFilterProps {
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  onDateRangeChange?: (dates: [Dayjs | null, Dayjs | null] | null) => void;
}

const GlobalFilter: React.FC<GlobalFilterProps> = ({ 
  startDate,
  endDate,
  onDateRangeChange
}) => {
  const rangePresets: {
    label: string;
    value: [Dayjs, Dayjs];
  }[] = [
    { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
    { label: 'This Week', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
    { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'This Quarter', value: [dayjs().startOf('quarter'), dayjs().endOf('quarter')] },
    { label: 'This Year', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
    { label: 'Last 7 Days', value: [dayjs().subtract(7, 'day'), dayjs()] },
    { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
    { label: 'Last 90 Days', value: [dayjs().subtract(90, 'day'), dayjs()] },
    { label: 'Last Year', value: [dayjs().subtract(1, 'year').startOf('year'), dayjs().subtract(1, 'year').endOf('year')] },
  ];

  // Determine which filter is currently active
  const getActiveFilterLabel = (): string => {
    if (!startDate || !endDate) return "Select Filter";

    // Check each preset to see if it matches
    for (const preset of rangePresets) {
      const [presetStart, presetEnd] = preset.value;
      if (
        startDate.isSame(presetStart, 'day') && 
        endDate.isSame(presetEnd, 'day')
      ) {
        // Add additional context based on the preset type
        switch (preset.label) {
          case 'Today':
            return `Today - ${startDate.format('MMMM D, YYYY')}`;
          case 'This Week':
            return `This Week - ${startDate.format('MMM D')} to ${endDate.format('MMM D, YYYY')}`;
          case 'This Month':
            return `This Month - ${startDate.format('MMMM YYYY')}`;
          case 'This Quarter':
            return `This Quarter - Q${startDate.quarter()} ${startDate.format('YYYY')}`;
          case 'This Year':
            return `This Year - ${startDate.format('YYYY')}`;
          case 'Last Year':
            return `Last Year - ${startDate.format('YYYY')}`;
          default:
            return preset.label;
        }
      }
    }

    // If no preset matches, it's a custom range
    return `Custom Range`;
  };

  return (
    <div className="flex justify-end items-end gap-2 mb-4">
      <Tag color="blue" style={{ fontSize: '14px', padding: '6.5px 12px',borderRadius: '14px' }}>
        {getActiveFilterLabel()}
      </Tag>
      <RangePicker 
        value={[startDate || null, endDate || null]}
        onChange={(dates) => onDateRangeChange?.(dates as any)}
        presets={rangePresets}
        format="YYYY-MM-DD"
        style={{ width: 300 }}
      />
    </div>
  );
};

export default GlobalFilter;
