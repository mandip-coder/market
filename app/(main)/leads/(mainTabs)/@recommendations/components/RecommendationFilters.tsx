"use client";

import {
  useCountry,
  useICBs,
  useRegionalOffices,
} from "@/services/dropdowns/dropdowns.hooks";
import { Button, Col, Row, Select } from "antd";
import { RotateCw, X } from "lucide-react";
import { memo } from "react";

interface RecommendationFiltersProps {
  countryUUID?: string;
  regionalOfficeCode?: string;
  icbCode?: string;
  onCountryChange: (value: string | undefined) => void;
  onRegionalOfficeChange: (value: string | undefined) => void;
  onICBChange: (value: string | undefined) => void;
  onClear: () => void;
  onRefresh: () => void;
}

function RecommendationFilters({
  countryUUID,
  regionalOfficeCode,
  icbCode,
  onCountryChange,
  onRegionalOfficeChange,
  onICBChange,
  onClear,
  onRefresh,
}: RecommendationFiltersProps) {
  const { data: countries = [] } = useCountry();
  const { data: regionalOffices = [] } = useRegionalOffices();
  const { data: icbs = [] } = useICBs();

  const hasFilters = countryUUID || regionalOfficeCode || icbCode;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8} md={6}>
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

        <Col xs={24} sm={8} md={6}>
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

        <Col xs={24} sm={8} md={6}>
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
              styles={{
                popup: {
                  root: {
                    width: "400px",
                  },
                },
              }}
            />
          </div>
        </Col>

        <Col xs={24} sm={24} md={6}>
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
              icon={<RotateCw size={16} />}
              onClick={onRefresh}
              type="default"
            >
              Reload
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default memo(RecommendationFilters);
