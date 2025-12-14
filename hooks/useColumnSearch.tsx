"use client";
import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRef } from "react";

export default function useColumnSearch() {
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys: any, confirm: any) => confirm();

  const handleReset = (clearFilters: any) => clearFilters();

  return (dataIndex:string, placeholder:string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }:any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${placeholder}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <div className="flex gap-1">
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => handleSearch(selectedKeys, confirm)}
            size="small"
            className="w-full"
          >Search</Button>
          <Button className="w-full" onClick={() => handleReset(clearFilters)} size="small">Reset</Button>
        </div>
      </div>
    ),
    filterIcon: (filtered:boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
  });
}