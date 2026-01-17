"use client";

import {
  useCountry,
  useHCOTypes,
  useICBs,
  useRegionalOffices,
} from "@/services/dropdowns/dropdowns.hooks";
import { Button, Col, Input, Row, Select } from "antd";
import { RefreshCw, Search, X } from "lucide-react";
import { memo } from "react";

interface HealthcareFiltersProps {
  searchQuery: string;
  countryUUID?: string;
  regionalOfficeCode?: string;
  icbCode?: string;
  typeFilter?: string;
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string | undefined) => void;
  onRegionalOfficeChange: (value: string | undefined) => void;
  onICBChange: (value: string | undefined) => void;
  onTypeChange: (value: string | undefined) => void;
  onClear: () => void;
  onRefresh: () => void;
  isRefetching: boolean;
}

function HealthcareFilters({
  searchQuery,
  countryUUID,
  regionalOfficeCode,
  icbCode,
  typeFilter,
  onSearchChange,
  onCountryChange,
  onRegionalOfficeChange,
  onICBChange,
  onTypeChange,
  onClear,
  onRefresh,
  isRefetching
}: HealthcareFiltersProps) {
  const { data: countries = [] } = useCountry();
  const { data: regionalOffices = [] } = useRegionalOffices();
  const { data: icbs = [] } = useICBs();
  const { data: hcoTypes = [] } = useHCOTypes();

  const hasFilters =
    searchQuery || countryUUID || regionalOfficeCode || icbCode || typeFilter;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4 sticky top-0 z-10">
      <Row gutter={[16, 16]} align="middle">
        {/* Search Input */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search healthcares..."
              value={searchQuery}
              allowClear
              prefix={<Search className="h-4 w-4 text-slate-400" />}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
        </Col>

        {/* Country Filter */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Country
            </label>
            <Select
              allowClear
              value={countryUUID}
              placeholder="Select country..."
              options={countries.map((c) => ({
                label: c.countryName,
                value: c.countryUUID,
              }))}
              showSearch={{
                optionFilterProp: "label",
              }}
              onChange={onCountryChange}
              className="w-full"
            />
          </div>
        </Col>

        {/* Region Filter */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Region
            </label>
            <Select
              allowClear
              value={regionalOfficeCode}
              placeholder="Select region..."
              options={regionalOffices.map((r) => ({
                label: r.regionalOfficeName,
                value: r.regionalOfficeCode,
              }))}
              showSearch={{
                optionFilterProp: "label",
              }}
              onChange={onRegionalOfficeChange}
              className="w-full"
            />
          </div>
        </Col>

        {/* ICB Filter */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              ICB
            </label>
            <Select
              allowClear
              value={icbCode}
              placeholder="Select ICB..."
              options={icbs.map((i) => ({
                label: i.icbName,
                value: i.icbCode,
              }))}
              showSearch={{
                optionFilterProp: "label",
              }}
              onChange={onICBChange}
              className="w-full"
            />
          </div>
        </Col>

        {/* Type Filter */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Type
            </label>
            <Select
              allowClear
              placeholder="Select Type"
              options={hcoTypes?.map((type) => ({
                label: type.hcoTypeName,
                value: type.hcoTypeUUID,
              }))}
              showSearch={{
                optionFilterProp: "label",
              }}
              value={typeFilter || undefined}
              onChange={onTypeChange}
              className="w-full"
            />
          </div>
        </Col>

        {/* Action Buttons */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Actions
          </label>
          <div className="flex gap-2 items-end h-full pb-1">
            <Button
              icon={<X size={16} />}
              onClick={onClear}
              disabled={!hasFilters}
            >
              Clear
            </Button>
            <Button
              icon={<RefreshCw size={16} className={`${isRefetching ? 'animate-spin' : ''}`}/>}
              onClick={onRefresh}
              type="default"
            >
              Refresh
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default memo(HealthcareFilters);
