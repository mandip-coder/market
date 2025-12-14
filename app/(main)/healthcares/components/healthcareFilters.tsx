import { Input, Select } from "antd";
import { Search } from "lucide-react";
import { HEALTHCARE_TYPES, RAG_RATINGS } from "../lib/constants";
import { HealthcareFilters as Hfilters } from "../lib/types";

interface HealthcareFiltersProps {
  filters: Hfilters;
  onFilterChange: (key: keyof Hfilters, value: string) => void;
}

export const HealthcareFilters = ({ filters, onFilterChange }: HealthcareFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <Input
        type="text"
        placeholder="Search healthcares..."
        value={filters.searchQuery}
        className="max-w-85"
        prefix={<Search className="h-4 w-4 text-slate-400" />}
        onChange={(e) => onFilterChange('searchQuery', e.target.value)}
        allowClear
      />

      <div className="flex gap-3">
        <Select
          value={filters.typeFilter || "Filter Type"}
          onChange={(value) => onFilterChange('typeFilter', value === "All" ? "" : value)}
          style={{ width: 180 }}
          allowClear
          placeholder="All Types"
          options={HEALTHCARE_TYPES.map(t => ({
            label: t,
            value: t
          }))}
      />


      </div>
    </div>
  );
};