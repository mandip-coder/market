'use client'

import { Input, Select, Button, Card, Slider, Space, Collapse } from 'antd';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Recommendation } from '../types';
import { useState } from 'react';

export interface FilterValues {
  hcoNames: string[];
  leadSources: string[];
  products: string[];
  contactPersons: string[];
  minDealCount: number;
  minRating: number;
}

interface RecommendationFiltersProps {
  data: Recommendation[];
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  resultCount: number;
}

export default function RecommendationFilters({
  data,
  filters,
  onFilterChange,
  resultCount,
}: RecommendationFiltersProps) {
  // Extract unique HCO names from data
  const hcoNames = Array.from(
    new Set(data.map((rec) => rec.hcoName))
  ).map((name) => ({
    label: name,
    value: name,
  }));

  // Extract unique lead sources from data
  const leadSources = Array.from(
    new Set(data.map((rec) => rec.leadSourceName))
  ).map((source) => ({
    label: source,
    value: source,
  }));

  // Extract unique products from data
  const products = Array.from(
    new Set(
      data.flatMap((rec) =>
        rec.products.map((p) => p.productName)
      )
    )
  ).map((product) => ({
    label: product,
    value: product,
  }));

  // Extract unique contact persons from data
  const contactPersons = Array.from(
    new Set(
      data.flatMap((rec) =>
        rec.contactPersons.map((c) => c.fullName)
      )
    )
  ).map((name) => ({
    label: name,
    value: name,
  }));

  // Get max deal count for slider
  const maxDealCount = Math.max(
    ...data.flatMap((rec) => rec.products.map((p) => p.dealCount)),
    20
  );

  const handleClearFilters = () => {
    onFilterChange({
      hcoNames: [],
      leadSources: [],
      products: [],
      contactPersons: [],
      minDealCount: 0,
      minRating: 0,
    });
  };

  const hasActiveFilters =
    filters.hcoNames.length > 0 ||
    filters.leadSources.length > 0 ||
    filters.products.length > 0 ||
    filters.contactPersons.length > 0 ||
    filters.minDealCount > 0 ||
    filters.minRating > 0;

  // Count active filters
  const activeFilterCount = 
    filters.hcoNames.length +
    filters.leadSources.length +
    filters.products.length +
    filters.contactPersons.length +
    (filters.minDealCount > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0);

  return (
      <Collapse
        defaultActiveKey={['filters']}
        expandIconPlacement="end"
        items={[
          {
            key: 'filters',
            label: (
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold m-0">Filters</h3>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                      {activeFilterCount} active
                    </span>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({resultCount} {resultCount === 1 ? 'result' : 'results'})
                  </span>
                </div>
                {hasActiveFilters && (
                  <Button
                    type="text"
                    size="small"
                    icon={<X size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearFilters();
                    }}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            ),
            children: (
              <div className="space-y-4 pt-4">
                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* HCO Name Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      HCO Names
                    </label>
                    <Select
                      mode="multiple"
                      placeholder="Select HCO names..."
                      value={filters.hcoNames}
                      onChange={(value) =>
                        onFilterChange({ ...filters, hcoNames: value })
                      }
                      options={hcoNames}
                      className="w-full"
                      allowClear
                      maxTagCount="responsive"
                    />
                  </div>

                  {/* Lead Source Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Lead Source
                    </label>
                    <Select
                      mode="multiple"
                      placeholder="Select lead sources..."
                      value={filters.leadSources}
                      onChange={(value) =>
                        onFilterChange({ ...filters, leadSources: value })
                      }
                      options={leadSources}
                      className="w-full"
                      allowClear
                      maxTagCount="responsive"
                    />
                  </div>

                  {/* Product Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Products
                    </label>
                    <Select
                      mode="multiple"
                      placeholder="Select products..."
                      value={filters.products}
                      onChange={(value) =>
                        onFilterChange({ ...filters, products: value })
                      }
                      options={products}
                      className="w-full"
                      allowClear
                      maxTagCount="responsive"
                    />
                  </div>

                  {/* Contact Person Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Contact Persons
                    </label>
                    <Select
                      mode="multiple"
                      placeholder="Select contact persons..."
                      value={filters.contactPersons}
                      onChange={(value) =>
                        onFilterChange({ ...filters, contactPersons: value })
                      }
                      options={contactPersons}
                      className="w-full"
                      allowClear
                      maxTagCount="responsive"
                    />
                  </div>

                  {/* Deal Count Range */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Min Deal Count: {filters.minDealCount}
                    </label>
                    <Slider
                      min={0}
                      max={maxDealCount}
                      value={filters.minDealCount}
                      onChange={(value) =>
                        onFilterChange({ ...filters, minDealCount: value })
                      }
                      tooltip={{ formatter: (value) => `${value} deals` }}
                    />
                  </div>

                  {/* Contact Rating */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Min Contact Rating: {filters.minRating.toFixed(1)}
                    </label>
                    <Slider
                      min={0}
                      max={5}
                      step={0.1}
                      value={filters.minRating}
                      onChange={(value) =>
                        onFilterChange({ ...filters, minRating: value })
                      }
                      tooltip={{ formatter: (value) => `${value?.toFixed(1)} stars` }}
                    />
                  </div>
                </div>
              </div>
            ),
          },
        ]}
        className='!mb-4'
      />
  );
}
